import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

import {
  extractValidTitle,
  getRealLink,
  rawUnduplicatedFeeds,
  rawUnduplicatedRatio,
} from "./utils";
import type { IRssResponse, IRssResponseItem } from "./types";
import type { Database } from "supabase-type";

const xml2json = new XMLParser();

const supabaseAnonClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const supabaseServiceRoleClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const clippedNews = async (prevTitles: string[], categoryTitle: string) => {
  const newFeeds: IRssResponseItem[] = [];

  const { data } = await axios.get(
    `https://news.google.com/rss/search?q=${categoryTitle}when:1h&hl=ko`
  );

  const parseData = xml2json.parse(data) as IRssResponse;

  const items = parseData?.rss?.channel?.item;

  if (Array.isArray(items)) {
    // Remove publisher from title
    const removeSourceItems = items.map((item) => ({
      ...item,
      title: extractValidTitle(item.title, item.source),
    }));

    // Duplicate check with saved titles
    const duplicatedCheckByNewFeed = removeSourceItems.filter(
      (feed) => rawUnduplicatedRatio(prevTitles, feed.title) < 0.4
    );

    // Duplicate check by text - Considered redundant if matched more than 40%
    newFeeds.push(...rawUnduplicatedFeeds(duplicatedCheckByNewFeed, 0.4).slice(0, 1));
  } else if (items) {
    items.title = extractValidTitle(items.title, items.source);

    if (rawUnduplicatedRatio(prevTitles, items.title) < 0.4) {
      newFeeds.push(items);
    }
  }

  return newFeeds;
};

export const job = async () => {
  try {
    // Read Category List
    const categories = await supabaseAnonClient.from("Category").select("*");

    if (categories.error) throw new Error(categories.error.message);
    if (categories.data.length === 0) return;

    for (const category of categories.data) {
      // Read the list of saved feeds by category
      const prevFeeds = await supabaseAnonClient
        .from("Feed")
        .select("*")
        .eq("category_id", category.id)
        .order("id", { ascending: false })
        .limit(3);

      if (prevFeeds.error) throw new Error(prevFeeds.error.message);

      const prevTitles = prevFeeds.data.map((feed) => feed?.title || "");

      // Clip new non-overlapping news against saved feed titles
      const newFeeds = await clippedNews(prevTitles, category.title);

      if (newFeeds.length === 0) {
        console.log(`There is no clipping '${category.title}' news`);
        return;
      }

      const query = [];
      for (const feed of newFeeds) {
        const realLink = await getRealLink(feed.link, axios.get);

        query.push({
          title: feed.title,
          publisher: feed.source || "-",
          link: realLink,
          category_id: category.id,
        });
      }

      // Insert new news data
      const insertedFeed = await supabaseServiceRoleClient.from("Feed").insert(query).select();

      if (insertedFeed.error) throw new Error(insertedFeed.error.message);

      console.log(`${insertedFeed.data?.length} new '${category.title}' news has been added.`);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      console.log("AxiosError : ", error.response.status, error.response?.data.message);
    } else if (error instanceof Error) {
      console.log("Error : ", error.message);
    } else {
      console.log("Unkown Error : ", error);
    }
  }
};

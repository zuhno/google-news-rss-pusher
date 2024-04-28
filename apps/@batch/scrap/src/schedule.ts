import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { XMLParser } from "fast-xml-parser";

import {
  extractValidTitle,
  getOpengraphImage,
  getRealLink,
  rawUnduplicatedFeeds,
  rawUnduplicatedRatio,
} from "./utils";
import type { IFeedInsertData, IFeedViewInsertData, IRssResponse, IRssResponseItem } from "./types";
import type { Database } from "supabase-type";
import { randomUUID } from "crypto";
import { scheduleJob, gracefulShutdown, RecurrenceRule } from "node-schedule";

const xml2json = new XMLParser();

const supabaseAnonClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const supabaseServiceRoleClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "text/html",
  },
});

const clippedNews = async (prevTitles: string[], categoryTitle: string, banList: string[]) => {
  const newFeeds: IRssResponseItem[] = [];
  const banListStr = banList.map((word) => "-" + word).join(" ");
  const excludes = banListStr ? " " + banListStr : "";

  const { data } = await axios.get(
    `https://news.google.com/rss/search?q=${categoryTitle} when:1h${excludes}&hl=ko&gl=KR&ceid=KR:ko`
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

const job = async () => {
  try {
    // Read Category List
    const categories = await supabaseAnonClient.from("Category").select("*");

    if (categories.error) throw new Error(categories.error.message);
    if (categories.data.length === 0) return;

    for (const category of categories.data) {
      // Inactive category(a.k.a keyword) skip
      if (!category.active) {
        console.log(`${category.title} is inactive.`);
        continue;
      }

      // Read the list of saved feeds by category
      const prevFeeds = await supabaseAnonClient
        .from("Feed")
        .select("*")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (prevFeeds.error) throw new Error(prevFeeds.error.message);

      const prevTitles = prevFeeds.data.map((feed) => feed?.title || "");

      // Clip new non-overlapping news against saved feed titles
      const newFeeds = await clippedNews(prevTitles, category.title, category.ban_list ?? []);

      if (newFeeds.length === 0) {
        console.log(`There is no clipping '${category.title}' news`);
        continue;
      }

      const feedQuery: IFeedInsertData[] = [];
      const feedViewQuery: IFeedViewInsertData[] = [];
      for (const feed of newFeeds) {
        const id = randomUUID();
        const realLink = await getRealLink(feed.link, axiosInstance.get);
        const opengraphImage = await getOpengraphImage(realLink, axiosInstance.get);

        const encodedUrl = btoa(encodeURI(realLink));
        const countLink = `${process.env.SERVER_BASE_URL}/temp/news/${id}?redirect=${encodedUrl}`;

        feedQuery.push({
          id,
          title: feed.title,
          publisher: feed.source || "-",
          link: realLink,
          count_link: countLink,
          thumbnail: opengraphImage,
          category_id: category.id,
        });

        feedViewQuery.push({
          id,
          view: 0,
        });
      }

      const [insertedFeeds, insertedFeedViews] = await Promise.all([
        supabaseServiceRoleClient.from("Feed").insert(feedQuery).select(),
        supabaseServiceRoleClient.from("FeedView").insert(feedViewQuery).select(),
      ]);

      if (insertedFeeds.error) throw new Error(insertedFeeds.error.message);
      if (insertedFeedViews.error) throw new Error(insertedFeedViews.error.message);

      console.log(`${insertedFeeds.data?.length} new '${category.title}' news has been added.`);
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

export const scheduler = () => {
  const rule = new RecurrenceRule();

  rule.hour = [2, 5, 8, 11, 14, 17, 20, 23];
  rule.minute = 55;
  rule.tz = "Asia/Seoul";

  console.log("Scheduler is Running 🥳");

  // Called every 55 minutes of every hour
  scheduleJob(rule, async () => {
    await job();
  });

  // Graceful Shutdown
  process.on("SIGINT", function () {
    gracefulShutdown().then(() => {
      console.log("succeed graceful shutdown 😎");
      process.exit(0);
    });
  });
};

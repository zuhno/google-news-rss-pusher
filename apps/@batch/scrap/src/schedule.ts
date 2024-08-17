import axios from "axios";
import { randomUUID } from "crypto";
import { scheduleJob, gracefulShutdown, RecurrenceRule } from "node-schedule";
import puppeteer from "puppeteer";

import {
  extractValidTitle,
  getOpengraphImage,
  getRealLink,
  rawUnduplicatedFeeds,
  rawUnduplicatedRatio,
} from "./utils";
import type { IFeedInsertData, IFeedViewInsertData, IRssResponse, IRssResponseItem } from "./types";
import { axiosInstance, supabaseAnonClient, supabaseServiceRoleClient, xml2json } from "./config";

const clippedNews = async ({
  prevTitles,
  newFeedTitles,
  categoryTitle,
  banList,
  pastDate,
}: {
  prevTitles: string[];
  newFeedTitles: string[];
  categoryTitle: string;
  banList: string[];
  pastDate: string;
}) => {
  const newFeeds: IRssResponseItem[] = [];
  const banListStr = banList.map((word) => "-" + word).join(" ");
  const excludes = banListStr ? " " + banListStr : "";
  const encodedTitle = encodeURIComponent(categoryTitle);

  const { data } = await axios.get(
    `https://news.google.com/rss/search?q=${encodedTitle} when:${pastDate}${excludes}&hl=ko&gl=KR&ceid=KR:ko`
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
      (feed) => rawUnduplicatedRatio([...newFeedTitles, ...prevTitles], feed.title) < 0.4
    );

    // Duplicate check by text - Considered redundant if matched more than 40%
    newFeeds.push(...rawUnduplicatedFeeds(duplicatedCheckByNewFeed, 0.4).slice(0, 1));
  } else if (items) {
    items.title = extractValidTitle(items.title, items.source);

    if (rawUnduplicatedRatio([...newFeedTitles, ...prevTitles], items.title) < 0.4) {
      newFeeds.push(items);
    }
  }

  return newFeeds;
};

const job = async () => {
  console.log("Browser 🅾 🅿︎ 🅴 🅽 .");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Read Category List
    const categories = await supabaseAnonClient.from("Category").select("*").eq("active", true);

    if (categories.error) throw new Error(categories.error.message);
    if (categories.data.length === 0) return;

    const newFeedTitles = [];

    for (const category of categories.data) {
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
      const newFeeds = await clippedNews({
        prevTitles,
        newFeedTitles,
        categoryTitle: category.title,
        banList: category.ban_list ?? [],
        pastDate: category.pastDate,
      });

      if (newFeeds.length === 0) {
        console.log(`There is no clipping '${category.title}' news`);
        continue;
      }

      // check for duplicated titles on current schedule job
      newFeedTitles.push(...newFeeds.map((feed) => feed?.title || ""));

      const feedQuery: IFeedInsertData[] = [];
      const feedViewQuery: IFeedViewInsertData[] = [];

      for (const feed of newFeeds) {
        const id = randomUUID();
        const realLink = await getRealLink(feed.link, page);
        let opengraphImage = await getOpengraphImage(realLink, axiosInstance.get);
        if (!opengraphImage) opengraphImage = await getOpengraphImage(feed.link, axiosInstance.get);

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

        feedViewQuery.push({ id, view: 0 });
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
  } finally {
    await browser.close();
    console.log("Browser 🅲 🅻 🅾 🆂 🅴 .");
  }
};

export const scheduler = () => {
  const rule = new RecurrenceRule();

  rule.hour = [2, 5, 8, 11, 14, 17, 20, 23];
  rule.minute = 55;
  rule.tz = "Asia/Seoul";

  console.log("Scheduler is Running 🥳");

  job();
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

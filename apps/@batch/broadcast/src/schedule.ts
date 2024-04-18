import axios from "axios";
import { constants } from "node:http2";
import { createClient } from "@supabase/supabase-js";
import { RecurrenceRule, gracefulShutdown, scheduleJob } from "node-schedule";

import { sleep } from "./utils";
import { Categories, FeedMap, IntervalTimeEnum, Releases } from "./types";
import type { Database } from "supabase-type";

const supabaseAnonClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const supabaseServiceRoleClient = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const subscriber2Inactive = async (appId: string, chId: string) => {
  await supabaseServiceRoleClient
    .from("Subscriber")
    .update({ active: false, deactive_reason: "NOT_FOUND" })
    .eq("app_id", appId)
    .eq("ch_id", chId);
};

const postWebhook = async (chUrl: string, text: string) => {
  await axios.post(chUrl, { text }, { headers: { "Content-Type": "application/json" } });
};

const updateRelease = async (payload: Releases) => {
  const upsertedRelease = await supabaseServiceRoleClient.from("Release").upsert(payload).select();
  if (upsertedRelease.error) throw new Error(upsertedRelease.error.message);
};

const makeText = (categoryIds: number[], feedMap: FeedMap) => {
  return categoryIds
    .map((category) =>
      feedMap[category]
        ? `<${feedMap[category].link}|*${feedMap[category].title}*>\n📍${
            feedMap[category].category_title || "-"
          } 🗞️ ${feedMap[category].publisher || "-"}`
        : ""
    )
    .filter((msg) => !!msg)
    .join("\n");
};

const getFeedMap = async (releases: Releases, categories: Categories) => {
  const feedMap: FeedMap = {};

  for (const category of categories) {
    const feed = await supabaseAnonClient
      .from("Feed")
      .select("*")
      .eq("category_id", category.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (feed.error) {
      console.log(feed.error.message);
      continue;
    }

    const releaseByCategory = releases?.find((release) => release.category_id === category.id);
    if (releaseByCategory?.last_feed_created_at === feed.data.created_at) continue;

    feedMap[category.id] = {
      ...feed.data,
      category_title: category.title,
    };
  }

  return feedMap;
};

const baseFetch = async (intervalTime: IntervalTimeEnum) => {
  const [releases, categories, apps] = await Promise.all([
    supabaseAnonClient.from("Release").select("*").eq("interval_time", intervalTime),
    supabaseAnonClient.from("Category").select("id, title"),
    supabaseAnonClient.from("App").select("id, from"),
  ]);

  return { releases, categories, apps };
};

const job = async (intervalTime: IntervalTimeEnum) => {
  try {
    const { releases, categories, apps } = await baseFetch(intervalTime);

    if (releases.error) console.log("#release error : ", releases.error.message);
    if (categories.error || apps.error)
      throw new Error(categories.error.message || apps.error.message);
    if (!categories.data?.length || !apps.data?.length) return;

    const feedMap = await getFeedMap(releases.data, categories.data);

    const releasePayloads = Object.values(feedMap).map((feed) => ({
      interval_time: intervalTime,
      category_id: feed.category_id,
      last_feed_created_at: feed.created_at,
    }));

    if (!releasePayloads.length) return;

    await updateRelease(releasePayloads);

    for (const app of apps.data) {
      const subscribers = await supabaseAnonClient
        .from("Subscriber")
        .select("*")
        .eq("active", true)
        .eq("app_id", app.id)
        .eq("interval_time", intervalTime);

      if (subscribers.error) {
        console.log(subscribers.error.message);
        continue;
      }
      if (!subscribers.data.length) continue;

      for (const subscriber of subscribers.data) {
        const text = makeText(subscriber.categories, feedMap);
        if (!text) continue;

        try {
          await postWebhook(subscriber.ch_url, text);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response.status === constants.HTTP_STATUS_NOT_FOUND) {
              await subscriber2Inactive(subscriber.app_id, subscriber.ch_id);
            }
          }
        }
        await sleep(200);
      }

      await sleep(2000);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("#Error : ", error.message);
    } else {
      console.log("#Unkown Error : ", error);
    }
  }
};

const threeTimeJob = () => {
  const rule = new RecurrenceRule();

  rule.hour = [9, 12, 15, 18, 21];
  rule.minute = 0;

  // Called every 3 hour
  scheduleJob(rule, async () => {
    await job(IntervalTimeEnum.THREE);
  });
};

const sixTimeJob = () => {
  const rule = new RecurrenceRule();

  rule.hour = [9, 15, 21];
  rule.minute = 0;

  // Called every 6 hour
  scheduleJob(rule, async () => {
    await job(IntervalTimeEnum.SIX);
  });
};

const twelveTimeJob = () => {
  const rule = new RecurrenceRule();

  rule.hour = [9, 21];
  rule.minute = 0;

  // Called every 12 hour
  scheduleJob(rule, async () => {
    await job(IntervalTimeEnum.TWELVE);
  });
};

export const scheduler = () => {
  console.log("Scheduler is Running 🥳");

  threeTimeJob();
  sixTimeJob();
  twelveTimeJob();

  process.on("SIGINT", function () {
    gracefulShutdown().then(() => {
      console.log("succeed graceful shutdown 😎");
      process.exit(0);
    });
  });
};

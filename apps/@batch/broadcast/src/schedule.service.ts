import axios from "axios";
import { supabaseAnonClient, supabaseServiceRoleClient } from "./config";
import { Categories, FeedMap, IntervalTimeEnum, Releases } from "./types";

export const makeText = (categoryIds: number[], feedMap: FeedMap) => {
  return categoryIds
    .map((category) =>
      feedMap[category]
        ? `<${feedMap[category].link}|*${feedMap[category].title}*>\n📍${
            feedMap[category].category_title || "-"
          } 🗞️ ${feedMap[category].publisher || "-"}`
        : ""
    )
    .filter((msg) => !!msg)
    .join("\n\n");
};

export const subscriber2Inactive = async (appId: string, chId: string) => {
  await supabaseServiceRoleClient
    .from("Subscriber")
    .update({ active: false, deactive_reason: "NOT_FOUND" })
    .eq("app_id", appId)
    .eq("ch_id", chId);
};

export const postWebhook = async (chUrl: string, text: string) => {
  await axios.post(chUrl, { text }, { headers: { "Content-Type": "application/json" } });
};

export const updateRelease = async (payload: Releases) => {
  const upsertedRelease = await supabaseServiceRoleClient.from("Release").upsert(payload).select();
  if (upsertedRelease.error) throw new Error(upsertedRelease.error.message);
};

export const getFeedMap = async (releases: Releases, categories: Categories) => {
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

export const baseFetch = async (intervalTime: IntervalTimeEnum) => {
  const [releases, categories, apps] = await Promise.all([
    supabaseAnonClient.from("Release").select("*").eq("interval_time", intervalTime),
    supabaseAnonClient.from("Category").select("id, title"),
    supabaseAnonClient.from("App").select("id, from"),
  ]);

  return { releases, categories, apps };
};

export const getSubscribersByAppIdNIntervalTime = async (
  appId: string,
  intervalTime: IntervalTimeEnum
) => {
  return supabaseAnonClient
    .from("Subscriber")
    .select("*")
    .eq("active", true)
    .eq("app_id", appId)
    .eq("interval_time", intervalTime);
};

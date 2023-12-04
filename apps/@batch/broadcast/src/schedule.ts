import axios from "axios";
import { constants } from "node:http2";
import { createClient } from "@supabase/supabase-js";
import { IntervalTimeEnum } from "./types";
import { sleep } from "./utils";

const supabaseAnonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseServiceRoleClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const job = async (intervalTime: IntervalTimeEnum) => {
  try {
    const releases = await supabaseAnonClient
      .from("Release")
      .select("*")
      .eq("interval_time", intervalTime);

    if (releases.error) throw new Error(releases.error.message);
    if (releases.data?.length === 0) return;

    for (const release of releases.data) {
      const app = await supabaseAnonClient
        .from("App")
        .select("id, Category ( id, title )")
        .eq("id", release.app_id)
        .single();

      if (app.error) throw new Error(app.error.message);
      if (!app.data) continue;

      const feed = await supabaseAnonClient
        .from("Feed")
        .select("*")
        .eq("category_id", (app.data.Category as any).id)
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (feed.error) throw new Error(feed.error.message);
      if (!feed.data) continue;

      if (release.last_feed_id === feed.data.id) continue;

      const subscribers = await supabaseAnonClient
        .from("Subscriber")
        .select("*")
        .eq("active", "Y")
        .eq("app_id", release.app_id)
        .eq("interval_time", intervalTime);

      if (subscribers.error) throw new Error(subscribers.error.message);
      if (subscribers.data.length === 0) continue;

      for (const subscriber of subscribers.data) {
        try {
          await axios.post(
            subscriber.ch_url,
            {
              text: `<${feed.data.link}|*${feed.data.title}*>\n📍${
                (app.data.Category as any).title || "-"
              } 🗞️ ${feed.data.publisher || "-"}`,
            },
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response.status === constants.HTTP_STATUS_NOT_FOUND) {
              await supabaseServiceRoleClient
                .from("Subscriber")
                .update({ active: "N", deactive_reason: "NOT_FOUND" })
                .eq("app_id", subscriber.app_id)
                .eq("ch_id", subscriber.ch_id);
            }
          }
        }

        await sleep(1000);
      }

      const releaseUpdate = await supabaseServiceRoleClient
        .from("Release")
        .update({ last_feed_id: feed.data.id })
        .eq("app_id", release.app_id)
        .eq("interval_time", release.interval_time);
      if (releaseUpdate.error) throw new Error(releaseUpdate.error.message);

      await sleep(2000);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error : ", error.message);
    } else {
      console.log("Unkown Error : ", error);
    }
  }
};

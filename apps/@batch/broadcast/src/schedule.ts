import axios from "axios";
import { constants } from "node:http2";
import { RecurrenceRule, gracefulShutdown, scheduleJob } from "node-schedule";
import { sleep } from "./utils";
import { IntervalTimeEnum } from "./types";
import {
  baseFetch,
  getFeedMap,
  getSubscribersByAppIdNIntervalTime,
  makeText,
  postWebhook,
  subscriber2Inactive,
  updateRelease,
} from "./schedule.service";

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
      const subscribers = await getSubscribersByAppIdNIntervalTime(app.id, intervalTime);

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

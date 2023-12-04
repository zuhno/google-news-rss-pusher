import { RecurrenceRule, gracefulShutdown, scheduleJob, scheduledJobs } from "node-schedule";
import "dotenv/config";

import { job } from "./schedule";
import { IntervalTimeEnum } from "./types";

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

const main = () => {
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

main();

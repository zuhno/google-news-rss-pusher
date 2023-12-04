import { scheduleJob, gracefulShutdown, RecurrenceRule } from "node-schedule";
import "dotenv/config";

import { job } from "./schedule";

const main = () => {
  const rule = new RecurrenceRule();

  rule.hour = [2, 5, 8, 11, 14, 17, 20, 23];
  rule.minute = 55;

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

main();

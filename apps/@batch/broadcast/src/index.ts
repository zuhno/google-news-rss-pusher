import { RecurrenceRule, scheduleJob } from "node-schedule";
import "dotenv/config";

import { job } from "./schedule";
import { IntervalTimeEnum } from "./types";

const rule = new RecurrenceRule();

rule.hour = [2, 5, 8, 11, 14, 17, 20, 23];
rule.minute = 55;

const main = () => {
  console.log("Scheduler is Running 🥳");
  job(IntervalTimeEnum.THREE);

  // // Called every 55 minutes of every hour
  // scheduleJob(rule, () => {
  //   job();
  // });

  // // Graceful Shutdown
  // process.on("SIGINT", function () {
  //   gracefulShutdown().then(() => {
  //     console.log("succeed graceful shutdown 😎");
  //     process.exit(0);
  //   });
  // });
};

main();

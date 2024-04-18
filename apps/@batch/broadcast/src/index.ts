import express from "express";
import { scheduler } from "./schedule";

import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.status(200);
});

app.listen(8080, () => {
  scheduler();
  console.log("Broadcast Server is Running 🥳");
});

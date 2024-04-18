import express, { static as _static } from "express";
import { scheduler } from "./schedule";

import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.status(200);
});

app.listen(8080, () => {
  scheduler();
  console.log("Scrap Server is Running 🥳");
});

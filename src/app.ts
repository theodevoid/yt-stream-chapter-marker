import express, { Request } from "express";
import dotenv from "dotenv";
import { CreateStreamMarkerBody } from "./types";
import { removeCommandFromMessage } from "./utils/removeCommandFromMessage";
import { appendFileSync, writeFileSync } from "fs";
import path from "path";
import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";

dotenv.config();
const PORT = process.env.PORT;

const app = express();
app.use(express.json());

let startDate = new Date();
let fileName = "";

const outputsDirectory = path.join(__dirname, "../outputs");
let outputFilePath = "";

app.post("/start", (req, res) => {
  startDate = new Date();

  fileName = format(startDate, "yyyy-MM-dd hhmm");

  outputFilePath = path.join(outputsDirectory, `${fileName}.txt`);

  // empties markers.txt file
  writeFileSync(outputFilePath, "");

  res.send("ok");
});

app.post(
  "/marker",
  async (req: Request<{}, {}, CreateStreamMarkerBody>, res) => {
    try {
      const { segmentName } = req.body;

      const youtubeChapterName = removeCommandFromMessage(segmentName);

      const now = new Date();
      const hour = Math.abs(differenceInHours(startDate, now));
      const minute = Math.abs(differenceInMinutes(startDate, now)) % 60;
      const second =
        (Math.abs(differenceInSeconds(startDate, now)) % 3600) % 60;

      const formattedHour = hour < 10 ? "0" + hour : hour;
      const formattedMinute = minute < 10 ? "0" + minute : minute;
      const formattedSecond = second < 10 ? "0" + second : second;

      const timestamp = `${formattedHour}:${formattedMinute}:${formattedSecond}`

      appendFileSync(outputFilePath, `${timestamp} ${youtubeChapterName}\n`);

      console.log("Successfully appended segment to file");

      res.status(201).json({
        message: "marker created",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "server error",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// queue/ingestQueue.js
import { Queue } from "bullmq";
import { connection } from "./connection.js";

export const ingestQueue = new Queue("ingest", { connection });
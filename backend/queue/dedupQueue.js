// queue/dedupQueue.js
import { Queue } from "bullmq";
import { connection } from "./connection.js";

export const dedupQueue = new Queue("dedup", { connection });
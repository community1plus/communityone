// queue/connection.js
import IORedis from "ioredis";

export const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,

  // 🔥 REQUIRED for BullMQ workers
  maxRetriesPerRequest: null,
});
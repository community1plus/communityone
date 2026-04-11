import IORedis from "ioredis";

export const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,

  maxRetriesPerRequest: null,

  retryStrategy(times) {
    console.log(`🔁 Redis retry attempt ${times}`);
    return Math.min(times * 500, 5000); // backoff
  }
});

// 👇 add visibility
connection.on("connect", () => {
  console.log("✅ Redis connected");
});

connection.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});
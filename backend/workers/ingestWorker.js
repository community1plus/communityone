// workers/ingestWorker.js

import { Worker } from "bullmq";
import { connection } from "../queue/connection.js";
import { ingestGoogle, ingestOSM } from "../src/services/ingest.js";

/* =====================================================
   CONFIG
===================================================== */

// 🔥 control parallelism (VERY IMPORTANT)
const CONCURRENCY = 2;

// 🔥 delay helper (for rate limiting)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* =====================================================
   WORKER
===================================================== */

console.log("👷 Ingest worker starting...");

const worker = new Worker(
  "ingest",
  async (job) => {
    const { lat, lng, source } = job.data;

    console.log(`📍 Processing job: ${lat}, ${lng}, ${source}`);

    try {
      if (source === "google") {
        await ingestGoogle({ lat, lng });

        // 🔥 small delay to avoid Google rate limits
        await delay(300);
      }

      if (source === "osm") {
        // 🔥 bigger delay for OSM (strict API)
        await delay(1000);

        await ingestOSM({ lat, lng });
      }

    } catch (err) {
      console.error("❌ Worker error:", err.message);
      throw err; // let BullMQ handle retry/failure
    }
  },
  {
    connection,
    concurrency: CONCURRENCY
  }
);

/* =====================================================
   EVENTS
===================================================== */

worker.on("ready", () => {
  console.log("🚀 Ingest worker ready");
});

worker.on("active", (job) => {
  console.log(`🔥 Active: ${job.id}`);
});

worker.on("completed", (job) => {
  console.log(`✅ Completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Failed: ${job?.id}`, err.message);
});

worker.on("error", (err) => {
  console.error("❌ Worker crashed:", err);
});
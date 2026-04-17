// workers/ingestWorker.js

import { Worker } from "bullmq";
import { connection } from "../queue/connection.js";
import { ingestGoogle, ingestOSM } from "../src/services/ingest.js";

/* =====================================================
   CONFIG
===================================================== */

// 🔥 HARD LIMIT (critical)
const CONCURRENCY = 1;

// 🔥 delays
const GOOGLE_DELAY = 200;

// 🔥 GLOBAL OSM THROTTLE (key fix)
const OSM_MIN_INTERVAL = 4000; // 4 seconds between ALL OSM calls

// 🔥 helper
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// 🔥 rolling timestamp tracker
let lastOSMTime = 0;

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

      /* ================================
         GOOGLE (FAST + SAFE)
      ================================= */

      if (source === "google") {
        await ingestGoogle({ lat, lng });

        // small smoothing delay
        await delay(GOOGLE_DELAY);

        return;
      }

      /* ================================
         OSM (GLOBAL THROTTLED)
      ================================= */

      if (source === "osm") {

        const now = Date.now();

        // 🔥 enforce spacing BETWEEN ALL OSM requests
        const wait = Math.max(0, OSM_MIN_INTERVAL - (now - lastOSMTime));

        if (wait > 0) {
          console.log(`⏳ OSM throttle: waiting ${wait}ms`);
          await delay(wait);
        }

        try {
          await ingestOSM({ lat, lng });
        } finally {
          // 🔥 update AFTER request completes
          lastOSMTime = Date.now();
        }

        return;
      }

    } catch (err) {
      console.error("❌ Worker error:", err.message);
      throw err;
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
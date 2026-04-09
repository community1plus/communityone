// workers/ingestWorker.js
import { Worker } from "bullmq";
import { connection } from "../queue/connection.js";
import { ingestGoogle, ingestOSM } from "../services/ingest.js";

const worker = new Worker(
  "ingest",
  async (job) => {
    const { lat, lng, source } = job.data;

    if (source === "google") {
      await ingestGoogle({ lat, lng });
    }

    if (source === "osm") {
      await ingestOSM({ lat, lng });
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});
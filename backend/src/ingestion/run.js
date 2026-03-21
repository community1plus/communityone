import "dotenv/config";
import { ingestGoogle, ingestOSM } from "../services/ingest.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function run() {
  console.log("🚀 Starting ingestion...\n");

  const lat = -37.8136;
  const lng = 144.9631;

  try {
    await Promise.all([
      ingestGoogle({ lat, lng }),
      ingestOSM({ lat, lng })
    ]);

    console.log("\n🎉 Ingestion complete");

  } catch (err) {
    console.error("❌ Ingestion failed:", err.message);
  }
}

run();
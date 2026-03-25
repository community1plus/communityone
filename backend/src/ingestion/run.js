import "dotenv/config";
import { ingestGoogle } from "../services/ingest.js";
import { ingestOSM } from "../services/ingest.js";
import { generateGrid } from "./grid.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function run() {
  console.log("🚀 Starting Melbourne ingestion...\n");

  const points = generateGrid({
    centerLat: -37.8136,
    centerLng: 144.9631,
    radiusKm: 8,   // 🔥 Melbourne coverage
    stepKm: 1.5    // density
  });

  console.log(`📍 Total grid points: ${points.length}\n`);

  let count = 0;

  for (const [lat, lng] of points) {
    count++;

    console.log(`📍 [${count}/${points.length}] ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    await ingestGoogle({ lat, lng });
    await ingestOSM({ lat, lng });

    // 🔥 CRITICAL: prevent API bans
    await delay(1500);
  }

  console.log("\n🎉 Melbourne ingestion complete");
}

run();
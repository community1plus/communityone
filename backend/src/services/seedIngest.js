// scripts/seedIngest.js

import { enqueueIngest, generateTiles } from "./ingest.js";

const MELBOURNE = { lat: -37.8136, lng: 144.9631 };

async function run() {
  console.log("🚀 Seeding Melbourne...");

  const tiles = generateTiles(MELBOURNE, 0.01, 2);

  for (const tile of tiles) {
    await enqueueIngest({ ...tile, source: "google" });
    await enqueueIngest({ ...tile, source: "osm" });
  }

  console.log("✅ Done seeding");
}

run();
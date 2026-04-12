// scripts/seedIngest.js

import { enqueueIngest, generateTiles } from "./ingest.js";

/* =====================================================
   CONFIG
===================================================== */

const MELBOURNE = { name: "Melbourne", lat: -37.8136, lng: 144.9631 };
const SYDNEY = { name: "Sydney", lat: -33.8688, lng: 151.2093 };

// 👉 choose cities
const TARGETS = [
  SYDNEY,
  // MELBOURNE,
];

// 🔥 tuning knobs
const TILE_DELAY = 150;     // delay between tiles
const OSM_STAGGER = 300;   // delay before OSM enqueue
const BATCH_SIZE = 5;      // tiles per batch (controls concurrency)

/* =====================================================
   HELPERS
===================================================== */

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function processTile(tile) {
  // Google first (fast + stable)
  await enqueueIngest({ ...tile, source: "google" });

  // slight stagger before OSM
  await sleep(OSM_STAGGER);

  await enqueueIngest({ ...tile, source: "osm" });
}

/* =====================================================
   RUN
===================================================== */

async function run() {
  for (const city of TARGETS) {
    console.log(`🚀 Seeding ${city.name}...`);

    const tiles = generateTiles(
      { lat: city.lat, lng: city.lng },
      0.01,
      2
    );

    console.log(`📦 Total tiles: ${tiles.length}`);

    // 🔥 batch processing (controlled concurrency)
    for (let i = 0; i < tiles.length; i += BATCH_SIZE) {
      const batch = tiles.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(processTile));

      // pause between batches to avoid spikes
      await sleep(TILE_DELAY);
    }

    console.log(`✅ Done seeding ${city.name}`);
  }

  console.log("🎉 All seeding complete");
}

run();
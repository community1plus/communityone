// scripts/enqueueTiles.js

import { generateTiles } from "../../services/tileGenerator.js";
import { enqueueIngest } from "../services/ingest.js";

const MELBOURNE = {
  north: -37.6,
  south: -38.1,
  east: 145.3,
  west: 144.6
};

async function run() {
  const tiles = generateTiles(MELBOURNE, 0.2);

  console.log(`🧱 Generated tiles: ${tiles.length}`);

  for (const [i, tile] of tiles.entries()) {
  await enqueueIngest({ lat: tile.lat, lng: tile.lng, source: "google" });
  await enqueueIngest({ lat: tile.lat, lng: tile.lng, source: "osm" });

  if (i % 20 === 0) {
    console.log(`⏳ queued ${i} tiles`);
    await new Promise((r) => setTimeout(r, 2000)); // throttle
  }
}

  console.log("✅ All tiles enqueued");
}

run();
// workers/dedupWorker.js

import { Worker } from "bullmq";
import { connection } from "../queue/connection.js";
import { pool } from "../src/db/db.js";

/* =====================================================
   CONFIG
===================================================== */

const CONCURRENCY = 3;
const RADIUS_METERS = 100;
const MATCH_THRESHOLD = 0.75;

/* =====================================================
   HELPERS
===================================================== */

function nameScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  if (a.includes(b) || b.includes(a)) return 0.85;

  const tokensA = a.split(" ");
  const tokensB = b.split(" ");

  const overlap = tokensA.filter(t => tokensB.includes(t)).length;

  return overlap / Math.max(tokensA.length, tokensB.length);
}

function distanceScore(dist) {
  if (dist < 20) return 1;
  if (dist < 50) return 0.8;
  if (dist < 100) return 0.5;
  return 0;
}

function categoryScore(a, b) {
  if (!a || !b) return 0;
  return a === b ? 1 : 0.3;
}

function computeScore({ nameA, nameB, distance, categoryA, categoryB }) {
  return (
    nameScore(nameA, nameB) * 0.6 +
    distanceScore(distance) * 0.3 +
    categoryScore(categoryA, categoryB) * 0.1
  );
}

/* =====================================================
   WORKER
===================================================== */

console.log("🧠 Dedup worker starting...");

const worker = new Worker(
  "dedup",
  async (job) => {

    if (job.name !== "dedupe-tile") return;

    const { lat, lng } = job.data;

    console.log(`📍 Dedup tile: ${lat}, ${lng}`);

    // 1️⃣ Get RAW businesses from tile
    const rawResult = await pool.query(
      `
      SELECT id, name, normalized_name, category, lat, lng, source, external_id
      FROM businesses_raw
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        $3
      )
      LIMIT 200
      `,
      [lng, lat, RADIUS_METERS]
    );

    const rawBusinesses = rawResult.rows;

    if (!rawBusinesses.length) {
      console.log("⚠️ No raw businesses");
      return;
    }

    console.log(`📦 Raw count: ${rawBusinesses.length}`);

    // 2️⃣ Process each raw business
    for (const biz of rawBusinesses) {

      // find nearby canonical candidates
      const candidatesResult = await pool.query(
        `
        SELECT 
          id,
          normalized_name,
          category,
          rating,
          ST_Distance(
            location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)
          ) as distance
        FROM businesses
        WHERE ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          $3
        )
        LIMIT 10
        `,
        [biz.lng, biz.lat, RADIUS_METERS]
      );

      const candidates = candidatesResult.rows;

      let bestMatch = null;
      let bestScore = 0;

      for (const c of candidates) {
        const score = computeScore({
          nameA: biz.normalized_name,
          nameB: c.normalized_name,
          distance: c.distance,
          categoryA: biz.category,
          categoryB: c.category
        });

        if (score > bestScore) {
          bestScore = score;
          bestMatch = c;
        }
      }

      /* =====================================================
         DECISION
      ===================================================== */

      if (bestMatch && bestScore > MATCH_THRESHOLD) {

        console.log(`🔁 Duplicate (${bestScore.toFixed(2)}) → ${bestMatch.id}`);

        // 🔥 LINK SOURCE (UUID-safe)
        await pool.query(
          `
          INSERT INTO business_sources
          (business_id, source, external_id, name, normalized_name, lat, lng)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (source, external_id) DO NOTHING
          `,
          [
            bestMatch.id,
            biz.source,
            biz.external_id,
            biz.name,
            biz.normalized_name,
            biz.lat,
            biz.lng
          ]
        );

      } else {

        console.log(`➕ New (${bestScore.toFixed(2)})`);

        // 🔥 CREATE CANONICAL BUSINESS
        const result = await pool.query(
          `
          INSERT INTO businesses
          (name, normalized_name, category, address, rating, lat, lng, location)
          VALUES ($1, $2, $3, $4, $5, $6, $7,
                  ST_SetSRID(ST_MakePoint($7, $6), 4326))
          RETURNING id
          `,
          [
            biz.name,
            biz.normalized_name,
            biz.category,
            "unknown",
            0,
            biz.lat,
            biz.lng
          ]
        );

        const newId = result.rows[0].id;

        console.log(`🆕 Created business → ${newId}`);

        // 🔥 LINK SOURCE
        await pool.query(
          `
          INSERT INTO business_sources
          (business_id, source, external_id, name, normalized_name, lat, lng)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (source, external_id) DO NOTHING
          `,
          [
            newId,
            biz.source,
            biz.external_id,
            biz.name,
            biz.normalized_name,
            biz.lat,
            biz.lng
          ]
        );
      }
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
  console.log("🚀 Dedup worker ready");
});

worker.on("active", (job) => {
  console.log(`🔥 Active: ${job.id}`);
});

worker.on("completed", (job) => {
  console.log(`✅ Done: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Failed: ${job?.id}`, err.message);
});

worker.on("error", (err) => {
  console.error("❌ Worker crashed:", err);
});
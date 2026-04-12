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

  if (a.includes(b) || b.includes(a)) return 0.9;

  const tokensA = a.split(" ");
  const tokensB = b.split(" ");

  const overlap = tokensA.filter(t => tokensB.includes(t)).length;

  return overlap / Math.max(tokensA.length, tokensB.length);
}

function distanceScore(dist) {
  if (dist < 20) return 1;
  if (dist < 50) return 0.85;
  if (dist < 100) return 0.6;
  return 0;
}

function categoryScore(a, b) {
  if (!a || !b) return 0;
  return a === b ? 1 : 0.4;
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

    const client = await pool.connect();

    try {

      /* =====================================================
         1️⃣ FETCH RAW BUSINESSES
      ===================================================== */

      const rawResult = await client.query(
        `
        SELECT id, name, normalized_name, category, lat, lng, source, external_id, rating
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

      /* =====================================================
         2️⃣ PROCESS EACH BUSINESS
      ===================================================== */

      for (const biz of rawBusinesses) {

        // 🔥 lock per business to avoid race conditions
        await client.query("BEGIN");

        try {

          const candidatesResult = await client.query(
            `
            SELECT 
              id,
              normalized_name,
              category,
              rating,
              source_count,
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

            // 🔥 update canonical (merge)
            await client.query(
              `
              UPDATE businesses
              SET
                rating = GREATEST(rating, $1),
                source_count = source_count + 1,
                updated_at = NOW()
              WHERE id = $2
              `,
              [biz.rating || 0, bestMatch.id]
            );

            // 🔥 link source
            await client.query(
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

            const result = await client.query(
              `
              INSERT INTO businesses
              (name, normalized_name, category, address, rating, lat, lng, location, source_count)
              VALUES ($1, $2, $3, $4, $5, $6, $7,
                      ST_SetSRID(ST_MakePoint($7, $6), 4326), 1)
              RETURNING id
              `,
              [
                biz.name,
                biz.normalized_name,
                biz.category,
                "unknown",
                biz.rating || 0,
                biz.lat,
                biz.lng
              ]
            );

            const newId = result.rows[0].id;

            console.log(`🆕 Created business → ${newId}`);

            await client.query(
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

          await client.query("COMMIT");

        } catch (err) {
          await client.query("ROLLBACK");
          console.error("❌ Dedup tx failed:", err.message);
        }
      }

    } finally {
      client.release();
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
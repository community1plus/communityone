// workers/dedupWorker.js
import { Worker } from "bullmq";
import { connection } from "../queue/connection.js";
import { pool } from "../db/db.js";

/* =====================================================
   HELPERS
===================================================== */

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;
  return 0;
}

/* =====================================================
   WORKER
===================================================== */

const worker = new Worker(
  "dedup",
  async (job) => {
    const { normalized_name, lat, lng } = job.data;

    // 1. Find nearby candidates
    const result = await pool.query(
      `
      SELECT id, name, normalized_name, rating, claimed
      FROM businesses
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        50
      )
      LIMIT 10
      `,
      [lng, lat]
    );

    const candidates = result.rows;

    if (!candidates.length) return;

    // 2. Try to find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const c of candidates) {
      const score = similarity(normalized_name, c.normalized_name);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }

    // 3. Threshold decision
    if (bestMatch && bestScore > 0.75) {
      console.log(`🔁 Duplicate detected → ${bestMatch.id}`);

      // Optional: merge logic (basic)
      await pool.query(
        `
        UPDATE businesses
        SET updated_at = NOW()
        WHERE id = $1
        `,
        [bestMatch.id]
      );

    } else {
      console.log("✅ No duplicate found");
    }
  },
  {
    connection,
    concurrency: 5
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Dedup done: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Dedup failed: ${job.id}`, err);
});
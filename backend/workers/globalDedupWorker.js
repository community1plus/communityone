import { pool } from "../../db/db.js";

const MATCH_DISTANCE = 50; // meters

export async function runGlobalDedup({ lat, lng }) {
  console.log(`🧠 Global dedup: ${lat}, ${lng}`);

  const client = await pool.connect();

  try {
    // 1. Pull raw businesses for tile
    const { rows } = await client.query(
      `
      SELECT *
      FROM businesses_raw
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        1000
      )
      `,
      [lng, lat]
    );

    for (const biz of rows) {
      // 2. Try find existing canonical match
      const match = await client.query(
        `
        SELECT id, rating, source_count
        FROM businesses
        WHERE normalized_name = $1
        AND ST_DWithin(location, $2, $3)
        LIMIT 1
        `,
        [
          biz.normalized_name,
          `SRID=4326;POINT(${biz.lng} ${biz.lat})`,
          MATCH_DISTANCE
        ]
      );

      if (match.rows.length > 0) {
        const existing = match.rows[0];

        // 3. Merge into existing
        await client.query(
          `
          UPDATE businesses
          SET
            rating = GREATEST(rating, $1),
            source_count = source_count + 1,
            updated_at = NOW()
          WHERE id = $2
          `,
          [biz.rating, existing.id]
        );
      } else {
        // 4. Insert new canonical business
        await client.query(
          `
          INSERT INTO businesses
          (name, normalized_name, category, address, rating, lat, lng, location)
          VALUES ($1,$2,$3,$4,$5,$6,$7,
            ST_SetSRID(ST_MakePoint($7, $6), 4326)
          )
          `,
          [
            biz.name,
            biz.normalized_name,
            biz.category,
            biz.address,
            biz.rating,
            biz.lat,
            biz.lng
          ]
        );
      }
    }

    console.log(`✅ Dedup complete: ${rows.length} processed`);

  } catch (err) {
    console.error("❌ Global dedup error:", err);
  } finally {
    client.release();
  }
}
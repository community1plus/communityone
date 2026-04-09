import { pool } from "../db/db.js";

export async function bulkUpsertBusinesses(businesses) {
  if (!businesses.length) return;

  const values = [];
  const placeholders = [];

  businesses.forEach((biz, i) => {
    const idx = i * 9;

    placeholders.push(`
      ($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4},
       $${idx + 5}, $${idx + 6},
       ST_SetSRID(ST_MakePoint($${idx + 6}, $${idx + 5}), 4326),
       $${idx + 7}, $${idx + 8}, $${idx + 9})
    `);

    values.push(
      biz.name,
      biz.normalized_name, // 🔥 NEW
      biz.category,
      biz.address,
      biz.rating,
      biz.lat,
      biz.lng,
      biz.source,
      biz.external_id
    );
  });

  const query = `
    INSERT INTO businesses
    (name, normalized_name, category, address, rating, lat, lng, location, source, external_id)
    VALUES ${placeholders.join(",")}
    ON CONFLICT (source, external_id)
    DO UPDATE SET

      name = CASE
        WHEN businesses.claimed = FALSE THEN EXCLUDED.name
        ELSE businesses.name
      END,

      normalized_name = CASE
        WHEN businesses.claimed = FALSE THEN EXCLUDED.normalized_name
        ELSE businesses.normalized_name
      END,

      category = COALESCE(businesses.category, EXCLUDED.category),

      address = COALESCE(businesses.address, EXCLUDED.address),

      rating = GREATEST(businesses.rating, EXCLUDED.rating),

      lat = CASE
        WHEN businesses.claimed = FALSE THEN EXCLUDED.lat
        ELSE businesses.lat
      END,

      lng = CASE
        WHEN businesses.claimed = FALSE THEN EXCLUDED.lng
        ELSE businesses.lng
      END,

      location = CASE
        WHEN businesses.claimed = FALSE THEN EXCLUDED.location
        ELSE businesses.location
      END,

      updated_at = NOW()

    WHERE businesses.claimed = FALSE;
  `;

  await pool.query(query, values);
}
import { pool } from "../db/db.js";

export async function bulkUpsertBusinesses(businesses) {
  if (!businesses.length) return;

  const values = [];
  const placeholders = [];

  businesses.forEach((biz, i) => {
    const idx = i * 8;

    placeholders.push(`
      ($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4},
       $${idx + 5}, $${idx + 6},
       ST_SetSRID(ST_MakePoint($${idx + 6}, $${idx + 5}), 4326),
       $${idx + 7}, $${idx + 8})
    `);

    values.push(
      biz.name,
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
    (name, category, address, rating, lat, lng, location, source, external_id)
    VALUES ${placeholders.join(",")}
    ON CONFLICT (source, external_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      rating = EXCLUDED.rating,
      updated_at = NOW()
  `;

  await pool.query(query, values);
}
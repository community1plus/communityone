import { pool } from "../db/client.js";

export async function saveBusinesses(businesses) {

  for (const b of businesses) {
    await pool.query(
      `
      INSERT INTO businesses (name, category, lat, lng, location, source, external_id)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6)
      ON CONFLICT (external_id) DO NOTHING
      `,
      [b.name, b.category, b.lat, b.lng, b.source, b.external_id]
    );
  }
}
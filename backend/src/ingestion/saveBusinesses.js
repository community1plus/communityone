import { pool } from "../db/db.js";

function normalizeName(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function saveBusinesses(
  businesses = []
) {

  if (!businesses.length) return;

  const values = [];
  const placeholders = [];

  businesses.forEach((b, i) => {

    const idx = i * 8;

    placeholders.push(`

      (
        $${idx + 1},
        $${idx + 2},
        $${idx + 3},
        $${idx + 4},
        $${idx + 5},

        ST_SetSRID(
          ST_MakePoint(
            $${idx + 5},
            $${idx + 4}
          ),
          4326
        )::geography,

        ST_GeoHash(
          ST_SetSRID(
            ST_MakePoint(
              $${idx + 5},
              $${idx + 4}
            ),
            4326
          ),
          8
        ),

        $${idx + 6},
        $${idx + 7},
        $${idx + 8}
      )

    `);

    values.push(
      b.name,
      normalizeName(b.name),
      b.category,
      b.lat,
      b.lng,
      b.source,
      b.external_id,
      JSON.stringify(b)
    );
  });

  await pool.query(

    `
    INSERT INTO businesses
    (
      name,
      normalized_name,
      category,
      lat,
      lng,
      location,
      geo_hash,
      source,
      external_id,
      provider_payload
    )

    VALUES
    ${placeholders.join(",")}

    ON CONFLICT (source, external_id)

    DO UPDATE SET

      name = EXCLUDED.name,

      category = EXCLUDED.category,

      lat = EXCLUDED.lat,

      lng = EXCLUDED.lng,

      updated_at = NOW()
    `,
    
    values
  );
}
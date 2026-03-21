import axios from "axios";
import { pool } from "../db.js";

/* =====================================================
   CONFIG
===================================================== */

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

/* =====================================================
   GOOGLE PLACES INGEST
===================================================== */

export async function ingestGoogle({ lat, lng, radius = 2000, type = "restaurant" }) {

  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

  const res = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius,
      type,
      key: GOOGLE_KEY
    }
  });

  const places = res.data.results;

  for (const p of places) {

    const biz = {
      name: p.name,
      category: type,
      address: p.vicinity,
      rating: p.rating || 0,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      source: "google",
      external_id: p.place_id
    };

    await upsertBusiness(biz);
  }

  console.log(`✅ Google ingested: ${places.length}`);
}


/* =====================================================
   OSM (OVERPASS) INGEST
===================================================== */

export async function ingestOSM({ lat, lng }) {

  const query = `
    [out:json];
    (
      node(around:2000,${lat},${lng})["amenity"];
    );
    out;
  `;

  const res = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query,
    { headers: { "Content-Type": "text/plain" } }
  );

  const nodes = res.data.elements;

  for (const n of nodes) {

    const biz = {
      name: n.tags?.name || "Unknown",
      category: n.tags?.amenity || "other",
      address: "OSM location",
      rating: 0,
      lat: n.lat,
      lng: n.lon,
      source: "osm",
      external_id: `osm_${n.id}`
    };

    await upsertBusiness(biz);
  }

  console.log(`✅ OSM ingested: ${nodes.length}`);
}


/* =====================================================
   UPSERT (DEDUPLICATION CORE)
===================================================== */

async function upsertBusiness(biz) {

  try {
    await pool.query(
      `
      INSERT INTO businesses
      (name, category, address, rating, lat, lng, location, source, external_id)
      VALUES ($1,$2,$3,$4,$5,$6,
        ST_SetSRID(ST_MakePoint($6,$5),4326),
        $7,$8
      )
      ON CONFLICT (source, external_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        rating = EXCLUDED.rating,
        updated_at = NOW()
      `,
      [
        biz.name,
        biz.category,
        biz.address,
        biz.rating,
        biz.lat,
        biz.lng,
        biz.source,
        biz.external_id
      ]
    );
  } catch (err) {
    console.error("❌ upsert error:", err.message);
  }
}
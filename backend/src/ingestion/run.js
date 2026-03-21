import "dotenv/config";
import { fetchOSMBusinesses } from "./osmIngest.js";
import { fetchGooglePlaces } from "./googleIngest.js";
import { saveBusinesses } from "./saveBusinesses.js";

async function run() {

  const lat = -37.8136;
  const lng = 144.9631;

  const osm = await fetchOSMBusinesses(lat, lng);
  const google = await fetchGooglePlaces(lat, lng);

  const combined = [...osm, ...google];

  await saveBusinesses(combined);

  console.log("✅ Ingestion complete:", combined.length);
}

run();
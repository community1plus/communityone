import axios from "axios";

export async function fetchOSMBusinesses(lat, lng) {
  const query = `
    [out:json];
    (
      node["amenity"](around:2000,${lat},${lng});
      node["shop"](around:2000,${lat},${lng});
    );
    out;
  `;

  const url = "https://overpass-api.de/api/interpreter";

  const res = await axios.post(url, query);

  return res.data.elements.map(el => ({
    name: el.tags?.name || "Unknown",
    category: el.tags?.amenity || el.tags?.shop || "other",
    lat: el.lat,
    lng: el.lon,
    address: el.tags?.["addr:street"] || "",
    source: "osm",
    external_id: `osm-${el.id}`
  }));
}
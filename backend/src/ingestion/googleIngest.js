import axios from "axios";

const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

export async function fetchGooglePlaces(lat, lng) {

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

  const res = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius: 2000,
      key: GOOGLE_KEY
    }
  });

  return res.data.results.map(place => ({
    name: place.name,
    category: place.types?.[0],
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    rating: place.rating,
    address: place.vicinity,
    source: "google",
    external_id: place.place_id
  }));
}
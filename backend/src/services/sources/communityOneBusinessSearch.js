import Business from "../../models/Business.js";

export async function searchCommunityOneBusinesses({
  query,
  lat,
  lng,
  radiusMeters = 1500,
}) {
  if (!lat || !lng) {
    return [];
  }

  const searchRegex = query
    ? new RegExp(query, "i")
    : null;

  const filters = {
    isActive: true,

    geo: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [
            Number(lng),
            Number(lat),
          ],
        },
        $maxDistance: Number(radiusMeters),
      },
    },
  };

  if (searchRegex) {
    filters.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { description: searchRegex },
    ];
  }

  const businesses = await Business.find(filters).limit(10);

  return businesses.map((business) => ({
    id: `db:${business._id}`,
    source: "COMMUNITY_ONE",
    name: business.name,
    phone: business.phone || "",
    email: business.email || "",
    website: business.website || "",
    location: {
      fullAddress: business.location?.fullAddress || "",
      lat: business.location?.lat,
      lng: business.location?.lng,
      source: "COMMUNITY_ONE",
    },
    confidence: 0.95,
  }));
}
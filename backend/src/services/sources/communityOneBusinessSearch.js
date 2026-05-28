export async function searchCommunityOneBusinesses({
  query,
  lat,
  lng,
  radiusMeters = 1500,
}) {
  console.log(
    "[COMMUNITY_ONE_SEARCH]",
    {
      query,
      lat,
      lng,
      radiusMeters,
    }
  );

  /*
    TEMP:
    Replace later with real DB query
  */

  return [
    {
      id: `db:${query}:${lat}:${lng}`,

      source: "COMMUNITY_ONE",

      name:
        query || "Unnamed Business",

      phone: "03 0000 0000",

      email: "",

      website:
        "https://communityone.com",

      location: {
        fullAddress:
          "Community One Test Location",

        lat,
        lng,

        source:
          "COMMUNITY_ONE",
      },

      confidence: 0.95,
    },
  ];
}
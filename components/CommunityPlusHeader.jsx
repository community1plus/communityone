useEffect(() => {
  const setCleanLocation = (loc) =>
    setLocation(loc || "Location unavailable");

  // ------------------------------
  // 1) IP Fallback (final fallback)
  // ------------------------------
  const fallbackToIP = () => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.city && data.region) {
          setCleanLocation(`${data.city}, ${data.region}`);
        } else {
          setCleanLocation(null);
        }
      })
      .catch(() => setCleanLocation(null));
  };

  // ------------------------------
  // 2) OSM Reverse Geocode fallback
  // ------------------------------
  const fallbackToOSM = (latitude, longitude) => {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    )
      .then((res) => res.json())
      .then((data) => {
        const addr = data.address || {};

        const suburb =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.town ||
          addr.city;

        const state = addr.state || addr.region;
        const postcode = addr.postcode || "";

        if (suburb && state) {
          setCleanLocation(`${suburb} ${postcode}, ${state}`);
        } else {
          fallbackToIP();
        }
      })
      .catch(() => fallbackToIP());
  };

  // ------------------------------
  // 3) Google Maps Reverse Geocoding (Primary)
  // ------------------------------
  const getGoogleAddress = (latitude, longitude) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn("Google API key missing → using OSM only");
      return fallbackToOSM(latitude, longitude);
    }

    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    )
      .then((res) => res.json())
      .then((geo) => {
        if (!geo.results || !geo.results.length) {
          return fallbackToOSM(latitude, longitude);
        }

        const components = geo.results[0].address_components;

        const number = components.find(c =>
          c.types.includes("street_number")
        )?.long_name;

        const street = components.find(c =>
          c.types.includes("route")
        )?.long_name;

        const suburb = components.find(c =>
          c.types.includes("locality")
        )?.long_name;

        const postcode = components.find(c =>
          c.types.includes("postal_code")
        )?.long_name;

        const state = components.find(c =>
          c.types.includes("administrative_area_level_1")
        )?.short_name;

        // Build nice human-friendly format
        if (street && number && suburb && postcode && state) {
          setCleanLocation(`${number} ${street}, ${suburb} ${postcode}, ${state}`);
        } else if (suburb && postcode && state) {
          setCleanLocation(`${suburb} ${postcode}, ${state}`);
        } else if (suburb && state) {
          setCleanLocation(`${suburb}, ${state}`);
        } else {
          fallbackToOSM(latitude, longitude);
        }
      })
      .catch(() => fallbackToOSM(latitude, longitude));
  };

  // ------------------------------
  // 4) GPS Position → Kick off chain
  // ------------------------------
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        getGoogleAddress(latitude, longitude);
      },
      fallbackToIP,
      { enableHighAccuracy: true }
    );
  } else {
    fallbackToIP();
  }
}, []);

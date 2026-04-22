const enableLiveLocation = async () => {
  if (!navigator.geolocation) return;

  return new Promise((resolve, reject) => {
    let bestReading = null;
    let attempts = 0;

    const MAX_ATTEMPTS = 5;        // 🔥 number of samples
    const MAX_TIME = 10000;       // 🔥 max time (10s)
    const GOOD_ACCURACY = 50;     // 🔥 stop early if this is reached

    console.log("📡 Starting high-accuracy sampling...");

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        attempts++;

        const reading = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };

        console.log(`📍 Sample ${attempts}:`, reading);

        // 🔥 Keep best (lowest accuracy value)
        if (
          !bestReading ||
          reading.accuracy < bestReading.accuracy
        ) {
          bestReading = reading;
        }

        // 🔥 Stop conditions
        const isGoodEnough = reading.accuracy <= GOOD_ACCURACY;
        const isMaxAttempts = attempts >= MAX_ATTEMPTS;

        if (isGoodEnough || isMaxAttempts) {
          navigator.geolocation.clearWatch(watchId);

          try {
            console.log("✅ Best reading selected:", bestReading);

            const enriched = await enrichLocation({
              lat: bestReading.lat,
              lng: bestReading.lng,
              accuracy: bestReading.accuracy,
            });

            setLiveLocation(enriched);

            if (locationMode !== "manual") {
              setViewLocation(enriched, "auto");
            }

            resolve(enriched);
          } catch (err) {
            console.error("❌ Enrichment failed:", err);
            reject(err);
          }
        }
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        navigator.geolocation.clearWatch(watchId);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: MAX_TIME,
        maximumAge: 0,
      }
    );

    // 🔥 Hard timeout fallback
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);

      if (!bestReading) {
        reject(new Error("No location readings"));
        return;
      }

      console.log("⏱ Timeout — using best reading:", bestReading);

      enrichLocation({
        lat: bestReading.lat,
        lng: bestReading.lng,
        accuracy: bestReading.accuracy,
      }).then(resolve).catch(reject);

    }, MAX_TIME + 1000);
  });
};
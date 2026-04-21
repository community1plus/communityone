const handleManualLocationCommit = () => {
  if (isExactLocation) return;

  const value = manualLocation.trim();
  if (!value) return;

  const newLocation = {
    label: value,
    suburb: value,
    city: value,
    state: null,
    postcode: null,
    lat: null,
    lng: null,
    accuracy: null,
    type: "manual",
    updatedAt: Date.now(), // 🔥 forces change
  };

  console.log("📍 Setting location:", newLocation);

  setViewLocation(newLocation);
};
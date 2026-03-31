import { useState } from "react";

export default function Onboarding() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function handleSubmit() {
    await fetch("/api/profile/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        display_name: displayName
      })
    });

    window.location.href = "/dashboard";
  }

  return (
    <div>
      <h2>Create your profile</h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Display Name"
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
}
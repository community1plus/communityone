import React, { useEffect, useState } from "react";
import "./CommunityPlusLandingPage.css";

import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";

export default function CommunityPlusLandingPage() {
const [showAuth, setShowAuth] = useState(false);
const [authLoading, setAuthLoading] = useState(false);

/* SCROLL LOCK */
useEffect(() => {
if (showAuth) {
document.body.classList.add("modal-open");
} else {
document.body.classList.remove("modal-open");
}
}, [showAuth]);

/* SAFE LOGIN */
const safeRedirect = async (provider) => {
try {
const user = await getCurrentUser();


  if (user) {
    window.location.href = "/home";
    return;
  }
} catch {}

setAuthLoading(true);
setShowAuth(false);

if (provider) {
  signInWithRedirect({ provider });
} else {
  signInWithRedirect();
}


};

return ( <div className="cpl-root"> <header className="topbar"> <div className="wrap topbar-inner"> <div className="logo">COMMUNITY ONE</div>


      <div className="actions">
        <button className="btn signin" onClick={() => setShowAuth(true)}>Sign in</button>
        <button className="btn primary" onClick={() => setShowAuth(true)}>Join</button>
      </div>
    </div>
  </header>

  <main className="wrap">
    <section className="hero">
      <h1>Real People. Real News. Real Time</h1>
      
        Explore your local area
      
    </section>
  </main>

  {showAuth && (
    <div className="cpl-modalOverlay">
      <div className="cpl-modal">

        <button onClick={() => setShowAuth(false)}>×</button>

        <button onClick={() => safeRedirect("Google")}>
          Google
        </button>

        <button onClick={() => safeRedirect("Facebook")}>
          Facebook
        </button>

        <button onClick={() => safeRedirect()}>
          Email
        </button>

      </div>
    </div>
  )}

  {authLoading && <div>Signing you in…</div>}
</div>


);
}

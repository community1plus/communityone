import { useAuth } from "../../context/AuthContext";
export default function CommunityPlusLandingPage() {
  const { login, loading } = useAuth();

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ===============================
     LOGIN
  =============================== */
  const handleEntry = async () => {
    if (authLoading) return;

    setAuthError("");
    setAuthLoading(true);

    try {
      await login(); // 🔥 AuthContext will update state
    } catch (err) {
      console.error(err);
      setShowFallback(true);
      setAuthError("Unable to connect. Use email login.");
      setAuthLoading(false);
    }
  };

  /* ===============================
     FALLBACK EMAIL LOGIN
  =============================== */
  const handleEmailLogin = async () => {
    if (authLoading) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      await signIn({
        username: email.trim(),
        password,
      });

      // 🔥 DO NOTHING — let AuthContext update
    } catch (err) {
      setAuthError(err?.message || "Login failed");
      setAuthLoading(false);
    }
  };

  /* ===============================
     LOADING GUARD
  =============================== */
  if (loading) return null;

  return (
    <div className="cpl-root">
      <main className="main-full">
        <div className="app-title">COMMUNITY ONE</div>

        <div className="headline-row">
          <div className="headline-text">
            <h1 className="tagline">
              Real People. <span className="accent">Real News.</span> Real Time
            </h1>

            <p className="sub">
              A map-first local feed that prioritises what’s happening <b>here</b>.
            </p>

            <button
              className="btn primary"
              onClick={handleEntry}
              disabled={authLoading}
            >
              {authLoading ? "Connecting..." : "Explore your local area"}
            </button>
          </div>

          <div
            className="echo-inline"
            onClick={handleEntry}
            style={{ cursor: "pointer" }}
          >
            <img src="/logo/echo.png" alt="Echo" />
            <div className="echo-pulse"></div>
          </div>
        </div>
      </main>

      {/* FALLBACK LOGIN */}
      {showFallback && (
        <div className="cpl-modalOverlay">
          <div className="cpl-authModal">
            <h2>Sign In</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleEmailLogin} disabled={authLoading}>
              {authLoading ? "Signing in..." : "Sign In"}
            </button>

            {authError && <div className="error">{authError}</div>}
          </div>
        </div>
      )}

      {/* LOADING OVERLAY */}
      {authLoading && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-box">
            Redirecting to secure login…
          </div>
        </div>
      )}
    </div>
  );
}
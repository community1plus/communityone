const loadUser = useCallback(async () => {
  if (!mountedRef.current) return;
  if (loadingRef.current) return;

  loadingRef.current = true;

  try {
    // 🔥 small delay → allow Amplify to hydrate after redirect
    await new Promise((r) => setTimeout(r, 100));

    let session;

    /* =========================
       SAFE SESSION FETCH
    ========================= */

    try {
      session = await fetchAuthSession({ forceRefresh: true });
    } catch (err) {
      console.log("⚠️ No active session (expected)");

      if (mountedRef.current) {
        setUser(null);
        setAppUser(null);
      }

      return;
    }

    let tokens = session?.tokens;

    /* =========================
       🔥 TOKEN RETRY (CRITICAL FIX)
    ========================= */

    if (!tokens?.idToken || !tokens?.accessToken) {
      console.log("⚠️ Missing tokens, retrying...");

      await new Promise((r) => setTimeout(r, 500));

      try {
        const retrySession = await fetchAuthSession();
        tokens = retrySession?.tokens;

        if (!tokens?.idToken || !tokens?.accessToken) {
          console.log("❌ Still no tokens after retry");

          if (mountedRef.current) {
            setUser(null);
            setAppUser(null);
          }

          return;
        }

        session = retrySession;

      } catch (err) {
        console.log("❌ Retry failed");

        if (mountedRef.current) {
          setUser(null);
          setAppUser(null);
        }

        return;
      }
    }

    /* =========================
       NORMAL FLOW
    ========================= */

    const idToken = tokens.idToken;
    const accessToken = tokens.accessToken;

    const idPayload = idToken.payload || {};
    const accessPayload = accessToken.payload || {};

    const normalizedUser = {
      authenticated: true,
      sub: idPayload.sub || null,
      email: idPayload.email || null,
      email_verified: idPayload.email_verified || false,
      username:
        accessPayload.username ||
        idPayload["cognito:username"] ||
        idPayload.username ||
        null,
      name: idPayload.name || null,
    };

    if (mountedRef.current) {
      setUser(normalizedUser);
    }

    /* =========================
       BACKEND USER
    ========================= */

    try {
      const res = await fetch(
        "https://communityone-backend.onrender.com/api/users/me",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken.toString()}`,
          },
        }
      );

      const data = await res.json();

      if (mountedRef.current) {
        setAppUser({
          user: data?.user || null,
          hasProfile: data?.hasProfile || false,
          profile: data?.profile || null,
        });
      }

    } catch (err) {
      console.error("❌ Backend fetch failed:", err);

      if (mountedRef.current) {
        setAppUser({
          user: null,
          hasProfile: false,
          profile: null,
        });
      }
    }

  } catch (err) {
    console.error("❌ Auth fatal error:", err);

    if (mountedRef.current) {
      setUser(null);
      setAppUser(null);
    }

  } finally {
    if (mountedRef.current) {
      setLoading(false);
    }

    loadingRef.current = false;
  }
}, []);
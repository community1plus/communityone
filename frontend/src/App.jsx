function ProfileGate({ children }) {
  const location = useLocation();

  const {
    isAuthenticated,
    isGuest,
    loading,
    authLoading,
  } = useAuth();

  const {
    profile,
    profileReady,
    basicProfileCompletion,
  } = useProfile();

  console.log("PROFILE GATE", {
    profileReady,
    basicProfileCompletion,
    profile,
  });

  if (loading || authLoading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!isAuthenticated || isGuest) {
    return children;
  }

  if (!profileReady) {
    return <div style={{ padding: 40 }}>Loading profile...</div>;
  }

  if (basicProfileCompletion < 100) {
    return (
      <Navigate
        to="/profile"
        replace
        state={{
          profileRequired: true,
          returnTo: location.pathname + location.search,
        }}
      />
    );
  }

  return children;
}
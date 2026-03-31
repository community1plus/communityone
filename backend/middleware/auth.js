export async function mockAuth(req, res, next) {
  // Simulated logged-in user
  req.user = {
    sub: "test-sub-123",
    email: "test@example.com",

    // IMPORTANT: match your system
    profile_id: "test-profile-id"
  };

  next();
}
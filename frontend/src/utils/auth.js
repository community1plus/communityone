export function getDisplayName(user) {
  if (!user) return "Guest";

  const attrs = user?.signInDetails?.loginId
    ? null
    : user?.attributes;

  return (
    attrs?.preferred_username ||
    attrs?.name ||
    attrs?.given_name ||
    attrs?.email?.split("@")[0] ||
    user?.username?.replace(/^google_/, "") ||
    "User"
  );
}
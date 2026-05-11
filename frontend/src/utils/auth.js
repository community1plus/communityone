export function getDisplayName(user) {
  if (!user) {
    return "Guest";
  }

  const attributes = user?.attributes || {};
  const loginId = user?.signInDetails?.loginId;

  /* =========================
     PRIORITY ORDER
  ========================= */

  const displayName =
    attributes.preferred_username ||
    attributes.name ||
    attributes.given_name ||

    /* email before username */
    attributes.email?.split("@")[0] ||

    /* federated login email */
    loginId?.split("@")[0] ||

    /* fallback username cleanup */
    user?.username
      ?.replace(/^google_/, "")
      ?.replace(/^facebook_/, "") ||

    "User";

  /* =========================
     CLEANUP
  ========================= */

  return String(displayName)
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
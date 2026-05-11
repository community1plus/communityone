export function getDisplayName(user) {
  if (!user) return "Guest";

  const attrs = user?.attributes || {};

  /* ---------------------------------
     GOOGLE / SOCIAL PROVIDERS
  --------------------------------- */

  if (attrs.name) {
    return attrs.name.split(" ")[0];
  }

  if (attrs.given_name) {
    return attrs.given_name;
  }

  if (attrs.preferred_username) {
    return attrs.preferred_username;
  }

  /* ---------------------------------
     EMAIL LOGIN
  --------------------------------- */

  if (attrs.email) {
    return attrs.email.split("@")[0];
  }

  /* ---------------------------------
     AMPLIFY USERNAME FALLBACK
  --------------------------------- */

  if (user?.username) {
    return user.username
      .replace(/^google_/, "")
      .replace(/^facebook_/, "")
      .split("@")[0];
  }

  /* ---------------------------------
     LOGIN ID FALLBACK
  --------------------------------- */

  if (user?.signInDetails?.loginId) {
    return user.signInDetails.loginId.split("@")[0];
  }

  return "User";
}
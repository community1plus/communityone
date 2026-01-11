import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,

    // ✅ Add Google + Facebook social sign-in
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
      },
      facebook: {
        clientId: secret("4245144389105101"),
        clientSecret: secret("296ae4bffd3a52876cd81353afa47fcd"),
      },

      // ✅ MUST match your app URLs (dev + prod)
      callbackUrls: [
        "http://localhost:5173/",
        "https://community.one/",
      ],
      logoutUrls: [
        "http://localhost:5173/",
        "https://community.one/",
      ],
    },
  },
});


import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    //////
    // ✅ Add Google + Facebook social sign-in
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
      },
      facebook: {
        clientId: secret("FACEBOOK_APP_ID"),
        clientSecret: secret("FACEBOOK_APP_SECRET"),
      },
      //
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


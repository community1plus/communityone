
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

const REGION =
  process.env.COGNITO_REGION || "ap-southeast-2";

const USER_POOL_ID =
  process.env.COGNITO_USER_POOL_ID || "ap-southeast-2_2TGqghCuO";

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

if (!CLIENT_ID) {
  throw new Error(
    "Missing required environment variable: COGNITO_CLIENT_ID"
  );
}

const ISSUER =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const JWKS_URL = `${ISSUER}/.well-known/jwks.json`;

let jwksCache = null;

async function getJwks(forceRefresh = false) {
  if (jwksCache && !forceRefresh) {
    return jwksCache;
  }

  const response = await fetch(JWKS_URL);

  if (!response.ok) {
    throw new Error("Unable to load Cognito signing keys");
  }

  const data = await response.json();

  if (!Array.isArray(data.keys)) {
    throw new Error("Invalid Cognito signing-key response");
  }

  const keys = {};

  for (const key of data.keys) {
    if (key.kid && key.kty === "RSA") {
      keys[key.kid] = jwkToPem(key);
    }
  }

  if (!Object.keys(keys).length) {
    throw new Error("No usable Cognito signing keys");
  }

  jwksCache = keys;
  return keys;
}

async function verifyIdToken(token) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Missing secondary Cognito ID token");
  }

  const decoded = jwt.decode(token, { complete: true });

  if (
    !decoded ||
    typeof decoded !== "object" ||
    decoded.header?.alg !== "RS256" ||
    !decoded.header?.kid
  ) {
    throw new Error("Invalid Cognito ID token format");
  }

  let keys = await getJwks();
  let pem = keys[decoded.header.kid];

  if (!pem) {
    keys = await getJwks(true);
    pem = keys[decoded.header.kid];
  }

  if (!pem) {
    throw new Error("Cognito signing key not found");
  }

  const claims = jwt.verify(token, pem, {
    algorithms: ["RS256"],
    issuer: ISSUER,
    audience: CLIENT_ID,
  });

  if (claims.token_use !== "id") {
    throw new Error("Secondary token must be a Cognito ID token");
  }

  if (!claims.sub) {
    throw new Error("Secondary Cognito token has no subject");
  }

  return claims;
}


function getFederatedMethod(claims) {
  const identities = claims.identities;

  // No identities claim does not, by itself, prove
  // direct email authentication.
  if (!Array.isArray(identities) || identities.length === 0) {
    throw new Error(
      "Unable to establish the secondary authentication method"
    );
  }

  const providers = new Set(
    identities
      .map((identity) =>
        String(identity?.providerName || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
  );

  // Reject ambiguous or unsupported provider claims.
  if (providers.size !== 1) {
    throw new Error(
      "Secondary authentication provider is ambiguous"
    );
  }

  if (providers.has("facebook")) {
    return "facebook";
  }

  if (providers.has("google")) {
    return "google";
  }

  throw new Error(
    "Unsupported federated authentication method"
  );
}


/**
 * Verify a secondary Cognito ID token and return a server-created
 * identity context for the generic linking service.
 *
 * Never pass a client-supplied verificationSource or authMethod
 * into this function.
 */
export async function verifySecondaryCognitoIdentity(token) {
  const claims = await verifyIdToken(token);
  const authMethod = getFederatedMethod(claims);

  const email = String(claims.email || "")
    .trim()
    .toLowerCase();

  return Object.freeze({
    cognitoSub: claims.sub,
    email,
    emailVerified: claims.email_verified === true,
    authMethod,
    issuer: claims.iss,
    verified: true,
    verificationSource: "server-cognito-verifier",
  });
}

import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

import { resolveIdentity } from "../services/identityService.js";

/* =====================================================
   COGNITO CONFIGURATION
===================================================== */

const REGION =
  process.env.COGNITO_REGION || "ap-southeast-2";

const USER_POOL_ID =
  process.env.COGNITO_USER_POOL_ID || "ap-southeast-2_2TGqghCuO";

const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;

if (!COGNITO_CLIENT_ID) {
  throw new Error(
    "Missing required environment variable: COGNITO_CLIENT_ID"
  );
}

const COGNITO_ISSUER =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const JWKS_URL =
  `${COGNITO_ISSUER}/.well-known/jwks.json`;

let jwksCache = null;

/* =====================================================
   JWKS
===================================================== */

async function getJwks({ forceRefresh = false } = {}) {
  if (jwksCache && !forceRefresh) {
    return jwksCache;
  }

  const response = await fetch(JWKS_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to load Cognito JWKS: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.keys)) {
    throw new Error("Invalid Cognito JWKS response");
  }

  const keys = {};

  for (const key of data.keys) {
    if (key.kid) {
      keys[key.kid] = jwkToPem(key);
    }
  }

  if (Object.keys(keys).length === 0) {
    throw new Error("Cognito JWKS contains no usable signing keys");
  }

  jwksCache = keys;

  console.log("Cognito JWKS loaded");

  return jwksCache;
}

/* =====================================================
   TOKEN EXTRACTION
===================================================== */

function getBearerToken(req) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  return match?.[1] ?? null;
}

/* =====================================================
   TOKEN VERIFICATION
===================================================== */

function verifyWithPem(token, pem) {
  return jwt.verify(token, pem, {
    algorithms: ["RS256"],
    issuer: COGNITO_ISSUER,
    audience: COGNITO_CLIENT_ID,
  });
}

async function verifyCognitoToken(token) {
  const decoded = jwt.decode(token, { complete: true });

  if (
    !decoded ||
    typeof decoded !== "object" ||
    !decoded.header?.kid
  ) {
    throw new Error("Invalid Cognito token format");
  }

  let jwks = await getJwks();
  let pem = jwks[decoded.header.kid];

  // Refresh once if Cognito has rotated its signing key.
  if (!pem) {
    jwks = await getJwks({ forceRefresh: true });
    pem = jwks[decoded.header.kid];
  }

  if (!pem) {
    throw new Error("Cognito signing key not found");
  }

  return verifyWithPem(token, pem);
}

/* =====================================================
   PLATFORM AUTHENTICATION CONTEXT
===================================================== */
export async function verifyCognitoIdTokenFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    const error = new Error("Missing authorization token");
    error.code = "AUTH_TOKEN_MISSING";
    throw error;
  }

  const verified = await verifyCognitoToken(match[1]);

  if (verified.token_use !== "id") {
    const error = new Error("Invalid token type");
    error.code = "INVALID_TOKEN_TYPE";
    throw error;
  }

  if (!verified.sub || !verified.email) {
    const error = new Error("Cognito token must contain subject and email");
    error.code = "TOKEN_CLAIMS_MISSING";
    throw error;
  }

  return verified;
}

async function buildAuthContext(verified) {
  const cognitoSub = verified.sub;
  const email = verified.email || "";
  const cognitoUsername =
    verified["cognito:username"] ||
    verified.username ||
    "";

  if (!cognitoSub) {
    throw new Error("Cognito token is missing subject");
  }

const identity = await resolveIdentity({
  cognitoSub,
  email,
  cognitoUsername,
  emailVerified: false,
});

  if (!identity?.userId) {
    throw new Error("Platform identity could not be resolved");
  }

  console.log("Platform identity resolved", {
    userId: identity.userId,
    personId: identity.personId ?? null,
    onboardingStatus: identity.onboardingStatus ?? null,
    participationScope: identity.participationScope ?? null,
  });

  return {
    // Canonical Community One account identifier.
    id: identity.userId,
    userId: identity.userId,

    // External authentication identity.
    cognitoSub: identity.cognitoSub,
    email: identity.email,
    username: identity.username,

    // Domain participation context.
    personId: identity.personId ?? null,
    personStatus: identity.personStatus ?? null,
    onboardingStatus: identity.onboardingStatus ?? null,
    participationScope: identity.participationScope ?? null,

    // Authentication metadata.
    tokenUse: verified.token_use || "",
    provider: verified.identities || null,
  };
}

/* =====================================================
   AUTHENTICATION MIDDLEWARE
===================================================== */

export default async function authMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        error: "Missing authorization token",
      });
    }

    const verified = await verifyCognitoToken(token);

    // This API expects a Cognito ID token.
    if (verified.token_use !== "id") {
      return res.status(401).json({
        error: "Invalid token type",
      });
    }

    req.user = await buildAuthContext(verified);

    console.log("Authentication successful", {
      userId: req.user.userId,
      personId: req.user.personId,
      onboardingStatus: req.user.onboardingStatus,
      participationScope: req.user.participationScope,
    });

    return next();

  } catch (err) {
    // Email verification is a known application state.
    if (err.code === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        error: "Email verification required",
        message:
          "Please verify your email address before continuing.",
      });
    }

    // Invalid or expired JWTs are authentication failures.
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError" ||
      err.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    // Log unexpected failures before returning.
    console.error("Authentication middleware failed", {
      name: err.name,
      message: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined,
    });

    return res.status(500).json({
      error: "Unable to establish authentication context",
    });
  }

}

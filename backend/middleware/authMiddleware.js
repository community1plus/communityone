import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

import {
  resolveIdentity,
} from "../services/identityService.js";


/* =====================================================
   COGNITO CONFIG
===================================================== */

const REGION =
  process.env.COGNITO_REGION ||
  "ap-southeast-2";

const USER_POOL_ID =
  process.env.COGNITO_USER_POOL_ID ||
  "ap-southeast-2_2TGqghCuO";

const COGNITO_ISSUER =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const JWKS_URL =
  `${COGNITO_ISSUER}/.well-known/jwks.json`;


/* =====================================================
   JWKS CACHE
===================================================== */

let jwksCache = null;


/* =====================================================
   LOAD COGNITO JWKS
===================================================== */

async function getJwks() {

  if (jwksCache) {
    return jwksCache;
  }

  console.log(
    "🔑 Loading Cognito JWKS..."
  );

  const response =
    await fetch(JWKS_URL);

  if (!response.ok) {

    throw new Error(
      `Failed to load Cognito JWKS: ${response.status}`
    );

  }

  const data =
    await response.json();

  if (
    !data.keys ||
    !Array.isArray(data.keys)
  ) {

    throw new Error(
      "Invalid Cognito JWKS response"
    );

  }

  jwksCache = {};

  for (const key of data.keys) {

    if (!key.kid) {
      continue;
    }

    jwksCache[key.kid] =
      jwkToPem(key);

  }

  console.log(
    "✅ Cognito JWKS loaded"
  );

  return jwksCache;
}


/* =====================================================
   EXTRACT BEARER TOKEN
===================================================== */

function getBearerToken(req) {

  const header =
    req.headers.authorization;

  if (!header) {
    return null;
  }

  if (
    !header.startsWith(
      "Bearer "
    )
  ) {

    return null;

  }

  const token =
    header
      .slice(7)
      .trim();

  return token || null;
}


/* =====================================================
   VERIFY COGNITO TOKEN
===================================================== */

async function verifyCognitoToken(
  token
) {

  const decoded =
    jwt.decode(
      token,
      {
        complete: true,
      }
    );


  if (
    !decoded ||
    !decoded.header ||
    !decoded.header.kid
  ) {

    throw new Error(
      "Invalid Cognito token format"
    );

  }


  const jwks =
    await getJwks();

  const pem =
    jwks[
      decoded.header.kid
    ];


  if (!pem) {

    /*
     * The Cognito signing key may have
     * rotated since our JWKS was cached.
     *
     * Clear the cache and retry once.
     */

    jwksCache = null;

    const refreshedJwks =
      await getJwks();

    const refreshedPem =
      refreshedJwks[
        decoded.header.kid
      ];


    if (!refreshedPem) {

      throw new Error(
        "Cognito signing key not found"
      );

    }


    return verifyWithPem(
      token,
      refreshedPem
    );

  }


  return verifyWithPem(
    token,
    pem
  );

}


/* =====================================================
   VERIFY WITH PEM
===================================================== */

function verifyWithPem(
  token,
  pem
) {

  return jwt.verify(
    token,
    pem,
    {
      algorithms: [
        "RS256",
      ],

      issuer:
        COGNITO_ISSUER,
    }
  );

}


/* =====================================================
   BUILD PLATFORM AUTH CONTEXT
===================================================== */

async function buildAuthContext(
  verified
) {

  const cognitoSub =
    verified.sub;

  const email =
    verified.email ||
    "";

  const cognitoUsername =
    verified[
      "cognito:username"
    ] ||
    verified.username ||
    "";

  const emailVerified =
    verified.email_verified === true;


  console.log(
    "🔗 Resolving Community One identity:",
    {
      cognitoSub,
      email,
      cognitoUsername,
      emailVerified,
    }
  );


  const identity =
    await resolveIdentity({

      cognitoSub,

      email,

      cognitoUsername,

      emailVerified,

    });


  console.log(
    "✅ Community One identity resolved:",
    {
      userId:
        identity.userId,

      cognitoSub:
        identity.cognitoSub,

      email:
        identity.email,
    }
  );


  return {

    userId:
      identity.userId,

    cognitoSub:
      identity.cognitoSub,

    email:
      identity.email,

    username:
      identity.username,

    tokenUse:
      verified.token_use ||
      "",

    provider:
      verified.identities ||
      null,

  };

}


/* =====================================================
   AUTH MIDDLEWARE
===================================================== */

export default async function authMiddleware(
  req,
  res,
  next
) {

  try {

    /* =========================================
       1. EXTRACT TOKEN
    ========================================= */

    const token =
      getBearerToken(req);


    if (!token) {

      console.warn(
        "🔐 Authentication failed: missing bearer token"
      );

      return res.status(401).json({

        error:
          "Missing authorization token",

      });

    }


    /* =========================================
       2. VERIFY COGNITO TOKEN
    ========================================= */

    const verified =
      await verifyCognitoToken(
        token
      );


    /* =========================================
       3. TOKEN TYPE
    ========================================= */

    if (
      verified.token_use &&
      verified.token_use !== "id"
    ) {

      console.warn(
        "⚠️ Unexpected Cognito token type:",
        verified.token_use
      );

      return res.status(401).json({

        error:
          "Invalid token type",

      });

    }


    /* =========================================
       4. RESOLVE PLATFORM IDENTITY
    ========================================= */

    req.user =
      await buildAuthContext(
        verified
      );


    /* =========================================
       5. AUTH CHECKPOINT
    ========================================= */

    console.log(
      "✅ AUTH SUCCESS:",
      {
        userId:
          req.user.userId,

        cognitoSub:
          req.user.cognitoSub,

        email:
          req.user.email,

        username:
          req.user.username,

      }
    );


    return next();

  } catch (err) {

    console.error(
      "❌ AUTH ERROR:",
      {
        message:
          err.message,

        name:
          err.name,

        stack:
          process.env.NODE_ENV ===
          "development"
            ? err.stack
            : undefined,
      }
    );


    return res.status(401).json({

      error:
        "Authentication failed",

    });

  }

}
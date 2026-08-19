import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

import {
  resolveIdentity,
} from "../services/identityService.js";


/* =====================================================
   COGNITO CONFIG
===================================================== */

const REGION =
  "ap-southeast-2";

const USER_POOL_ID =
  "ap-southeast-2_2TGqghCuO";

const COGNITO_ISSUER =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const JWKS_URL =
  `${COGNITO_ISSUER}/.well-known/jwks.json`;


/* =====================================================
   JWKS CACHE
===================================================== */

let pems = null;


/* =====================================================
   LOAD JWKS
===================================================== */

async function getPems() {

  if (pems) {
    return pems;
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

  pems = {};

  for (const key of data.keys) {

    pems[key.kid] =
      jwkToPem(key);

  }

  console.log(
    "✅ Cognito JWKS loaded"
  );

  return pems;
}


/* =====================================================
   EXTRACT BEARER TOKEN
===================================================== */

function getBearerToken(req) {

  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {

    return null;

  }

  return authHeader
    .slice("Bearer ".length)
    .trim();

}


/* =====================================================
   VERIFY TOKEN
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
      "Invalid token format"
    );

  }


  const pems =
    await getPems();

  const pem =
    pems[
      decoded.header.kid
    ];


  if (!pem) {

    throw new Error(
      "Invalid token signature"
    );

  }


  return jwt.verify(
    token,
    pem,
    {
      algorithms: ["RS256"],

      issuer:
        COGNITO_ISSUER,
    }
  );

}


/* =====================================================
   BUILD AUTH CONTEXT
===================================================== */

async function buildAuthContext(verified) {

  console.log(
    "🔗 BUILDING AUTH CONTEXT:",
    {
      cognitoSub:
        verified.sub,

      email:
        verified.email,

      username:
        verified["cognito:username"] ||
        verified.username ||
        "",
    }
  );

  const identity =
    await resolveIdentity({

      cognitoSub:
        verified.sub,

      email:
        verified.email,

      cognitoUsername:
        verified["cognito:username"] ||
        verified.username ||
        "",

    });


  console.log(
    "✅ PLATFORM IDENTITY RESOLVED:",
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
       TOKEN
    ========================================= */

    const token =
      getBearerToken(req);


    console.log(
      "🔐 AUTH HEADER:",
      token
        ? "PRESENT"
        : "MISSING"
    );


    if (!token) {

      return res.status(401).json({

        error:
          "Missing authorization token",

      });

    }


    /* =========================================
       VERIFY COGNITO TOKEN
    ========================================= */

    const verified =
      await verifyCognitoToken(
        token
      );
console.log(
  "🔎 COGNITO IDENTITY CHECK:",
  {
    sub: verified.sub,
    email: verified.email,
    username:
      verified["cognito:username"],
    tokenUse:
      verified.token_use,
    issuer:
      verified.iss,
  }
);

    console.log(
      "✅ COGNITO TOKEN VERIFIED:",
      {
        sub:
          verified.sub,

        email:
          verified.email,

        username:
          verified["cognito:username"],

        tokenUse:
          verified.token_use,
      }
    );


    /* =========================================
       TOKEN TYPE
    ========================================= */

    if (
      verified.token_use &&
      verified.token_use !== "id"
    ) {

      console.warn(
        "⚠️ NON-ID TOKEN RECEIVED:",
        verified.token_use
      );

    }


    /* =========================================
       RESOLVE PLATFORM IDENTITY
    ========================================= */
console.log(
  "🔗 RESOLVING COMMUNITY ONE USER:",
  {
    cognitoSub: verified.sub,
    email: verified.email,
  }
);
    req.user =
      await buildAuthContext(
        verified
      );


    /* =========================================
       IDENTITY CHECKPOINT
    ========================================= */

    console.log(
      "🔗 COMMUNITY ONE IDENTITY:",
      {
        cognitoSub:
          req.user.cognitoSub,

        userId:
          req.user.userId,

        email:
          req.user.email,

        username:
          req.user.username,
      }
    );


    console.log(
      "✅ AUTH SUCCESS"
    );


    return next();

} catch (err) {

  console.error(
    "❌ AUTH ERROR:",
    {
      message: err.message,
      name: err.name,
      stack:
        process.env.NODE_ENV === "development"
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
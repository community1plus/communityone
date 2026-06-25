import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

/* =========================================
   COGNITO CONFIG
========================================= */

const REGION =
  "ap-southeast-2";

const USER_POOL_ID =
  "ap-southeast-2_2TGqghCuO";

const COGNITO_ISSUER =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const JWKS_URL =
  `${COGNITO_ISSUER}/.well-known/jwks.json`;

/* =========================================
   JWKS CACHE
========================================= */

let pems = null;

/* =========================================
   LOAD JWKS
========================================= */

async function getPems() {

  if (pems) {
    return pems;
  }

  console.log(
    "🔑 LOADING COGNITO JWKS..."
  );

  const response =
    await fetch(JWKS_URL);

  if (!response.ok) {

    throw new Error(
      `Failed to load JWKS: ${response.status}`
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
    "✅ JWKS LOADED"
  );

  return pems;
}

/* =========================================
   AUTH MIDDLEWARE
========================================= */

export default async function authMiddleware(
  req,
  res,
  next
) {

  try {

    /* =========================================
       AUTH HEADER
    ========================================= */

    const authHeader =
      req.headers.authorization;

    console.log(
      "🔐 AUTH HEADER:",
      authHeader
        ? "PRESENT"
        : "MISSING"
    );

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({
        error:
          "Missing authorization token",
      });
    }

    /* =========================================
       TOKEN
    ========================================= */

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    console.log(
      "🎫 TOKEN PREFIX:",
      token.slice(0, 25)
    );

    /* =========================================
       DECODE TOKEN
    ========================================= */

    const decoded =
      jwt.decode(
        token,
        { complete: true }
      );

    if (
      !decoded ||
      !decoded.header ||
      !decoded.header.kid
    ) {

      console.error(
        "❌ INVALID TOKEN FORMAT"
      );

      return res.status(401).json({
        error:
          "Invalid token",
      });
    }

    console.log(
      "🪪 TOKEN HEADER:",
      decoded.header
    );

    console.log(
      "🪪 TOKEN PAYLOAD:",
      decoded.payload
    );

    /* =========================================
       GET PEM
    ========================================= */

    const pems =
      await getPems();

    const pem =
      pems[
        decoded.header.kid
      ];

    if (!pem) {

      console.error(
        "❌ PEM NOT FOUND FOR TOKEN"
      );

      return res.status(401).json({
        error:
          "Invalid token signature",
      });
    }

    /* =========================================
       VERIFY TOKEN
    ========================================= */

    const verified =
      jwt.verify(
        token,
        pem,
        {
          algorithms: ["RS256"],

          issuer:
            COGNITO_ISSUER,
        }
      );

    console.log(
      "✅ VERIFIED TOKEN:",
      verified
    );

    /* =========================================
       OPTIONAL TOKEN TYPE CHECK
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
       ATTACH USER
    ========================================= */

    req.user = {

      id:
        verified.sub,

      sub:
        verified.sub,

      email:
        verified.email || "",

      username:
        verified["cognito:username"] ||

        verified.username ||

        "",

      tokenUse:
        verified.token_use ||
        "",

      provider:
        verified.identities ||
        null,
    };

    console.log(
      "✅ AUTH SUCCESS:",
      req.user
    );

    console.log("AUTH MIDDLEWARE req.user =", req.user);

    return next();

  } catch (err) {

    console.error(
      "❌ AUTH ERROR FULL:",
      {
        message:
          err.message,

        name:
          err.name,

        stack:
          err.stack,
      }
    );

    return res.status(401).json({
      error:
        "Authentication failed",
    });
  }
}
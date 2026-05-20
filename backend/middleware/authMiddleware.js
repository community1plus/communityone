import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

const REGION =
  "ap-southeast-2";

const USER_POOL_ID =
  "ap-southeast-2_2TGqghCuO";

const JWKS_URL =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

let pems = null;

/* =========================
   LOAD JWKS
========================= */

async function getPems() {

  if (pems) {
    return pems;
  }

  const response =
    await fetch(JWKS_URL);

  const data =
    await response.json();

  pems = {};

  for (const key of data.keys) {

    pems[key.kid] =
      jwkToPem(key);
  }

  return pems;
}

/* =========================
   AUTH MIDDLEWARE
========================= */

export default async function authMiddleware(
  req,
  res,
  next
) {

  try {

    const authHeader =
      req.headers.authorization;

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

    const token =
      authHeader.replace(
        "Bearer ",
        ""
      );

    const decoded =
      jwt.decode(
        token,
        { complete: true }
      );

    if (
      !decoded?.header?.kid
    ) {

      return res.status(401).json({
        error:
          "Invalid token",
      });
    }

    const pems =
      await getPems();

    const pem =
      pems[
        decoded.header.kid
      ];

    if (!pem) {

      return res.status(401).json({
        error:
          "Invalid token signature",
      });
    }

    const verified =
      jwt.verify(
        token,
        pem,
        {
          algorithms: ["RS256"],
        }
      );

    import pool from "../src/db/pool.js";

    /* =========================
   LOAD PROFILE
========================= */

const profileResult =
  await pool.query(
    `
    SELECT *
    FROM profiles
    WHERE cognito_sub = $1
    LIMIT 1
    `,
    [verified.sub]
  );

const profile =
  profileResult.rows[0] || null;

/* =========================
   ATTACH USER
========================= */

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

  profile,
};

    console.log(
      "✅ AUTH SUCCESS:",
      req.user.id
    );

    next();

  } catch (err) {

    console.error(
      "❌ AUTH ERROR:",
      err
    );

    return res.status(401).json({
      error:
        "Authentication failed",
    });
  }
}
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

/* ===============================
   CONFIG
=============================== */

const REGION = process.env.AWS_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

const DEBUG_MODE = true;

const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

console.log("🚀 AUTH MIDDLEWARE LOADED");
console.log("🧩 AUTH CONFIG:", {
  REGION,
  USER_POOL_ID,
  ISSUER,
});

/* ===============================
   JWKS CLIENT
=============================== */

const client = jwksClient({
  jwksUri: `${ISSUER}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
});

/* ===============================
   GET SIGNING KEY
=============================== */

function getSigningKey(kid) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        console.error("❌ JWKS ERROR:", err);
        return reject(err);
      }

      resolve(key.getPublicKey());
    });
  });
}

/* ===============================
   VERIFY TOKEN (NO ISSUER CHECK)
=============================== */

async function verifyToken(token) {
  const decodedHeader = jwt.decode(token, { complete: true });

  console.log("🧪 TOKEN HEADER:", decodedHeader?.header);

  if (!decodedHeader?.header?.kid) {
    throw new Error("Missing kid in token header");
  }

  const signingKey = await getSigningKey(decodedHeader.header.kid);

  const decoded = jwt.verify(token, signingKey, {
    algorithms: ["RS256"],
    clockTolerance: 5,
  });

  return decoded;
}

/* ===============================
   🔐 AUTH MIDDLEWARE (FINAL DIAGNOSTIC)
=============================== */

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("📥 AUTH HEADER:", authHeader ? "present" : "missing");

    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("⚠️ Missing Bearer token");

      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Missing or malformed Authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("🔑 TOKEN (truncated):", token.slice(0, 25) + "...");

    let decoded;

    try {
      decoded = await verifyToken(token);
    } catch (err) {
      console.error("❌ JWT VERIFY FAILED:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });

      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }

    /* ===============================
       🔍 FULL TOKEN DEBUG
    =============================== */

    console.log("🔍 TOKEN DEBUG:", {
      sub: decoded.sub,
      token_use: decoded.token_use,
      client_id: decoded.client_id,
      iss: decoded.iss,
      exp: decoded.exp,
    });

    /* ===============================
       🔥 TOKEN TYPE CHECK
    =============================== */

    if (decoded.token_use !== "access") {
      console.warn("⚠️ Non-access token:", decoded.token_use);

      if (!DEBUG_MODE) {
        return res.status(401).json({
          error: "UNAUTHORIZED",
          message: "Access token required",
        });
      }

      console.warn("⚠️ DEBUG MODE: allowing non-access token");
    }

    /* ===============================
       🔍 ISSUER VALIDATION (VISIBLE NOW)
    =============================== */

    console.log("🔍 ISSUER CHECK:", {
      expected: ISSUER,
      actual: decoded.iss,
    });

    if (decoded.iss !== ISSUER) {
      console.error("❌ ISSUER MISMATCH");

      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Invalid issuer",
      });
    }

    /* ===============================
       🔍 CLIENT CHECK
    =============================== */

    if (CLIENT_ID && decoded.client_id) {
      if (decoded.client_id !== CLIENT_ID) {
        console.warn("⚠️ CLIENT_ID mismatch:", {
          expected: CLIENT_ID,
          actual: decoded.client_id,
        });
      }
    }

    /* ===============================
       🔐 NORMALISE USER
    =============================== */

    if (!decoded.sub) {
      console.error("❌ Missing sub");

      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Invalid token payload",
      });
    }

    const username =
      decoded.username ||
      decoded["cognito:username"] ||
      null;

    const email =
      decoded.email ||
      username ||
      `${decoded.sub}@placeholder.local`;

    req.user = {
      sub: decoded.sub,
      email,
      username,
      scope: decoded.scope || null,
      client_id: decoded.client_id || null,
    };

    console.log("✅ AUTH SUCCESS:", req.user.sub);

    return next();

  } catch (err) {
    console.error("🔥 AUTH MIDDLEWARE CRASH:", err);

    return res.status(500).json({
      error: "AUTH_ERROR",
      message: "Authentication middleware failure",
    });
  }
};
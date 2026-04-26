import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

/* ===============================
   CONFIG
=============================== */

const REGION = process.env.AWS_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

/* ===============================
   JWKS CLIENT
=============================== */

const client = jwksClient({
  jwksUri: `${ISSUER}/.well-known/jwks.json`,
});

/* ===============================
   GET SIGNING KEY
=============================== */

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/* ===============================
   🔐 VERIFY TOKEN
=============================== */

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: ISSUER,
      algorithms: ["RS256"],
      audience: CLIENT_ID,
    },
    (err, decoded) => {
      if (err) {
        console.error("❌ JWT ERROR:", err);
        return res.status(401).json({ error: "Invalid token" });
      }

      /* ===============================
         🔥 ENFORCE ID TOKEN ONLY
      =============================== */

      if (decoded.token_use !== "id") {
        return res.status(401).json({ error: "Invalid token type" });
      }

      /* ===============================
         🔐 STANDARD USER OBJECT
      =============================== */

      req.user = {
        sub: decoded.sub, // 🔥 STANDARD
        email: decoded.email,
        name: decoded.name || null,
        username: decoded["cognito:username"],
      };

      next();
    }
  );
};
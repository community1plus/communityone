import express from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

/* ===============================
   🔐 COGNITO CONFIG
=============================== */

const REGION = process.env.AWS_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
const JWKS_URI = `${ISSUER}/.well-known/jwks.json`;

/* ===============================
   🔑 JWKS CLIENT
=============================== */

const client = jwksClient({
  jwksUri: JWKS_URI,
});

/* ===============================
   🔐 GET SIGNING KEY
=============================== */

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/* ===============================
   🛡 VERIFY TOKEN MIDDLEWARE
=============================== */

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: ISSUER,
      algorithms: ["RS256"],
      audience: process.env.COGNITO_CLIENT_ID, // 🔥 REQUIRED
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ error: "Invalid token" });
      }

      // 🔥 Attach REAL user from Cognito
      req.user = {
        userId: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded["cognito:username"],
        username: decoded["cognito:username"],
      };

      next();
    }
  );
};

/* ===============================
   👤 ROUTES
=============================== */

router.get("/me", verifyToken, getMe);

export default router;
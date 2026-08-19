import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import {
  resolveIdentity,
} from "../services/identityService.js";

/* =====================================================
   CONFIG
===================================================== */

const REGION =
  process.env.AWS_REGION;

const USER_POOL_ID =
  process.env.COGNITO_USER_POOL_ID;

const CLIENT_ID =
  process.env.COGNITO_CLIENT_ID;

const ISSUER =
  `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

const DEBUG_MODE =
  process.env.NODE_ENV !== "production";


/* =====================================================
   STARTUP
===================================================== */

console.log("🚀 AUTH MIDDLEWARE LOADED");

console.log("🧩 AUTH CONFIG:", {
  REGION,
  USER_POOL_ID,
  CLIENT_ID: CLIENT_ID ? "configured" : "not configured",
  ISSUER,
});


/* =====================================================
   JWKS CLIENT
===================================================== */

const jwks = jwksClient({

  jwksUri:
    `${ISSUER}/.well-known/jwks.json`,

  cache: true,

  cacheMaxEntries: 5,

  cacheMaxAge:
    10 * 60 * 1000,

});


/* =====================================================
   GET SIGNING KEY
===================================================== */

function getSigningKey(kid) {

  return new Promise(
    (resolve, reject) => {

      jwks.getSigningKey(
        kid,
        (err, key) => {

          if (err) {

            console.error(
              "❌ JWKS ERROR:",
              err
            );

            return reject(err);
          }

          resolve(
            key.getPublicKey()
          );

        }
      );

    }
  );

}


/* =====================================================
   VERIFY COGNITO TOKEN
===================================================== */

async function verifyToken(token) {

  const decoded =
    jwt.decode(
      token,
      {
        complete: true,
      }
    );


  if (
    !decoded ||
    !decoded.header?.kid
  ) {

    throw new Error(
      "Invalid token format"
    );

  }


  const signingKey =
    await getSigningKey(
      decoded.header.kid
    );


  const verified =
    jwt.verify(
      token,
      signingKey,
      {
        algorithms: ["RS256"],

        issuer: ISSUER,

        clockTolerance: 5,
      }
    );


  return verified;

}


/* =====================================================
   EXTRACT BEARER TOKEN
===================================================== */

function getBearerToken(req) {

  const header =
    req.headers.authorization;


  if (
    !header ||
    !header.startsWith("Bearer ")
  ) {

    return null;

  }


  return header
    .slice(7)
    .trim();

}


/* =====================================================
   BUILD COMMUNITY ONE AUTH CONTEXT
===================================================== */

async function buildAuthContext(
  decoded
) {

  const cognitoSub =
    decoded.sub;

  const email =
    decoded.email ||
    "";

  const cognitoUsername =
    decoded["cognito:username"] ||
    decoded.username ||
    "";


  console.log(
    "🔗 Resolving Community One identity:",
    {
      cognitoSub,
      email,
      cognitoUsername,
      emailVerified:
        decoded.email_verified,
    }
  );


  const identity =
    await resolveIdentity({

      cognitoSub,

      email,

      cognitoUsername,

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

    /* Community One identity */

    userId:
      identity.userId,

    /* Cognito identity */

    cognitoSub:
      identity.cognitoSub,

    /* User information */

    email:
      identity.email,

    username:
      identity.username,

    /* Token information */

    tokenUse:
      decoded.token_use ||
      null,

    scope:
      decoded.scope ||
      null,

    clientId:
      decoded.client_id ||
      null,

    provider:
      decoded.identities ||
      null,

  };

}


/* =====================================================
   REQUIRE AUTH
===================================================== */

export const requireAuth =
  async (
    req,
    res,
    next
  ) => {

    try {

      /* ---------------------------------------------
         TOKEN
      --------------------------------------------- */

      const token =
        getBearerToken(req);


      console.log(
        "📥 AUTH HEADER:",
        token
          ? "present"
          : "missing"
      );


      if (!token) {

        return res
          .status(401)
          .json({

            error:
              "UNAUTHORIZED",

            message:
              "Missing or malformed Authorization header",

          });

      }


      /* ---------------------------------------------
         VERIFY TOKEN
      --------------------------------------------- */

      let decoded;


      try {

        decoded =
          await verifyToken(
            token
          );

      } catch (err) {

        console.error(
          "❌ JWT VERIFY FAILED:",
          {
            message:
              err.message,

            name:
              err.name,
          }
        );


        return res
          .status(401)
          .json({

            error:
              "UNAUTHORIZED",

            message:
              "Invalid or expired token",

          });

      }


      /* ---------------------------------------------
         TOKEN DEBUG
      --------------------------------------------- */

      console.log(
        "🔍 TOKEN DEBUG:",
        {
          sub:
            decoded.sub,

          token_use:
            decoded.token_use,

          client_id:
            decoded.client_id,

          iss:
            decoded.iss,

          exp:
            decoded.exp,
        }
      );


      /* ---------------------------------------------
         TOKEN TYPE
      --------------------------------------------- */

      if (
        decoded.token_use !== "id"
      ) {

        console.warn(
          "⚠️ Non-ID token:",
          decoded.token_use
        );


        if (!DEBUG_MODE) {

          return res
            .status(401)
            .json({

              error:
                "UNAUTHORIZED",

              message:
                "ID token required",

            });

        }

      }


      /* ---------------------------------------------
         CLIENT ID
      --------------------------------------------- */

      if (
        CLIENT_ID &&
        decoded.client_id &&
        decoded.client_id !== CLIENT_ID
      ) {

        console.warn(
          "⚠️ CLIENT_ID mismatch:",
          {
            expected:
              CLIENT_ID,

            actual:
              decoded.client_id,
          }
        );

      }


      /* ---------------------------------------------
         SUB
      --------------------------------------------- */

      if (!decoded.sub) {

        return res
          .status(401)
          .json({

            error:
              "UNAUTHORIZED",

            message:
              "Invalid token payload",

          });

      }


      /* ---------------------------------------------
         COMMUNITY ONE IDENTITY
      --------------------------------------------- */

      req.user =
        await buildAuthContext(
          decoded
        );


      /* ---------------------------------------------
         AUTH CHECKPOINT
      --------------------------------------------- */

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
        "🔥 AUTH MIDDLEWARE CRASH:",
        {
          message:
            err.message,

          name:
            err.name,

          stack:
            DEBUG_MODE
              ? err.stack
              : undefined,
        }
      );


      return res
        .status(401)
        .json({

          error:
            "AUTHENTICATION_FAILED",

          message:
            DEBUG_MODE
              ? err.message
              : "Authentication failed",

        });

    }

  };
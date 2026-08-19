import {
  getUserByIdWithProfile,
} from "../services/userService.js";


/* =====================================================
   GET CURRENT USER + PROFILE
===================================================== */

export async function getMe(
  req,
  res
) {

  try {

    /* =========================================
       AUTH CONTEXT
    ========================================= */

    const userId =
      req.user?.userId;

    const email =
      req.user?.email || "";


    console.log(
      "👤 /me identity:",
      {
        userId,

        cognitoSub:
          req.user?.cognitoSub,

        email,
      }
    );


    /* =========================================
       VALIDATE IDENTITY
    ========================================= */

    if (!userId) {

      console.error(
        "❌ /me missing Community One userId"
      );

      return res.status(401).json({

        error:
          "Unauthorized: invalid identity",

      });

    }


    /* =========================================
       LOAD USER + PROFILE
    ========================================= */

    const result =
      await getUserByIdWithProfile(
        userId
      );


    const user =
      result?.user ||
      null;

    const profile =
      result?.profile ||
      null;


    if (!user?.id) {

      throw new Error(
        "Community One user not found"
      );

    }


    /* =========================================
       NORMALISE PROFILE
    ========================================= */

    const safeProfile =
      profile
        ? {
            ...profile,

            version:
              profile.version ?? 1,
          }
        : null;


    /* =========================================
       RESPONSE
    ========================================= */

    const response = {

      user: {

        id:
          user.id,

        email:
          user.email,

        created_at:
          user.created_at,

        updated_at:
          user.updated_at,

        last_login:
          user.last_login,

      },

      profile:
        safeProfile,

      hasProfile:
        !!safeProfile,

    };


    console.log(
      "✅ /me response:",
      {
        userId:
          user.id,

        hasProfile:
          response.hasProfile,
      }
    );


    return res.status(200).json(
      response
    );


  } catch (err) {

    console.error(
      "🔥 /me ERROR:",
      {
        message:
          err.message,

        stack:
          process.env.NODE_ENV === "development"
            ? err.stack
            : undefined,
      }
    );


    /*
     * Authentication has already succeeded.
     *
     * Preserve the authenticated platform
     * identity if profile retrieval fails.
     */

    return res.status(200).json({

      user: {

        id:
          req.user?.userId ||
          null,

        email:
          req.user?.email ||
          "",

        cognito_sub:
          req.user?.cognitoSub ||
          null,

      },

      profile:
        null,

      hasProfile:
        false,

      degraded:
        true,

    });

  }

}
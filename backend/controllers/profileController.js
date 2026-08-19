import {
  getProfile,
  putProfile,
  patchProfile,
} from "../services/profileService.js";


/* =====================================================
   GET PROFILE
===================================================== */

export async function getProfile(
  req,
  res
) {

  try {

    const userId =
      req.user?.userId;

    if (!userId) {

      return res.status(401).json({
        error:
          "Authentication required.",
      });

    }

    const result =
      await getProfile({
        userId,
      });

    return res.status(200).json(
      result
    );

  } catch (err) {

    console.error(
      "[PROFILE GET] ERROR:",
      err
    );

    return res.status(500).json({
      error:
        "Profile retrieval failed",
      detail:
        err.message,
    });

  }

}


/* =====================================================
   PUT PROFILE
===================================================== */

export async function putProfile(
  req,
  res
) {

  try {

    const userId =
      req.user?.userId;

    if (!userId) {

      return res.status(401).json({
        error:
          "Authentication required.",
      });

    }

    const result =
      await putProfileService({
        userId,
        body:
          req.body || {},
        req,
      });

    return res.status(200).json(
      result
    );

  } catch (err) {

    console.error(
      "[PROFILE PUT] ERROR:",
      err
    );

    return res.status(500).json({
      error:
        "Profile update failed",
      detail:
        err.message,
    });

  }

}


/* =====================================================
   PATCH PROFILE
===================================================== */

export async function patchProfile(
  req,
  res
) {

  try {

    const userId =
      req.user?.userId;

    console.log(
      "[PROFILE PATCH] USER ID:",
      userId
    );


    if (!userId) {

      return res.status(401).json({
        error:
          "Authentication required.",
      });

    }


    const result =
      await patchProfileService({

        userId,

        body:
          req.body || {},

        req,

      });


    console.log(
      "[PROFILE PATCH] SUCCESS:",
      {
        userId,
        version:
          result.version,
      }
    );


    return res.status(200).json(
      result
    );


  } catch (err) {

    console.error(
      "[PROFILE PATCH] ERROR:",
      {
        message:
          err.message,

        stack:
          process.env.NODE_ENV ===
          "development"
            ? err.stack
            : undefined,
      }
    );


    if (
      err.message ===
      "Profile not found"
    ) {

      return res.status(404).json({
        error:
          "Profile not found",
      });

    }


    return res.status(500).json({

      error:
        "Profile update failed",

      detail:
        err.message,

    });

  }

}
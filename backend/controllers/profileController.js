import {
  getProfileService,
  putProfileService,
  patchProfileService,
} from "../services/profileService.js";


/* =====================================================
   GET PROFILE
===================================================== */

export async function getProfile(req, res) {

  try {

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const result =
      await getProfileService({
        userId,
      });

    return res.status(200).json(result);

  } catch (err) {

    console.error(
      "[PROFILE GET] ERROR:",
      err
    );

    return res.status(500).json({
      error: "Failed to load profile",
      detail: err.message,
    });
  }
}


/* =====================================================
   PUT PROFILE
===================================================== */

export async function putProfile(req, res) {

  try {

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const result =
      await putProfileService({
        userId,
        body: req.body,
        req,
      });

    return res.status(200).json(result);

  } catch (err) {

    console.error(
      "[PROFILE PUT] ERROR:",
      err
    );

    return res.status(500).json({
      error: "Profile update failed",
      detail: err.message,
    });
  }
}


/* =====================================================
   PATCH PROFILE
===================================================== */

export async function patchProfile(req, res) {

  try {

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    console.log(
      "========================================"
    );

    console.log(
      "[PROFILE PATCH] START"
    );

    console.log(
      "[PROFILE PATCH] USER ID:",
      userId
    );

    console.log(
      "[PROFILE PATCH] BODY:",
      JSON.stringify(req.body, null, 2)
    );

    const result =
      await patchProfileService({
        userId,
        body: req.body,
        req,
      });

    console.log(
      "[PROFILE PATCH] SUCCESS:",
      {
        userId,
        version: result?.version,
      }
    );

    return res.status(200).json(result);

  } catch (err) {

    console.error(
      "[PROFILE PATCH] ERROR:",
      {
        message: err.message,
        stack: err.stack,
      }
    );

    if (err.message === "Profile not found") {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    return res.status(500).json({
      error: "Profile update failed",
      detail: err.message,
    });
  }
}
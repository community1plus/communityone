import express from "express";

import { requireAuth }
  from "../../middleware/auth.js";

import {
  getProfile,
  putProfile,
  patchProfile,
} from "../../controllers/profileController.js";

const router =
  express.Router();

/* ===============================
   GET /api/profile
=============================== */

router.get(
  "/",
  requireAuth,
  getProfile
);

/* ===============================
   PUT /api/profile
=============================== */

router.put(
  "/",
  requireAuth,
  putProfile
);

/* ===============================
   PATCH /api/profile
=============================== */

router.patch(
  "/",
  requireAuth,
  patchProfile
);

export default router;
import express from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
    getProfile,
    putProfile,
    patchProfile,
} from "../../controllers/profileController.js";


const router = express.Router();


/* =====================================
   PROFILE
   Base: /api/profile
===================================== */


/* -------------------------------------
   GET /api/profile
------------------------------------- */

router.get("/", getProfile);


/* -------------------------------------
   PUT /api/profile
------------------------------------- */

router.put("/", putProfile);

/* -------------------------------------
   PATCH /api/profile
------------------------------------- */
router.patch("/", patchProfile);


export default router;
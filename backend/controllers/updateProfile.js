import express from "express";

import { requireAuth } from "../../middleware/auth.js";

import {
    getProfile,
    putProfile,
    patchProfile,
} from "../../controllers/updateProfile.js";


const router = express.Router();


/* ===============================
   PROFILE
=============================== */

router.get(
    "/",
    requireAuth,
    getProfile
);


router.put(
    "/",
    requireAuth,
    putProfile
);


router.patch(
    "/",
    requireAuth,
    patchProfile
);


export default router;
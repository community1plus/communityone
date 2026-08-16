import express from "express";

import {
    getProfile,
    putProfile,
    patchProfile,
} from "../../controllers/profileController.js";

const router = express.Router();


/* ===============================
   GET /api/profile
=============================== */

router.get(
    "/",
    getProfile
);


/* ===============================
   PUT /api/profile
=============================== */

router.put(
    "/",
    putProfile
);


/* ===============================
   PATCH /api/profile
=============================== */

router.patch(
    "/",
    patchProfile
);


export default router;
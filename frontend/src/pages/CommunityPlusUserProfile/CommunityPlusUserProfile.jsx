import {
    getProfile,
    putProfile,
    patchProfile,
} from "../../../../backend/controllers/profileController.js";

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
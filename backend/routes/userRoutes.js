import express from "express";
import { getMe } from "../controllers/userController.js";
import { mockAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", mockAuth, getMe);

export default router;
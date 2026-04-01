import express from "express";
import { getMe } from "../controllers/userController.js";
import { mockAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", (req, res, next) => {
  req.user = {
    userId: "396e64d8-e0c1-70c0-98a2-6758634fccc3", // 👈 your real user
    email: "test@example.com"
  };
  next();
}, getMe);

export default router;
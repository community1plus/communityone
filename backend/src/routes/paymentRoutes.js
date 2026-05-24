import express from "express";
import { stripe } from "../lib/stripe.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create-setup-intent",
  async (req, res) => {
    try {
      const setupIntent =
        await stripe.setupIntents.create({
          payment_method_types: ["card"],
        });

      res.json({
        clientSecret: setupIntent.client_secret,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to create setup intent",
      });
    }
  }
);

export default router;
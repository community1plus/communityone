import express from "express";

const router = express.Router();

router.post(
  "/source-check",
  async (req, res) => {
    try {
      const {
        name,
        address,
        lat,
        lng,
      } = req.body;

      console.log("SOURCE CHECK:", {
        name,
        address,
        lat,
        lng,
      });

      return res.status(200).json({
        matches: [],
      });
    } catch (err) {
      console.error(
        "Business source check failed:",
        err
      );

      return res.status(500).json({
        message:
          "Business source check failed",
      });
    }
  }
);

export default router;
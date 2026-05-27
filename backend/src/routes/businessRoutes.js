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
  matches: [
    {
      id: "db:test-kfc",
      source: "COMMUNITY_ONE",
      name: "KFC Melbourne",
      phone: "03 0000 0000",
      email: "",
      website: "https://www.kfc.com.au",
      location: {
        fullAddress: "Melbourne VIC 3000",
        lat: -37.8136,
        lng: 144.9631,
        source: "COMMUNITY_ONE",
      },
      confidence: 0.85,
    },
  ],
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
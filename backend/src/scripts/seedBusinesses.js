import dotenv from "dotenv";
import mongoose from "mongoose";
import Business from "../scripts/Business.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    await Business.deleteMany({
      name: "KFC Glen Waverley",
    });

    const business = await Business.create({
      name: "KFC Glen Waverley",
      description:
        "Restaurant chain known for its buckets of fried chicken, plus combo meals and sides.",
      category: "restaurant",
      website: "https://www.kfc.com.au",
      phone: "03 9560 3372",

      location: {
        fullAddress:
          "611-613 Ferntree Gully Rd, Glen Waverley VIC 3150",
        lat: -37.9049,
        lng: 145.1649,
        suburb: "Glen Waverley",
        postcode: "3150",
        state: "VIC",
        country: "Australia",
      },

      sources: [
        {
          source: "USER",
          externalId: "",
          confidence: 0.9,
          lastCheckedAt: new Date(),
        },
      ],

      canonicalSource: "USER",

      verification: {
        emailVerified: false,
        phoneVerified: false,
        domainVerified: false,
        ownerVerified: false,
      },

      rating: 0,
      reviewCount: 0,
      isActive: true,
    });

    console.log("✅ Seeded business:", business.name);
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

run();
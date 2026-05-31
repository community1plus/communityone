import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema(
  {
    /* =========================================
       IDENTITY
    ========================================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    abn: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    /* =========================================
       CONTACT
    ========================================= */

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    /* =========================================
       LOCATION
    ========================================= */

    location: {
      fullAddress: {
        type: String,
        default: "",
      },

      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },

      postcode: {
        type: String,
        default: "",
      },

      suburb: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "Australia",
      },
    },

    /* =========================================
       SOURCE / CANONICAL
    ========================================= */

    sources: [
      {
        source: {
          type: String,
          enum: [
            "COMMUNITY_ONE",
            "GOOGLE",
            "OSM",
            "USER",
          ],
        },

        externalId: {
          type: String,
          default: "",
        },

        confidence: {
          type: Number,
          default: 0,
        },

        lastCheckedAt: Date,
      },
    ],

    canonicalSource: {
      type: String,
      default: "COMMUNITY_ONE",
    },

    /* =========================================
       VERIFICATION
    ========================================= */

    verification: {
      emailVerified: {
        type: Boolean,
        default: false,
      },

      phoneVerified: {
        type: Boolean,
        default: false,
      },

      domainVerified: {
        type: Boolean,
        default: false,
      },

      ownerVerified: {
        type: Boolean,
        default: false,
      },
    },

    /* =========================================
       OWNERSHIP
    ========================================= */

    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =========================================
       COMMUNITY SIGNALS
    ========================================= */

    rating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    /* =========================================
       STATUS
    ========================================= */

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================
   GEO INDEX
========================================= */

BusinessSchema.index({
  "location.lat": 1,
  "location.lng": 1,
});

const Business =
  mongoose.models.Business ||
  mongoose.model(
    "Business",
    BusinessSchema
  );

export default Business;
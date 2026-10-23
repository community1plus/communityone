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
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
      index: true,
    },

    abn: {
      type: String,
      default: "",
      index: true,
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
        index: true,
      },

      suburb: {
        type: String,
        default: "",
        index: true,
      },

      state: {
        type: String,
        default: "",
        index: true,
      },

      country: {
        type: String,
        default: "Australia",
      },
    },

    /* =========================================
       GEOJSON POINT
       Mongo expects [lng, lat]
    ========================================= */

    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
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
          required: true,
        },

        externalId: {
          type: String,
          default: "",
        },

        confidence: {
          type: Number,
          default: 0,
        },

        lastCheckedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    canonicalSource: {
      type: String,
      enum: [
        "COMMUNITY_ONE",
        "GOOGLE",
        "OSM",
        "USER",
      ],
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
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================
   AUTO-GENERATE GEO POINT
========================================= */

BusinessSchema.pre("validate", function () {
  if (
    this.location?.lat != null &&
    this.location?.lng != null
  ) {
    this.geo = {
      type: "Point",
      coordinates: [
        Number(this.location.lng),
        Number(this.location.lat),
      ],
    };
  }
});

/* =========================================
   INDEXES
========================================= */

BusinessSchema.index({
  geo: "2dsphere",
});

BusinessSchema.index({
  name: "text",
  category: "text",
  description: "text",
  "location.fullAddress": "text",
});

BusinessSchema.index({
  canonicalSource: 1,
  isActive: 1,
});

const Business =
  mongoose.models.Business ||
  mongoose.model(
    "Business",
    BusinessSchema
  );

export default Business;
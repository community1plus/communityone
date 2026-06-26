import "./config/env.js";

import express from "express";
import cors from "cors";
import pkg from "pg";
import session from "express-session";
import { pool } from "./db/pool.js";
import { connectDB } from "../src/db/db.js";
import facebookRoutes from "./routes/facebook/facebookRoutes.js";

await connectDB();

/* =========================
   ROUTES
========================= */

import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

import youtubeRoutes from "./routes/youtubeRoutes.js";
import xRoutes from "./routes/xRoutes.js";
import instagramRoutes from "./routes/instagram.js";

import uploadUrlRoute from "./routes/posts/uploadUrl.js";
import postsRoute from "./routes/posts/posts.js";

import facebookRoutes from "./routes/facebookRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";

import authMiddleware from "../middleware/authMiddleware.js";

import meRoutes from "./routes/meRoutes.js";

import paymentRoutes from "./routes/paymentRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";

import moderationRoutes from "./routes/moderation/moderation.js";
import businessEmailVerificationRoutes from "./routes/businessEmailVerificationRoutes.js";



// import identityRoutes from "./routes/identityRoutes.js";

/* =========================
   APP
========================= */

const app = express();

app.use(
  session({

    secret:
      process.env.SESSION_SECRET ||
      "communityone-dev-secret",

    resave: false,

    saveUninitialized: false,

    proxy: true,

    cookie: {

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",

      httpOnly: true,
    },
  })
);

app.set("trust proxy", 1);


const { Pool } = pkg;

/* =========================
   GLOBAL ERROR HANDLERS
========================= */

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED REJECTION:", err);
});

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
  "http://localhost:5173/",
  "https://main.d1ss8rtrtimogr.amplifyapp.com/",
  "https://develop.d1ss8rtrtimogr.amplifyapp.com/",
  "https://main.d1ss8rtrtimogr.amplifyapp.com",
  "https://develop.d1ss8rtrtimogr.amplifyapp.com",
  "https://www.comm-unity.one/",
  "https://comm-unity.one/"
    ],

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-version",
    ],
  })
);

/* =========================
   SESSION
========================= */



/* =========================
   BODY PARSING
========================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================
   REQUEST LOGGER
========================= */

app.use((req, res, next) => {
  console.log(
    "📡 REQUEST:",
    req.method,
    req.originalUrl
  );

  next();
});

/* =========================
   ENV DEBUG
========================= */

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {

  console.error(
    "❌ DATABASE_URL is MISSING"
  );

} else {

  const safeUrl = dbUrl.replace(
    /\/\/.*:.*@/,
    "//****:****@"
  );

  console.log(
    "🔐 DATABASE_URL:",
    safeUrl
  );
}

/* =========================
   DATABASE
========================= */



(async () => {

  try {

    await pool.query("SELECT 1");

    console.log(
      "✅ DB connected successfully"
    );

  } catch (err) {

    console.error(
      "❌ DB connection failed:",
      err
    );
  }

})();


/* =========================
   HEALTH
========================= */

app.get(
  "/api/health",
  async (req, res) => {

    try {

      await pool.query("SELECT 1");

      res.json({
        status: "OK",
        db: "connected",
      });

    } catch {

      res.json({
        status: "OK",
        db: "failed",
      });
    }
  }
);

app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/route-check",
  (req, res) => {

    res.json({
      version:
        "route-check-2026-05-18",

      profileMount:
        "/api/profile",
    });
  }
);

/* =========================
   HYBRID SEARCH
========================= */

app.get(
  "/api/search/hybrid",
  async (req, res) => {

    const q = req.query.q;

    res.json({
      summary:
        "There is increased activity nearby.",

      suggestions: [
        "events nearby",
        "incidents nearby",
        "community alerts",
      ],

      results: [
        {
          id: 1,
          type: "incident",
          title:
            `Road closure near ${q}`,
        },

        {
          id: 2,
          type: "event",
          title:
            "Community BBQ tonight",
        },
      ],
    });
  }
);

/* =========================
   ROUTES
========================= */

app.use("/api/payments", paymentRoutes);
app.use("/api/facebook", facebookRoutes);

app.use("/api/business-email-verification",  businessEmailVerificationRoutes);

app.use("/api/moderation", moderationRoutes);

app.use(
  "/api/business",
  businessRoutes
);

app.use(
  "/api/posts/upload-url",
  uploadUrlRoute
);

app.use(
  "/api/me",
  authMiddleware,
  meRoutes
);

app.use(
  "/api/me/providers",
  authMiddleware,
  providerRoutes
);

app.use(
  "/api/profile",
  authMiddleware,
  profileRoutes
);
app.use(
  "/api/posts",
  postsRoute
);

app.use(
  "/api/users",
  userRoutes
);


app.use(
  "/api/facebook",
  facebookRoutes
);

app.use(
  "/api/youtube",
  youtubeRoutes
);

app.use(
  "/api/x",
  xRoutes
);

app.use(
  "/api/instagram",
  instagramRoutes
);

// app.use("/api/x", identityRoutes);

/* =========================
   ROUTE DEBUG
========================= */

console.log("✅ Routes mounted:");

console.log(
  "   → /api/posts/upload-url"
);

console.log(
  "   → /api/posts"
);

console.log(
  "   → /api/users"
);

console.log(
  "   → /api/profile"
);

console.log(
  "   → /api/youtube"
);

console.log(
  "   → /api/x"
);

console.log(
  "   → /api/instagram"
);
app.get("/", (req, res) => {
  res.status(200).send("Community One backend is running");
});

app.head("/", (req, res) => {
  res.sendStatus(200);
});
/* =========================
   404 FALLBACK
========================= */
app.get("/api/debug/routes", (req, res) => {
  res.json({
    ok: true,
    postsMounted: true,
    expected: [
      "/api/posts",
      "/api/posts/iview",
      "/api/posts/:postId/comments",
    ],
    version: "posts-iview-2026-06-16",
  });
});

app.use((req, res) => {

  console.warn(
    "404 ROUTE NOT FOUND:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});
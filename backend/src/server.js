import "./config/env.js";

import express from "express";
import cors from "cors";
import pkg from "pg";
import session from "express-session";

/* =========================
   ROUTES
========================= */

import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

import youtubeRoutes from "./routes/youtubeRoutes.js";
import xRoutes from "./routes/xRoutes.js";


import uploadUrlRoute from "./routes/posts/uploadUrl.js";
import postsRoute from "./routes/posts/posts.js";

// import identityRoutes from "./routes/identityRoutes.js";

/* =========================
   APP
========================= */

const app = express();

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      secure: true,

      sameSite: "none",

      httpOnly: true,
    },
  })
);

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
      "https://main.d1ss8rtrtimogr.amplifyapp.com",
      "http://localhost:5173",
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

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "communityone-dev-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      secure:
        process.env.NODE_ENV === "production",

      httpOnly: true,

      sameSite: "lax",
    },
  })
);

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

const pool = new Pool({
  connectionString: dbUrl,

  ssl: {
    rejectUnauthorized: false,
  },
});

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

app.use(
  "/api/posts/upload-url",
  uploadUrlRoute
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
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/youtube",
  youtubeRoutes
);

app.use(
  "/api/x",
  xRoutes
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

/* =========================
   404 FALLBACK
========================= */

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
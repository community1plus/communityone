import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

router.get("/posts", async (req, res) => {
  try {
    const result = await pool.query(
      `
      select
        id,
        user_id,
        mode,
        type,
        title,
        content,
        category,
        status,
        requires_review,
        moderation_reason,
        moderation_labels,
        created_at
      from posts
      where status = 'pending_review'
      order by created_at desc
      limit 100
      `
    );

    return res.json({
      posts: result.rows,
    });
  } catch (error) {
    console.error("Fetch moderation queue failed:", error);

    return res.status(500).json({
      error: "Could not fetch moderation queue.",
      detail: error.message,
    });
  }
});

export default router;
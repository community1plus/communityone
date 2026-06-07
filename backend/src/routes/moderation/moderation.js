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

router.post("/posts/:postId/approve", async (req, res) => {
  try {
    const { postId } = req.params;
    const moderatorId = req.user?.sub || "test-moderator";

    const result = await pool.query(
      `
      update posts
      set
        status = 'published',
        requires_review = false,
        moderated_by = $2,
        moderated_at = now()
      where id = $1
      returning *
      `,
      [postId, moderatorId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res.json({
      success: true,
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Approve post failed:", error);

    return res.status(500).json({
      error: "Could not approve post.",
      detail: error.message,
    });
  }
});

router.post("/posts/:postId/reject", async (req, res) => {
  try {
    const { postId } = req.params;
    const moderatorId = req.user?.sub || "test-moderator";
    const { reason = "Rejected by moderator" } = req.body || {};

    const result = await pool.query(
      `
      update posts
      set
        status = 'rejected',
        requires_review = false,
        moderation_reason = $2,
        moderated_by = $3,
        moderated_at = now()
      where id = $1
      returning *
      `,
      [postId, reason, moderatorId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res.json({
      success: true,
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Reject post failed:", error);

    return res.status(500).json({
      error: "Could not reject post.",
      detail: error.message,
    });
  }
});

export default router;
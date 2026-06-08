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
        p.id,
        p.user_id,
        p.mode,
        p.type,
        p.title,
        p.content,
        p.category,
        p.status,
        p.requires_review,
        p.moderation_reason,
        coalesce(p.moderation_labels, '[]'::jsonb) as moderation_labels,
        p.created_at,
        coalesce(
          json_agg(
            json_build_object(
              'id', pm.id,
              'fileName', pm.file_name,
              'fileType', pm.file_type,
              'fileSize', pm.file_size,
              'mediaType', pm.media_type,
              's3Bucket', pm.s3_bucket,
              's3Key', pm.s3_key,
              'publicUrl', pm.public_url,
              'thumbnailUrl', pm.thumbnail_url,
              'moderationStatus', pm.moderation_status,
              'moderationReason', pm.moderation_reason,
              'moderationLabels', coalesce(pm.moderation_labels, '[]'::jsonb)
            )
          ) filter (where pm.id is not null),
          '[]'
        ) as media
      from posts p
      left join post_media pm
        on pm.post_id = p.id
      where p.status = 'pending_review'
      group by p.id
      order by p.created_at desc
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
      return res.status(404).json({
        error: "Post not found.",
      });
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
      return res.status(404).json({
        error: "Post not found.",
      });
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
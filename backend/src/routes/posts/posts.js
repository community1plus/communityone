import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toTimestamp(value) {
  if (!value) return null;
  return new Date(value);
}

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const payload = req.body || {};

    const {
      mode,
      type,
      title,
      content,
      category,
      tags = [],
      scope = "Local",
      distribution = {
        scope: "Local",
        feeds: ["Local"],
      },
      socialShareTargets = [],
      media = [],
      status = "published",
      requiresReview = false,
      expiresAt = null,
    } = payload;

    if (!title || !content || !mode || !type || !category) {
      return res.status(400).json({
        error: "mode, type, title, content and category are required.",
      });
    }

    /*
      Replace this later with Cognito auth user:
      const userId = req.user.sub;
    */
    const userId = req.user?.sub || "test-user";

    await client.query("BEGIN");

    const postResult = await client.query(
      `
      insert into posts (
        user_id,
        mode,
        type,
        title,
        content,
        category,
        tags,
        scope,
        distribution,
        social_share_targets,
        status,
        requires_review,
        expires_at
      )
      values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      returning *
      `,
      [
        userId,
        mode,
        type,
        title,
        content,
        category,
        JSON.stringify(safeArray(tags)),
        scope,
        JSON.stringify(distribution),
        JSON.stringify(safeArray(socialShareTargets)),
        status,
        Boolean(requiresReview),
        toTimestamp(expiresAt),
      ]
    );

    const post = postResult.rows[0];

    const insertedMedia = [];

    for (const item of safeArray(media)) {
      const mediaResult = await client.query(
        `
        insert into post_media (
          post_id,
          user_id,
          file_name,
          file_type,
          file_size,
          media_type,
          s3_bucket,
          s3_key,
          public_url,
          upload_status
        )
        values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,'uploaded'
        )
        returning *
        `,
        [
          post.id,
          userId,
          item.name || item.fileName,
          item.type || item.fileType,
          item.size || item.fileSize,
          item.mediaType || "file",
          process.env.MEDIA_BUCKET,
          item.key,
          item.url || null,
        ]
      );

      insertedMedia.push(mediaResult.rows[0]);
    }

    const socialJobs = [];

    for (const platform of safeArray(socialShareTargets)) {
      const jobResult = await client.query(
        `
        insert into social_share_jobs (
          post_id,
          user_id,
          platform,
          status,
          payload
        )
        values (
          $1,$2,$3,'queued',$4
        )
        returning *
        `,
        [
          post.id,
          userId,
          platform,
          JSON.stringify({
            title,
            content,
            media,
            postId: post.id,
          }),
        ]
      );

      socialJobs.push(jobResult.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      post,
      media: insertedMedia,
      socialJobs,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create post failed:");
    console.error(error);
    console.error("Create post failed:", error);

    return res.status(500).json({
      error: "Could not create post.",
    });
  } finally {
    console.error("Create post failed:");
    console.error(error);
    console.error(error.message);
    client.release();
  }
});

export default router;
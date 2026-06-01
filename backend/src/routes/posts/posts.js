import express from "express";
import pkg from "pg";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../lib/s3.js";

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

 async function hydrateMediaWithSignedUrls(posts = []) {
  return Promise.all(
    posts.map(async (post) => {
      const media = Array.isArray(post.media) ? post.media : [];

      const hydratedMedia = await Promise.all(
        media.map(async (item) => {
          if (!item.s3Bucket || !item.s3Key) {
            return item;
          }

          const command = new GetObjectCommand({
            Bucket: item.s3Bucket,
            Key: item.s3Key,
          });

          const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 3600,
          });

          return {
            ...item,
            signedUrl,
          };
        })
      );

      return {
        ...post,
        media: hydratedMedia,
      };
    })
  );
}

router.get("/", async (req, res) => {
  try {
    const {
      mode,
      type,
      limit = 30,
      scope,
    } = req.query;

    const values = [];
    const where = ["p.status = 'published'"];

    if (mode) {
      values.push(mode);
      where.push(`p.mode = $${values.length}`);
    }

    if (type) {
      values.push(type);
      where.push(`p.type = $${values.length}`);
    }

    if (scope) {
      values.push(scope);
      where.push(`p.scope = $${values.length}`);
    }

    values.push(Number(limit));

    const result = await pool.query(
      `
      select
        p.*,
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
              'thumbnailUrl', pm.thumbnail_url
            )
          ) filter (where pm.id is not null),
          '[]'
        ) as media
      from posts p
      left join post_media pm
        on pm.post_id = p.id
      where ${where.join(" and ")}
      group by p.id
      order by p.created_at desc
      limit $${values.length}
      `,
      values
    );

    const posts = await hydrateMediaWithSignedUrls(result.rows);

    res.json({
    posts,
    });
  } catch (error) {
    console.error("Fetch posts failed:");
    console.error(error);

    res.status(500).json({
      error: "Could not fetch posts.",
      detail: error.message,
    });
  }
});

router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `
      select
        id,
        post_id,
        user_id,
        comment,
        status,
        created_at
      from post_comments
      where post_id = $1
        and status = 'published'
      order by created_at desc
      limit 100
      `,
      [postId]
    );

    res.json({
      comments: result.rows,
    });
  } catch (error) {
    console.error("Fetch comments failed:", error);

    res.status(500).json({
      error: "Could not fetch comments.",
    });
  }
});

router.post("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body || {};

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        error: "Comment is required.",
      });
    }

    const userId = req.user?.sub || "test-user";

    const result = await pool.query(
      `
      insert into post_comments (
        post_id,
        user_id,
        comment
      )
      values ($1, $2, $3)
      returning
        id,
        post_id,
        user_id,
        comment,
        status,
        created_at
      `,
      [postId, userId, String(comment).trim()]
    );

    res.status(201).json({
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Create comment failed:", error);

    res.status(500).json({
      error: "Could not create comment.",
    });
  }
});

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
    
    client.release();
  }
});

export default router;
import express from "express";
import pkg from "pg";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "../../lib/s3.js";
import { moderateTextContent } from "../../services/moderation/textModeration.js";
import { moderateImageFromS3 } from "../../services/moderation/imageModeration.js";
import requireAuth from "../../../middleware/requireAuth.js";

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toTimestamp(value) {
  return value ? new Date(value) : null;
}

async function hydrateMediaWithSignedUrls(posts = []) {
  return Promise.all(
    posts.map(async (post) => {
      const media = Array.isArray(post.media) ? post.media : [];

      const hydratedMedia = await Promise.all(
        media.map(async (item) => {
          if (!item.s3Bucket || !item.s3Key) return item;

          const command = new GetObjectCommand({
            Bucket: item.s3Bucket,
            Key: item.s3Key,
          });

          const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 3600,
          });

          return { ...item, signedUrl };
        })
      );

      return { ...post, media: hydratedMedia };
    })
  );
}

/* =====================================================
   GET POSTS
===================================================== */

router.get("/", async (req, res) => {
  try {
    const { mode, type, limit = 30, scope } = req.query;

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
              'thumbnailUrl', pm.thumbnail_url,
              'moderationStatus', pm.moderation_status,
              'moderationReason', pm.moderation_reason,
              'moderationLabels', pm.moderation_labels
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

    return res.json({ posts });
  } catch (error) {
    console.error("Fetch posts failed:", error);

    return res.status(500).json({
      error: "Could not fetch posts.",
      detail: error.message,
    });
  }
});

/* =====================================================
   COMMENTS
===================================================== */

router.post("/:postId/comments", requireAuth, async (req, res) => {
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

    return res.json({ comments: result.rows });
  } catch (error) {
    console.error("Fetch comments failed:", error);

    return res.status(500).json({
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

    return res.status(201).json({
      success: true,
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Create comment failed:", error);

    return res.status(500).json({
      error: "Could not create comment.",
    });
  }
});

/* =====================================================
   CREATE POST
===================================================== */

router.post("/", requireAuth, async (req, res) => {
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
      expiresAt = null,
    } = payload;

    if (!title || !content || !mode || !type || !category) {
      return res.status(400).json({
        error: "mode, type, title, content and category are required.",
      });
    }

    const textModeration = moderateTextContent({
      title,
      content,
    });

    if (textModeration.status === "rejected") {
      return res.status(400).json({
        success: false,
        error: "This post violates Community One content standards.",
        moderation: textModeration,
      });
    }

    const mediaItems = safeArray(media);
    const userId = req.user?.sub || "test-user";

    const initialStatus =
      textModeration.status === "review"
        ? "pending_review"
        : "published";

    const initialRequiresReview =
      textModeration.status === "review";

    const textModerationReason =
      textModeration.reason || null;

    const textModerationLabels =
      textModeration.labels || [];

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
        expires_at,
        moderation_reason,
        moderation_labels
      )
      values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
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
        initialStatus,
        initialRequiresReview,
        toTimestamp(expiresAt),
        textModerationReason,
        JSON.stringify(textModerationLabels),
      ]
    );

    const post = postResult.rows[0];

    const insertedMedia = [];

    let hasImageReview = false;
    let hasImageRejected = false;
    let hasImageModerationError = false;

    for (const item of mediaItems) {
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
          upload_status,
          moderation_status,
          moderation_reason,
          moderation_labels
        )
        values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,'uploaded','pending',null,'[]'::jsonb
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

      const inserted = mediaResult.rows[0];

      const isImage = String(
        item.type || item.fileType || ""
      ).startsWith("image/");

      let mediaModeration = {
        status: "not_required",
        requiresReview: false,
        reason: null,
        labels: [],
      };

      if (isImage && item.key) {
        try {
          mediaModeration = await moderateImageFromS3({
            bucket: process.env.MEDIA_BUCKET,
            key: item.key,
          });

          if (mediaModeration.status === "review") {
            hasImageReview = true;
          }

          if (mediaModeration.status === "rejected") {
            hasImageRejected = true;
          }

          await client.query(
            `
            update post_media
            set
              moderation_status = $2,
              moderation_reason = $3,
              moderation_labels = $4
            where id = $1
            `,
            [
              inserted.id,
              mediaModeration.status,
              mediaModeration.reason || null,
              JSON.stringify(mediaModeration.labels || []),
            ]
          );

          console.log("IMAGE MODERATION:", {
            mediaId: inserted.id,
            fileName: inserted.file_name,
            status: mediaModeration.status,
            reason: mediaModeration.reason,
          });
        } catch (error) {
          hasImageReview = true;
          hasImageModerationError = true;

          mediaModeration = {
            status: "review",
            requiresReview: true,
            reason:
              "Image moderation failed. Manual review required.",
            labels: [
              {
                name: "image_moderation_error",
                confidence: 0,
              },
            ],
          };

          await client.query(
            `
            update post_media
            set
              moderation_status = 'review',
              moderation_reason = $2,
              moderation_labels = $3
            where id = $1
            `,
            [
              inserted.id,
              mediaModeration.reason,
              JSON.stringify(mediaModeration.labels),
            ]
          );

          console.error("Image moderation failed:", error);
        }
      } else {
        await client.query(
          `
          update post_media
          set
            moderation_status = 'not_required',
            moderation_reason = null,
            moderation_labels = '[]'::jsonb
          where id = $1
          `,
          [inserted.id]
        );
      }

      insertedMedia.push({
        ...inserted,
        moderation: mediaModeration,
      });
    }

    let finalStatus = "published";
    let finalRequiresReview = false;

    const finalReasons = [];
    const finalLabels = [];

    if (textModeration.status === "review") {
      finalStatus = "pending_review";
      finalRequiresReview = true;

      if (textModeration.reason) {
        finalReasons.push(textModeration.reason);
      }

      finalLabels.push(...textModerationLabels);
    }

    if (hasImageRejected) {
      finalStatus = "rejected";
      finalRequiresReview = false;

      finalReasons.push("One or more images were rejected by moderation.");
      finalLabels.push("image_rejected");
    } else if (hasImageReview) {
      finalStatus = "pending_review";
      finalRequiresReview = true;

      finalReasons.push("One or more images require moderation review.");
      finalLabels.push("image_review");
    }

    if (hasImageModerationError) {
      finalLabels.push("image_moderation_error");
    }

    const finalModerationReason =
      finalReasons.length > 0
        ? finalReasons.join(" ")
        : null;

    const finalModerationLabels =
      finalLabels.length > 0
        ? finalLabels
        : textModerationLabels;

    const finalPostResult = await client.query(
      `
      update posts
      set
        status = $2,
        requires_review = $3,
        moderation_reason = $4,
        moderation_labels = $5
      where id = $1
      returning *
      `,
      [
        post.id,
        finalStatus,
        finalRequiresReview,
        finalModerationReason,
        JSON.stringify(finalModerationLabels),
      ]
    );

    const finalPost = finalPostResult.rows[0];

    const socialJobs = [];

    if (finalStatus !== "rejected") {
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
            finalPost.id,
            userId,
            platform,
            JSON.stringify({
              title,
              content,
              media: mediaItems,
              postId: finalPost.id,
            }),
          ]
        );

        socialJobs.push(jobResult.rows[0]);
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      post: finalPost,
      media: insertedMedia,
      socialJobs,
      moderation: {
        status: finalStatus,
        requiresReview: finalRequiresReview,
        reason: finalModerationReason,
        labels: finalModerationLabels,
        text: textModeration,
        image: {
          hasReview: hasImageReview,
          hasRejected: hasImageRejected,
          hasError: hasImageModerationError,
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create post failed:", error);

    return res.status(500).json({
      error: "Could not create post.",
      detail: error.message,
    });
  } finally {
    client.release();
  }
});

export default router;
import express from "express";

import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "../../lib/s3.js";

import { buildS3Key } from "../../utils/buildS3Key.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      fileName,
      fileType,
      fileSize,
      mediaType,
      mode,
    } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        error: "fileName and fileType are required",
      });
    }

    /*
      Replace with real authenticated user later
    */

    const userId = req.user?.sub || "test-user";

    /*
      Replace later with real geo profile lookup
    */

    const countryCode = process.env.COUNTRY_CODE || "au";

    const awsRegion =
      process.env.AWS_REGION || "ap-southeast-2";

    const state = "vic";

    const locality = "melbourne";

    const { mediaId, key } = buildS3Key({
      countryCode,
      awsRegion,
      state,
      locality,
      userId,
      mode,
      fileName,
    });

    const command = new PutObjectCommand({
      Bucket: process.env.MEDIA_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(
      s3,
      command,
      {
        expiresIn: 300,
      }
    );

    return res.json({
      mediaId,

      uploadUrl,

      key,

      bucket: process.env.MEDIA_BUCKET,

      publicUrl: null,

      metadata: {
        fileName,
        fileType,
        fileSize,
        mediaType,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not generate upload URL",
    });
  }
});

export default router;
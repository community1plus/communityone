import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || "ap-southeast-2",
});

export async function moderateImageFromS3({
  bucket,
  key,
}) {
  const command = new DetectModerationLabelsCommand({
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    MinConfidence: 70,
  });

  const result = await rekognition.send(command);

  const labels = result.ModerationLabels || [];

  const highRisk = labels.filter(
    (label) => Number(label.Confidence) >= 95
  );

  if (highRisk.length) {
    return {
      status: "rejected",
      requiresReview: false,
      category: "image_high_risk",
      severity: "high",
      score: 95,
      reason: "High-risk image content detected.",
      labels,
    };
  }

  if (labels.length) {
    return {
      status: "review",
      requiresReview: true,
      category: "image_review",
      severity: "medium",
      score: 70,
      reason: "Image requires moderation review.",
      labels,
    };
  }

  return {
    status: "approved",
    requiresReview: false,
    category: "image_safe",
    severity: "low",
    score: 0,
    reason: null,
    labels: [],
  };
}

import { Router } from "express";
import { linkAuthenticationIdentity } from "../services/authenticationIdentityLinkService.js";


const router = Router();

router.post("/", async (req, res) => {
  const primaryAuthContext = {
    userId: req.user?.userId || req.user?.id,
    cognitoSub: req.user?.cognitoSub,
  };

  const { secondaryIdToken } = req.body || {};

  if (!primaryAuthContext.userId) {
    return res.status(401).json({
      error: "Primary authenticated user is missing.",
    });
  }

  if (!secondaryIdToken) {
    return res.status(400).json({
      error: "Secondary Cognito ID token is required.",
    });
  }

  try {
    const result = await linkAuthenticationIdentity({
      primaryAuthContext,
      secondaryIdToken,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Authentication identity linking failed:", {
      code: error.code || "IDENTITY_LINK_FAILED",
      message: error.message,
    });

    if (error.code === "IDENTITY_LINK_CONFLICT") {
      return res.status(409).json({
        error: "This authentication identity is already linked to another account.",
      });
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        error: "Community One user not found.",
      });
    }

    if (error.code === "INVALID_AUTH_METHOD") {
      return res.status(400).json({
        error: "Unsupported authentication method.",
      });
    }

    return res.status(401).json({
      error: "The secondary authentication identity could not be verified or linked.",
    });
  }
});

export default router;

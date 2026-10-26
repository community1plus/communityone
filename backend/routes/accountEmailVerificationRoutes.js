
import express from "express";
import crypto from "node:crypto";

import { pool } from "../src/db/pool.js";
import { sendEmail } from "../services/emailService.js";
import {
  verifyCognitoIdTokenFromRequest,
} from "../middleware/authMiddleware.js";
import {
  resolveIdentity,
} from "../services/identityService.js";

const router = express.Router();

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getAuthMethod(claims) {
  let identities = claims.identities;

  if (typeof identities === "string") {
    try {
      identities = JSON.parse(identities);
    } catch {
      identities = [];
    }
  }

  if (!Array.isArray(identities)) {
    identities = [];
  }

  const identity =
    identities.find((item) => item?.primary === true) ||
    identities[0];

  const provider = String(
    identity?.providerName || identity?.providerType || ""
  ).toLowerCase();

  if (provider.includes("google")) return "google";
  if (provider.includes("facebook")) return "facebook";

  return "email";
}

function hashCode({ sub, email, code }) {
  const secret = process.env.EMAIL_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error("EMAIL_VERIFICATION_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${sub}:${email}:${code}`)
    .digest("hex");
}

function codeMatches(expectedHash, suppliedHash) {
  const expected = Buffer.from(expectedHash, "hex");
  const supplied = Buffer.from(suppliedHash, "hex");

  return (
    expected.length === supplied.length &&
    crypto.timingSafeEqual(expected, supplied)
  );
}

function handleAuthError(res, error) {
  if (
    error.code === "AUTH_TOKEN_MISSING" ||
    error.code === "INVALID_TOKEN_TYPE" ||
    error.code === "TOKEN_CLAIMS_MISSING" ||
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.name === "NotBeforeError"
  ) {
    return res.status(401).json({
      error: "Authentication failed",
    });
  }

  return null;
}

async function getClaims(req, res) {
  try {
    return await verifyCognitoIdTokenFromRequest(req);
  } catch (error) {
    handleAuthError(res, error);
    return null;
  }
}

/*
 * POST /api/account-email-verification/start
 *
 * The email and subject come from the verified Cognito ID token.
 * The client cannot choose an arbitrary recipient.
 */
router.post("/start", async (req, res) => {
  try {
    const claims = await getClaims(req, res);
    if (!claims) return;

    const sub = claims.sub;
    const email = normaliseEmail(claims.email);

    const existing = await pool.query(
      `SELECT last_sent_at
       FROM account_email_verification_challenges
       WHERE cognito_sub = $1
         AND email_normalized = $2`,
      [sub, email]
    );

    if (existing.rows.length) {
      const lastSent = new Date(existing.rows[0].last_sent_at);
      const elapsedSeconds =
        (Date.now() - lastSent.getTime()) / 1000;

      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          code: "VERIFICATION_RATE_LIMITED",
          error: "Please wait before requesting another code.",
        });
      }
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashCode({ sub, email, code });

    await pool.query(
      `INSERT INTO account_email_verification_challenges
         (cognito_sub, email_normalized, code_hash,
          expires_at, attempts, verified_at, created_at, last_sent_at)
       VALUES
         ($1, $2, $3,
          NOW() + INTERVAL '${CODE_TTL_MINUTES} minutes',
          0, NULL, NOW(), NOW())
       ON CONFLICT (cognito_sub, email_normalized)
       DO UPDATE SET
         code_hash = EXCLUDED.code_hash,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         verified_at = NULL,
         created_at = NOW(),
         last_sent_at = NOW()`,
      [sub, email, codeHash]
    );

    try {
      await sendEmail({
        to: email,
        subject: "Verify your Community One email",
        text:
          `Your Community One verification code is ${code}.\n\n` +
          `It expires in ${CODE_TTL_MINUTES} minutes. ` +
          "If you did not request this code, you can ignore this email.",
        html:
          `<p>Your Community One verification code is:</p>` +
          `<p style="font-size:24px;font-weight:bold;letter-spacing:4px">` +
          `${code}</p>` +
          `<p>This code expires in ${CODE_TTL_MINUTES} minutes.</p>` +
          `<p>If you did not request this code, ignore this email.</p>`,
      });
    } catch (emailError) {
      // Invalidate the unsent code.
      await pool.query(
        `UPDATE account_email_verification_challenges
         SET expires_at = NOW()
         WHERE cognito_sub = $1
           AND email_normalized = $2`,
        [sub, email]
      );

      throw emailError;
    }

    return res.json({
      success: true,
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error("Account email verification start failed", {
      message: error.message,
    });

    return res.status(500).json({
      error: "Unable to send the verification code.",
    });
  }
});

/*
 * POST /api/account-email-verification/confirm
 *
 * Body: { "code": "123456" }
 */
router.post("/confirm", async (req, res) => {
  const client = await pool.connect();

  try {
    const claims = await getClaims(req, res);
    if (!claims) return;

    const sub = claims.sub;
    const email = normaliseEmail(claims.email);
    const code = String(req.body?.code || "").trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        code: "INVALID_CODE",
        error: "Enter the six-digit verification code.",
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `SELECT *
       FROM account_email_verification_challenges
       WHERE cognito_sub = $1
         AND email_normalized = $2
       FOR UPDATE`,
      [sub, email]
    );

    const challenge = result.rows[0];

    if (!challenge || challenge.verified_at) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "No active verification request. Request a new code.",
      });
    }

    if (new Date(challenge.expires_at) <= new Date()) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        code: "CODE_EXPIRED",
        error: "The code has expired. Request a new one.",
      });
    }

    if (challenge.attempts >= MAX_ATTEMPTS) {
      await client.query("ROLLBACK");

      return res.status(429).json({
        code: "TOO_MANY_ATTEMPTS",
        error: "Too many attempts. Request a new code.",
      });
    }

    const suppliedHash = hashCode({ sub, email, code });

    if (!codeMatches(challenge.code_hash, suppliedHash)) {
      await client.query(
        `UPDATE account_email_verification_challenges
         SET attempts = attempts + 1
         WHERE id = $1`,
        [challenge.id]
      );

      await client.query("COMMIT");

      return res.status(400).json({
        code: "INVALID_CODE",
        error: "The verification code is incorrect.",
      });
    }

    // Reserve this challenge so it cannot be replayed.
    await client.query(
      `UPDATE account_email_verification_challenges
       SET verified_at = NOW()
       WHERE id = $1`,
      [challenge.id]
    );

    await client.query("COMMIT");

    // Resolve or link only after the code has been validated.
    // Never trust an email_verified claim from Cognito here.
    const identity = await resolveIdentity({
      cognitoSub: sub,
      email,
      cognitoUsername:
        claims["cognito:username"] || claims.username || "",
      emailVerified: true,
      authMethod: getAuthMethod(claims),
    });

    return res.json({
      success: true,
      verified: true,
      user: {
        userId: identity.userId,
        personId: identity.personId ?? null,
        onboardingStatus: identity.onboardingStatus ?? null,
        participationScope: identity.participationScope ?? null,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // The transaction may already have been committed.
    }

    console.error("Account email verification confirmation failed", {
      code: error.code,
      message: error.message,
    });

    if (error.code === "IDENTITY_LINK_CONFLICT") {
      return res.status(409).json({
        code: error.code,
        error: "This sign-in identity is already linked to another account.",
      });
    }

    if (error.code === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({
        code: error.code,
        error: "Email verification is required.",
      });
    }

    return res.status(500).json({
      error: "Unable to complete email verification.",
    });
  } finally {
    client.release();
  }
});

export default router;

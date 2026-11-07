
import express from "express";
import crypto from "node:crypto";

import { pool } from "../src/db/pool.js";
import { findUserByCognitoIdentity } from "../repositories/identityRepository.js";
import { markPhoneVerified } from "../repositories/profileRepository.js";
import { sendPhoneVerificationSms } from "../services/smsLambdaService.js";
import {
  verifyCognitoIdTokenFromRequest,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const CODE_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function hashCode({ sub, userId, phone, code }) {
  const secret = process.env.PHONE_VERIFICATION_SECRET;

  if (!secret) {
    throw new Error(
      "PHONE_VERIFICATION_SECRET is not configured"
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${sub}:${userId}:${phone}:${code}`)
    .digest("hex");
}

function codeMatches(expectedHash, suppliedHash) {
  if (
    typeof expectedHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(expectedHash) ||
    !/^[a-f0-9]{64}$/i.test(suppliedHash)
  ) {
    return false;
  }

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
    if (handleAuthError(res, error)) {
      return null;
    }

    console.error(
      "Phone verification authentication failed",
      { message: error.message }
    );

    res.status(500).json({
      error: "Unable to authenticate request.",
    });

    return null;
  }
}

async function resolveUser(sub) {
  const user = await findUserByCognitoIdentity(sub);

  if (!user?.id) {
    const error = new Error(
      "Authenticated Community One user not found"
    );
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  return user;
}

/*
 * POST /api/account-phone-verification/start
 *
 * Uses the authenticated user's saved profile phone number.
 * The client cannot nominate an arbitrary recipient.
 */
router.post("/start", async (req, res) => {
  try {
    const claims = await getClaims(req, res);
    if (!claims) return;

    const sub = claims.sub;

    if (!sub) {
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    const user = await resolveUser(sub);

    const profileResult = await pool.query(
      `
        SELECT
          phone,
          phone_e164,
          phone_verified
        FROM user_profiles
        WHERE user_id = $1
        LIMIT 1
      `,
      [user.id]
    );

    const profile = profileResult.rows[0];

    if (!profile) {
      return res.status(404).json({
        code: "PROFILE_NOT_FOUND",
        error: "No profile was found for this account.",
      });
    }

    const phone =
      String(
        profile.phone_e164 || profile.phone || ""
      ).trim();

    if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return res.status(400).json({
        code: "INVALID_PROFILE_PHONE",
        error: "Add a valid phone number in international format before verifying it.",
      });
    }

    if (profile.phone_verified === true) {
      return res.json({
        success: true,
        verified: true,
        message: "This phone number is already verified.",
      });
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    const codeHash = hashCode({
      sub,
      userId: user.id,
      phone,
      code,
    });

    // Serialise concurrent resend requests for this
    // Cognito subject and phone number.
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          SELECT pg_advisory_xact_lock(
            hashtextextended($1::text, 0)
          )
        `,
        [`${sub}:${phone}`]
      );

      const existing = await client.query(
        `
          SELECT
            EXTRACT(
              EPOCH FROM (NOW() - last_sent_at)
            ) AS elapsed_seconds
          FROM account_phone_verification_challenges
          WHERE cognito_sub = $1
            AND phone_e164 = $2
          FOR UPDATE
        `,
        [sub, phone]
      );

      if (existing.rows.length) {
        const elapsedSeconds = Number(
          existing.rows[0].elapsed_seconds
        );

        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
          await client.query("ROLLBACK");

          return res.status(429).json({
            code: "VERIFICATION_RATE_LIMITED",
            error: "Please wait before requesting another code.",
          });
        }
      }

      await client.query(
        `
          INSERT INTO account_phone_verification_challenges
            (
              cognito_sub,
              user_id,
              phone_e164,
              code_hash,
              expires_at,
              attempts,
              verified_at,
              created_at,
              last_sent_at
            )
          VALUES
            (
              $1,
              $2,
              $3,
              $4,
              NOW() + INTERVAL '${CODE_TTL_MINUTES} minutes',
              0,
              NULL,
              NOW(),
              NOW()
            )
          ON CONFLICT (cognito_sub, phone_e164)
          DO UPDATE SET
            user_id = EXCLUDED.user_id,
            code_hash = EXCLUDED.code_hash,
            expires_at = EXCLUDED.expires_at,
            attempts = 0,
            verified_at = NULL,
            created_at = NOW(),
            last_sent_at = NOW()
        `,
        [sub, user.id, phone, codeHash]
      );

      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Transaction may already have ended.
      }

      throw error;
    } finally {
      client.release();
    }

    try {
      await sendPhoneVerificationSms({
        phone,
        code,
      });
    } catch (smsError) {
      // Invalidate the code if SMS submission fails.
      await pool.query(
  `
    UPDATE account_phone_verification_challenges
    SET expires_at = NOW()
    WHERE cognito_sub = $1
      AND phone_e164 = $2
      AND code_hash = $3
  `,
  [sub, phone, codeHash]
);
      throw smsError;
    }

    return res.json({
      success: true,
      message: "Phone verification code sent.",
    });
  } catch (error) {
    console.error("Account phone verification start failed", {
      code: error.code,
      message: error.message,
    });

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        error: "Community One account not found.",
      });
    }

    return res.status(500).json({
      error: "Unable to send the phone verification code.",
    });
  }
});

/*
 * POST /api/account-phone-verification/confirm
 *
 * Body: { "code": "123456" }
 */
router.post("/confirm", async (req, res) => {
  const claims = await getClaims(req, res);
  if (!claims) return;

  const sub = claims.sub;

  if (!sub) {
    return res.status(401).json({
      error: "Authentication failed",
    });
  }

  const code = String(req.body?.code || "").trim();

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({
      code: "INVALID_CODE",
      error: "Enter the six-digit verification code.",
    });
  }

  let user;

  try {
    user = await resolveUser(sub);
  } catch (error) {
    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).json({
        error: "Community One account not found.",
      });
    }

    console.error("Phone verification identity lookup failed", {
      message: error.message,
    });

    return res.status(500).json({
      error: "Unable to complete phone verification.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const profileResult = await client.query(
      `
        SELECT
          phone,
          phone_e164,
          phone_verified
        FROM user_profiles
        WHERE user_id = $1
        FOR UPDATE
      `,
      [user.id]
    );

    const profile = profileResult.rows[0];

    if (!profile) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        code: "PROFILE_NOT_FOUND",
        error: "No profile was found for this account.",
      });
    }

    const phone = String(
      profile.phone_e164 || profile.phone || ""
    ).trim();

    if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        code: "INVALID_PROFILE_PHONE",
        error: "The saved phone number is invalid.",
      });
    }

    const result = await client.query(
      `
        SELECT *
        FROM account_phone_verification_challenges
        WHERE cognito_sub = $1
          AND user_id = $2
          AND phone_e164 = $3
        FOR UPDATE
      `,
      [sub, user.id, phone]
    );

    const challenge = result.rows[0];

    if (!challenge || challenge.verified_at) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        code: "NO_ACTIVE_CHALLENGE",
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

    const suppliedHash = hashCode({
      sub,
      userId: user.id,
      phone,
      code,
    });

    if (!codeMatches(challenge.code_hash, suppliedHash)) {
      await client.query(
        `
          UPDATE account_phone_verification_challenges
          SET attempts = attempts + 1
          WHERE id = $1
        `,
        [challenge.id]
      );

      await client.query("COMMIT");

      return res.status(400).json({
        code: "INVALID_CODE",
        error: "The verification code is incorrect.",
      });
    }

    // Consume the challenge and verify the profile
    // atomically within the same database transaction.
    await client.query(
      `
        UPDATE account_phone_verification_challenges
        SET verified_at = NOW()
        WHERE id = $1
      `,
      [challenge.id]
    );

    const updatedProfile = await markPhoneVerified({
      userId: user.id,
      phoneE164: phone,
      db: client,
    });

    if (!updatedProfile) {
      throw new Error(
        "Phone verification could not update the saved profile"
      );
    }

    await client.query("COMMIT");

    return res.json({
      success: true,
      verified: true,
      phoneVerified: true,
      message: "Phone number verified successfully.",
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Transaction may already have ended.
    }

    console.error(
      "Account phone verification confirmation failed",
      {
        code: error.code,
        message: error.message,
      }
    );

    return res.status(500).json({
      error: "Unable to complete phone verification.",
    });
  } finally {
    client.release();
  }
});

export default router;

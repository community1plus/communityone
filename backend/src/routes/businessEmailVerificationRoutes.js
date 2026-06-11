import express from "express";
import crypto from "crypto";
import { pool } from "../db/pool.js";

const router = express.Router();

/* =========================================================
   SEND VERIFICATION CODE
========================================================= */

router.post("/start", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const code = crypto
      .randomInt(100000, 999999)
      .toString();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pool.query(
      `
      INSERT INTO email_verifications
      (
        email,
        code,
        expires_at
      )
      VALUES ($1,$2,$3)
      ON CONFLICT (email)
      DO UPDATE
      SET
        code = EXCLUDED.code,
        expires_at = EXCLUDED.expires_at,
        verified = false
      `,
      [email, code, expiresAt]
    );

    console.log(
      "EMAIL VERIFICATION CODE:",
      email,
      code
    );

    /*
      TODO:
      Replace with SES / SendGrid / Resend
    */

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to send verification code",
    });
  }
});

/* =========================================================
   VERIFY CODE
========================================================= */

router.post("/confirm", async (req, res) => {
  try {
    const {
      email,
      code,
    } = req.body;

    const result =
      await pool.query(
        `
        SELECT *
        FROM email_verifications
        WHERE email = $1
        LIMIT 1
        `,
        [email]
      );

    const record =
      result.rows[0];

    if (!record) {
      return res.status(400).json({
        error: "Verification not found",
      });
    }

    if (
      new Date(record.expires_at) <
      new Date()
    ) {
      return res.status(400).json({
        error: "Verification expired",
      });
    }

    if (record.code !== code) {
      return res.status(400).json({
        error: "Invalid code",
      });
    }

    await pool.query(
      `
      UPDATE email_verifications
      SET verified = true
      WHERE email = $1
      `,
      [email]
    );

    const domain =
      email.split("@")[1];

    return res.json({
      success: true,
      verified: true,
      domainVerified: true,
      domain,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Verification failed",
    });
  }
});

export default router;
/* =====================================================
   HIGH RISK (AUTO REJECT)
===================================================== */

const BLOCKED_TERMS = [
  "kill yourself",
  "go kill yourself",
  "terrorist attack",
  "bomb attack",
  "mass shooting",
];

/* =====================================================
   MEDIUM RISK (HUMAN REVIEW)
===================================================== */

const REVIEW_TERMS = [
  "free money",
  "click here",
  "guaranteed profit",
  "bitcoin giveaway",
  "send deposit",
  "deposit before inspection",
  "pay upfront",
  "wire transfer",
  "urgent payment",
  "crypto only",
];

/* =====================================================
   MODERATION ENGINE
===================================================== */

export function moderateTextContent({
  title = "",
  content = "",
}) {
  const text = `${title} ${content}`
    .toLowerCase()
    .trim();

  /* =========================
     AUTO REJECT
  ========================= */

  const blockedMatches = BLOCKED_TERMS.filter((term) =>
    text.includes(term)
  );

  if (blockedMatches.length > 0) {
    return {
      status: "rejected",
      requiresReview: false,
      category: "high_risk",
      severity: "high",
      score: 95,
      reason:
        "High-risk abusive, violent or extremist language detected.",
      labels: blockedMatches,
    };
  }

  /* =========================
     REVIEW
  ========================= */

  const reviewMatches = REVIEW_TERMS.filter((term) =>
    text.includes(term)
  );

  if (reviewMatches.length > 0) {
    return {
      status: "review",
      requiresReview: true,
      category: "spam_scam",
      severity: "medium",
      score: 65,
      reason:
        "Potential spam or scam language detected.",
      labels: reviewMatches,
    };
  }

  /* =========================
     APPROVED
  ========================= */

  return {
    status: "approved",
    requiresReview: false,
    category: "safe",
    severity: "low",
    score: 0,
    reason: null,
    labels: [],
  };
}
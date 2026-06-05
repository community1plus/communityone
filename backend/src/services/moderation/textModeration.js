const BLOCKED_TERMS = [
  "kill yourself",
  "terrorist attack",
];

const REVIEW_TERMS = [
  "free money",
  "click here",
  "guaranteed profit",
  "bitcoin giveaway",
  "send deposit",
  "pay upfront",
  "wire transfer",
  "urgent payment",
];

export function moderateTextContent({
  title = "",
  content = "",
}) {
  const text = `${title} ${content}`.toLowerCase();

  const blockedMatches = BLOCKED_TERMS.filter((term) =>
    text.includes(term)
  );

  if (blockedMatches.length) {
    return {
      status: "rejected",
      requiresReview: true,
      reason: "Blocked text content detected.",
      labels: blockedMatches,
    };
  }

  const reviewMatches = REVIEW_TERMS.filter((term) =>
    text.includes(term)
  );

  if (reviewMatches.length) {
    return {
      status: "review",
      requiresReview: true,
      reason: "Potential spam or scam language detected.",
      labels: reviewMatches,
    };
  }

  return {
    status: "approved",
    requiresReview: false,
    reason: "",
    labels: [],
  };
}
const BLOCKED_TERMS = [
  "kill yourself",
  "terrorist attack",
];

export function moderateTextContent({
  title = "",
  content = "",
}) {
  const text = `${title} ${content}`.toLowerCase();

  const matchedTerms = BLOCKED_TERMS.filter((term) =>
    text.includes(term)
  );

  if (matchedTerms.length) {
    return {
      status: "rejected",
      requiresReview: true,
      reason: "Blocked text content detected.",
      labels: matchedTerms,
    };
  }

  return {
    status: "approved",
    requiresReview: false,
    reason: "",
    labels: [],
  };
}
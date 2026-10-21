import {
  fetchParticipationByPersonId,
} from "../repositories/personParticipationRepository.js";

export function createRequireCompletedOnboarding({
  fetchParticipationByPersonId,
}) {
  return async function requireCompletedOnboarding(
    req,
    res,
    next
  ) {
    const personId = req.user?.personId;

    if (!personId) {
      return res.status(403).json({
        error: "A valid person participation is required.",
        code: "ONBOARDING_REQUIRED",
      });
    }

    try {
      const participation =
        await fetchParticipationByPersonId(personId);

      if (!participation) {
        return res.status(403).json({
          error: "Person participation could not be verified.",
          code: "ONBOARDING_REQUIRED",
        });
      }

      const status = String(
        participation.onboardingStatus || ""
      ).toUpperCase();

      if (status !== "COMPLETED") {
        return res.status(403).json({
          error:
            "Complete your minimum profile before contributing.",
          code: "ONBOARDING_REQUIRED",
          onboardingStatus: status,
        });
      }

      return next();
    } catch (error) {
      console.error(
        "Failed to verify onboarding before contribution:",
        error
      );

      return res.status(500).json({
        error: "Unable to verify onboarding status.",
      });
    }
  };
}

export default createRequireCompletedOnboarding({
  fetchParticipationByPersonId,
});

export function isGuest(user, isGuestSession = false, participation = null) {
  return (
    isGuestSession ||
    (
      Boolean(user) &&
      participation?.onboardingStatus === "GUEST"
    )
  );
}

export function canBrowse() {
  return true;
}

export function canCreate(user, isGuestSession = false, participation = null) {
  return Boolean(user) && !isGuest(user, isGuestSession, participation);
}

export function canUpload(user, isGuestSession = false, participation = null) {
  return canCreate(user, isGuestSession, participation);
}

export function canComment(user, isGuestSession = false, participation = null) {
  return canCreate(user, isGuestSession, participation);
}

export function canSave(user, isGuestSession = false, participation = null) {
  return canCreate(user, isGuestSession, participation);
}

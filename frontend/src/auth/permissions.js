export function isGuest(user) {
  return !user;
}

export function canView() {
  return true;
}

export function canCreate(user) {
  return !!user;
}

export function canUpload(user) {
  return !!user;
}

export function canSave(user) {
  return !!user;
}

export function canComment(user) {
  return !!user;
}

export function canModerate(user) {
  return user?.role === "moderator";
}
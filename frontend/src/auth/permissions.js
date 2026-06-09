export function isGuest(user) {
  return !user;
}

export function canCreate(user) {
  return !!user;
}

export function canUpload(user) {
  return !!user;
}

export function canComment(user) {
  return !!user;
}

export function canSave(user) {
  return !!user;
}
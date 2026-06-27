export function rowToIdentity(row) {

  if (!row) {
    return null;
  }

  return {

    identityId: row.identity_id,

    displayName: row.display_name,

    identityType: row.identity_type,

    avatarUrl: row.avatar_url,

    status: row.status,

    createdAt: row.created_at,

  };

}
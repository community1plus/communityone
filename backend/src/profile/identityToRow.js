export function identityToRow(identity) {

  return {

    display_name: identity.displayName,

    identity_type: identity.identityType,

    avatar_url: identity.avatarUrl,

  };

}

import {
  linkAuthIdentityToUser,
} from "../src/repositories/identityRepository.js";

const ALLOWED_AUTH_METHODS = new Set([
  "google",
  "facebook",
  "email",
]);

/**
 * Link a separately verified Cognito identity to the
 * currently authenticated Community One user.
 *
 * Both contexts must be produced by trusted server-side
 * authentication code. Never pass raw client claims here.
 */
export async function linkAuthenticationIdentity({
  primaryAuthContext,
  secondaryAuthContext,
}) {
  const userId = primaryAuthContext?.userId;
  const secondarySub = secondaryAuthContext?.cognitoSub;
  const authMethod = String(
    secondaryAuthContext?.authMethod || ""
  ).trim().toLowerCase();

  if (!userId) {
    throw new Error("Missing primary Community One user");
  }

  if (!secondarySub) {
    throw new Error("Missing secondary Cognito subject");
  }

  if (!ALLOWED_AUTH_METHODS.has(authMethod)) {
    throw new Error("Unsupported authentication method");
  }

  if (secondaryAuthContext?.verified !== true) {
    throw new Error(
      "Secondary authentication identity has not been verified"
    );
  }

  // Prevent attempting to link the currently active identity
  // as if it were a different identity.
  if (
    primaryAuthContext.cognitoSub &&
    primaryAuthContext.cognitoSub === secondarySub
  ) {
    return {
      userId,
      cognitoSub: secondarySub,
      authMethod,
      alreadyLinked: true,
    };
  }

  const result = await linkAuthIdentityToUser(
    userId,
    secondarySub
  );

  return {
    userId: result.userId,
    cognitoSub: result.cognitoSub,
    authMethod,
    alreadyLinked: result.alreadyLinked,
  };
}

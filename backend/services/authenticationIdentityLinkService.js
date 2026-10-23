
import {
  linkAuthIdentityToUser,
} from "../repositories/identityRepository.js";

import {
  verifySecondaryCognitoIdentity,
} from "./secondaryCognitoIdentityVerifier.js";

const ALLOWED_AUTH_METHODS = new Set([
  "google",
  "facebook",
  "email",
]);

/**
 * Link a separately authenticated Cognito identity to an
 * existing Community One user.
 *
 * primaryAuthContext must come from the existing server-side
 * authentication middleware.
 *
 * secondaryIdToken must be independently verified here.
 */
export async function linkAuthenticationIdentity({
  primaryAuthContext,
  secondaryIdToken,
}) {
  const userId = primaryAuthContext?.userId;
  const primarySub = primaryAuthContext?.cognitoSub;

  if (!userId) {
    throw new Error("Missing primary Community One user");
  }

  if (!secondaryIdToken) {
    throw new Error("Missing secondary Cognito ID token");
  }

  // Verify the secondary token on the server. Never accept
  // authMethod, subject, or verification flags from the client.
  const secondaryAuthContext =
    await verifySecondaryCognitoIdentity(secondaryIdToken);

  const secondarySub = secondaryAuthContext.cognitoSub;
  const authMethod = String(
    secondaryAuthContext.authMethod || ""
  ).trim().toLowerCase();

  if (!secondarySub) {
    throw new Error("Missing secondary Cognito subject");
  }

  if (!ALLOWED_AUTH_METHODS.has(authMethod)) {
    throw new Error("Unsupported authentication method");
  }

  if (
    secondaryAuthContext.verificationSource !==
    "server-cognito-verifier"
  ) {
    throw new Error(
      "Secondary authentication identity has not been verified"
    );
  }

  if (primarySub && primarySub === secondarySub) {
    return {
      userId,
      cognitoSub: secondarySub,
      authMethod,
      alreadyLinked: true,
    };
  }

  const result = await linkAuthIdentityToUser(
    userId,
    secondarySub,
    authMethod
  );

  return {
    userId: result.userId,
    cognitoSub: result.cognitoSub,
    authMethod,
    alreadyLinked: result.alreadyLinked,
  };
}

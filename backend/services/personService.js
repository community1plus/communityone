
import { pool } from "../src/db/pool.js";

import {
  fetchPersonByUserId,
  createPersonForUser,
} from "../repositories/personRepository.js";

import {
  fetchParticipationByPersonId,
  createDefaultParticipation,
} from "../repositories/personParticipationRepository.js";

/**
 * Ensures an authenticated application user has:
 * - One PERSON record
 * - One participation record
 *
 * Existing records are preserved.
 * New participation defaults to GUEST / PERSON.
 *
 * userId is users.id, not Cognito's sub.
 */
export async function ensurePersonParticipation(userId) {
  if (!userId) {
    throw new Error(
      "Cannot resolve PERSON without userId"
    );
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // 1. Find or create the PERSON.
    let person = await fetchPersonByUserId(
      userId,
      client
    );

    if (!person) {
      person = await createPersonForUser(
        userId,
        client
      );
    }

    if (!person) {
      throw new Error(
        `Unable to resolve PERSON for userId ${userId}`
      );
    }

    // 2. Find or create participation.
    let participation =
      await fetchParticipationByPersonId(
        person.personId,
        client
      );

    if (!participation) {
      participation =
        await createDefaultParticipation(
          person.personId,
          client
        );
    }

    if (!participation) {
      throw new Error(
        `Unable to resolve participation for personId ${person.personId}`
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      userId,
      person,
      participation,
    };
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        // Preserve the original failure.
        console.error(
          "Failed to roll back PERSON participation transaction:",
          rollbackError
        );
      }
    }

    throw error;
  } finally {
    client.release();
  }
}


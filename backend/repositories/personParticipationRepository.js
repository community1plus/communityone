javascript
import { pool } from "../src/db/pool.js";

const TABLE = "person_participation";

/* =====================================================
   FETCH PARTICIPATION BY PERSON ID
===================================================== */

export async function fetchParticipationByPersonId(
  personId
) {
  if (!personId) {
    throw new Error("Missing personId");
  }

  const { rows } = await pool.query(
    `
      SELECT *
      FROM ${TABLE}
      WHERE person_id = $1
      LIMIT 1
    `,
    [personId]
  );

  return rows[0]
    ? rowToParticipation(rows[0])
    : null;
}

/* =====================================================
   CREATE DEFAULT PARTICIPATION
===================================================== */

export async function createDefaultParticipation(
  personId
) {
  if (!personId) {
    throw new Error(
      "Cannot create participation without personId"
    );
  }

  const { rows } = await pool.query(
    `
      INSERT INTO ${TABLE} (
        person_id,
        onboarding_status,
        participation_scope
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (person_id)
      DO NOTHING
      RETURNING *
    `,
    [
      personId,
      "GUEST",
      "PERSON",
    ]
  );

  // Return the newly created record, or fetch the
  // existing record if another request created it.
  if (rows[0]) {
    return rowToParticipation(rows[0]);
  }

  return fetchParticipationByPersonId(personId);
}

/* =====================================================
   ROW MAPPER
===================================================== */

function rowToParticipation(row) {
  if (!row) {
    return null;
  }

  return {
    personParticipationId:
      row.person_participation_id,

    personId:
      row.person_id,

    onboardingStatus:
      row.onboarding_status,

    participationScope:
      row.participation_scope,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}
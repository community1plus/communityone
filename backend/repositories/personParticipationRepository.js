import { pool } from "../db/pool.js";

const TABLE = "person_participation";

/* =====================================================
   FETCH PARTICIPATION BY PERSON ID
===================================================== */

export async function fetchParticipationByPersonId(
  personId,
  db = pool
) {
  if (!personId) {
    throw new Error("Missing personId");
  }

  const { rows } = await db.query(
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
   UPDATE ONBOARDING STATUS
===================================================== */

export async function updateParticipationStatus(
  personId,
  onboardingStatus,
  db = pool
) {
  if (!personId) {
    throw new Error("Missing personId");
  }

  const allowedStatuses = new Set([
    "GUEST",
    "IN_PROGRESS",
    "COMPLETED",
  ]);

  if (!allowedStatuses.has(onboardingStatus)) {
    throw new Error("Invalid onboarding status");
  }

  const { rows } = await db.query(
    `
      UPDATE ${TABLE}
      SET
        onboarding_status = $2,
        updated_at = NOW()
      WHERE person_id = $1
        AND (
          onboarding_status = $2
          OR (
            onboarding_status = 'CHOICE_REQUIRED'
            AND $2 IN ('GUEST', 'IN_PROGRESS')
          )
          OR (
            onboarding_status = 'GUEST'
            AND $2 = 'IN_PROGRESS'
          )
          OR (
            onboarding_status = 'IN_PROGRESS'
            AND $2 = 'COMPLETED'
          )
        )
      RETURNING *
    `,
    [personId, onboardingStatus]
  );

  return rows[0] ? rowToParticipation(rows[0]) : null;
}


/* =====================================================
   CREATE DEFAULT PARTICIPATION
===================================================== */

export async function createDefaultParticipation(
  personId,
  db = pool
) {
  if (!personId) {
    throw new Error(
      "Cannot create participation without personId"
    );
  }

  const { rows } = await db.query(
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
      "CHOICE_REQUIRED",
      "PERSON"
    ]
  );

  // Return the newly created record, or fetch the
  // existing record if another request created it.
  if (rows[0]) {
    return rowToParticipation(rows[0]);
  }

  return fetchParticipationByPersonId(personId, db);
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
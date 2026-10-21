import test from "node:test";
import assert from "node:assert/strict";

import {
  createDefaultParticipation,
  fetchParticipationByPersonId,
  updateParticipationStatus,
} from "../repositories/personParticipationRepository.js";

function makeParticipationRow(overrides = {}) {
  return {
    person_participation_id: "participation-1",
    person_id: "person-1",
    onboarding_status: "IN_PROGRESS",
    participation_scope: "PERSON",
    created_at: new Date("2026-01-01T00:00:00Z"),
    updated_at: new Date("2026-01-02T00:00:00Z"),
    ...overrides,
  };
}

function makeDb({ rows = [] } = {}) {
  const calls = [];

  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params });
      return { rows };
    },
  };
}

test("fetchParticipationByPersonId maps a database row", async () => {
  const row = makeParticipationRow();
  const db = makeDb({ rows: [row] });

  const result = await fetchParticipationByPersonId("person-1", db);

  assert.equal(result.personId, "person-1");
  assert.equal(result.onboardingStatus, "IN_PROGRESS");
  assert.equal(result.participationScope, "PERSON");
  assert.match(db.calls[0].sql, /WHERE person_id = \$1/);
  assert.deepEqual(db.calls[0].params, ["person-1"]);
});

test("fetchParticipationByPersonId rejects a missing person ID", async () => {
  await assert.rejects(
    fetchParticipationByPersonId(""),
    /Missing personId/
  );
});

test("updateParticipationStatus rejects unsupported statuses", async () => {
  const db = makeDb();

  await assert.rejects(
    updateParticipationStatus("person-1", "CHOICE_REQUIRED", db),
    /Invalid onboarding status/
  );

  assert.equal(db.calls.length, 0);
});

test("updateParticipationStatus uses the allowed transition rules", async () => {
  const db = makeDb({ rows: [makeParticipationRow({
    onboarding_status: "COMPLETED",
  })] });

  const result = await updateParticipationStatus(
    "person-1",
    "COMPLETED",
    db
  );

  assert.equal(result.onboardingStatus, "COMPLETED");
  assert.deepEqual(db.calls[0].params, ["person-1", "COMPLETED"]);

  const sql = db.calls[0].sql;
  assert.match(sql, /onboarding_status = 'CHOICE_REQUIRED'/);
  assert.match(sql, /onboarding_status = 'GUEST'/);
  assert.match(sql, /onboarding_status = 'IN_PROGRESS'/);
  assert.match(sql, /RETURNING \*/);
});

test("updateParticipationStatus returns null when no transition matches", async () => {
  const db = makeDb();

  const result = await updateParticipationStatus(
    "person-1",
    "IN_PROGRESS",
    db
  );

  assert.equal(result, null);
});

test("createDefaultParticipation inserts CHOICE_REQUIRED / PERSON", async () => {
  const db = makeDb({
    rows: [makeParticipationRow({
      onboarding_status: "CHOICE_REQUIRED",
    })],
  });

  const result = await createDefaultParticipation("person-1", db);

  assert.equal(result.onboardingStatus, "CHOICE_REQUIRED");
  assert.equal(result.participationScope, "PERSON");
  assert.deepEqual(db.calls[0].params, [
    "person-1",
    "CHOICE_REQUIRED",
    "PERSON",
  ]);
  assert.match(db.calls[0].sql, /ON CONFLICT \(person_id\)\s+DO NOTHING/);
});

test("createDefaultParticipation fetches the existing row after a conflict", async () => {
  let callCount = 0;

  const db = {
    async query() {
      callCount += 1;

      if (callCount === 1) {
        return { rows: [] };
      }

      return {
        rows: [makeParticipationRow({
          onboarding_status: "GUEST",
        })],
      };
    },
  };

  const result = await createDefaultParticipation("person-1", db);

  assert.equal(callCount, 2);
  assert.equal(result.onboardingStatus, "GUEST");
});
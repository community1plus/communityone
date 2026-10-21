
import test from "node:test";
import assert from "node:assert/strict";

import {
  createParticipationHandler,
} from "../src/routes/meRoutes.js";

const personId = "person-1";
const userId = "user-1";

function makeParticipation(onboardingStatus) {
  return {
    personId,
    onboardingStatus,
    participationScope: "PERSON",
  };
}

function makeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function makeHarness({
  initialStatus = "IN_PROGRESS",
  profile = {
    username: "test-user",
    phone: "+61400000000",
    homeLocation: { lat: -37.81, lng: 144.96 },
  },
  updateResult,
  fetchError,
  profileError,
} = {}) {
  let current = makeParticipation(initialStatus);
  const calls = {
    fetch: [],
    update: [],
    profile: [],
  };

  const handler = createParticipationHandler({
    async fetchParticipationByPersonId(id) {
      calls.fetch.push(id);
      if (fetchError) throw fetchError;
      return current;
    },

    async updateParticipationStatus(id, status) {
      calls.update.push([id, status]);

      if (updateResult === null) return null;

      current = makeParticipation(status);
      return current;
    },

    async getProfileService(args) {
      calls.profile.push(args);
      if (profileError) throw profileError;
      return { profile };
    },
  });

  async function invoke(onboardingStatus, user = {
    personId,
    userId,
  }) {
    const req = {
      user,
      body: { onboardingStatus },
    };
    const res = makeResponse();

    await handler(req, res);

    return res;
  }

  return { calls, invoke };
}

test("GUEST transition succeeds", async () => {
  const h = makeHarness({ initialStatus: "CHOICE_REQUIRED" });

  const res = await h.invoke("GUEST");

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.participation.onboardingStatus, "GUEST");
  assert.deepEqual(h.calls.update, [[personId, "GUEST"]]);
});

test("IN_PROGRESS transition succeeds", async () => {
  const h = makeHarness({ initialStatus: "CHOICE_REQUIRED" });

  const res = await h.invoke("IN_PROGRESS");

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.participation.onboardingStatus, "IN_PROGRESS");
});

test("valid minimum profile allows completion", async () => {
  const h = makeHarness({ initialStatus: "IN_PROGRESS" });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.participation.onboardingStatus, "COMPLETED");
  assert.deepEqual(h.calls.profile, [{ userId }]);
});

test("missing username prevents completion", async () => {
  const h = makeHarness({
    profile: {
      phone: "+61400000000",
      homeLocation: { lat: -37.81, lng: 144.96 },
    },
  });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 400);
  assert.equal(h.calls.update.length, 0);
});

test("missing phone prevents completion", async () => {
  const h = makeHarness({
    profile: {
      username: "test-user",
      homeLocation: { lat: -37.81, lng: 144.96 },
    },
  });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 400);
  assert.equal(h.calls.update.length, 0);
});

test("invalid coordinates prevent completion", async () => {
  const h = makeHarness({
    profile: {
      username: "test-user",
      phone: "+61400000000",
      homeLocation: { lat: "not-a-number", lng: 144.96 },
    },
  });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 400);
  assert.equal(h.calls.update.length, 0);
});

test("cannot complete directly from CHOICE_REQUIRED", async () => {
  const h = makeHarness({ initialStatus: "CHOICE_REQUIRED" });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 409);
  assert.equal(h.calls.profile.length, 0);
  assert.equal(h.calls.update.length, 0);
});

test("cannot complete directly from GUEST", async () => {
  const h = makeHarness({ initialStatus: "GUEST" });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 409);
  assert.equal(h.calls.update.length, 0);
});

test("repeated completion is idempotent", async () => {
  const h = makeHarness({ initialStatus: "COMPLETED" });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.participation.onboardingStatus, "COMPLETED");
  assert.equal(h.calls.update.length, 0);
  assert.equal(h.calls.profile.length, 0);
});

test("cannot downgrade completed onboarding", async () => {
  const h = makeHarness({ initialStatus: "COMPLETED" });

  const res = await h.invoke("GUEST");

  assert.equal(res.statusCode, 409);
  assert.equal(h.calls.update.length, 0);
});

test("missing authenticated identity is rejected", async () => {
  const h = makeHarness();

  const res = await h.invoke("IN_PROGRESS", {});

  assert.equal(res.statusCode, 409);
  assert.equal(h.calls.update.length, 0);
});

test("profile service errors return 500", async () => {
  const h = makeHarness({
    profileError: new Error("profile service unavailable"),
  });

  const res = await h.invoke("COMPLETED");

  assert.equal(res.statusCode, 500);
  assert.equal(h.calls.update.length, 0);
});

test("concurrent request already reached requested status returns success", async () => {
  let fetchCount = 0;

  const handler = createParticipationHandler({
    async fetchParticipationByPersonId() {
      fetchCount += 1;

      return {
        personId,
        onboardingStatus: fetchCount === 1
          ? "CHOICE_REQUIRED"
          : "GUEST",
        participationScope: "PERSON",
      };
    },

    async updateParticipationStatus() {
      return null;
    },

    async getProfileService() {
      throw new Error("Profile service should not be called");
    },
  });

  const res = makeResponse();

  await handler(
    {
      user: { personId, userId },
      body: { onboardingStatus: "GUEST" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.participation.onboardingStatus, "GUEST");
  assert.equal(fetchCount, 2);
});

test("concurrent completion prevents a downgrade", async () => {
  let fetchCount = 0;
  let updateCalled = false;

  const handler = createParticipationHandler({
    async fetchParticipationByPersonId() {
      fetchCount += 1;

      return {
        personId,
        onboardingStatus: fetchCount === 1
          ? "IN_PROGRESS"
          : "COMPLETED",
        participationScope: "PERSON",
      };
    },

    async updateParticipationStatus() {
      updateCalled = true;
      return null;
    },

    async getProfileService() {
      return {
        profile: {
          username: "test-user",
          phone: "+61400000000",
          homeLocation: { lat: -37.81, lng: 144.96 },
        },
      };
    },
  });

  const res = makeResponse();

  await handler(
    {
      user: { personId, userId },
      body: { onboardingStatus: "GUEST" },
    },
    res
  );

  assert.equal(updateCalled, true);
  assert.equal(res.statusCode, 409);
  assert.equal(
    res.body.error,
    "Completed onboarding cannot be downgraded."
  );
  assert.equal(fetchCount, 2);
});


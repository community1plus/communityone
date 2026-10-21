import test from "node:test";
import assert from "node:assert/strict";

import {
  createRequireCompletedOnboarding,
} from "../middleware/requireCompletedOnboarding.js";

function createResponse() {
  return {
    statusCode: null,
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

function createMiddleware(fetchParticipation) {
  return createRequireCompletedOnboarding({
    fetchParticipationByPersonId: fetchParticipation,
  });
}

test("COMPLETED allows the request through", async () => {
  const middleware = createMiddleware(async () => ({
    onboardingStatus: "COMPLETED",
  }));

  const res = createResponse();
  let nextCalled = false;

  await middleware(
    { user: { personId: "person-1" } },
    res,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

for (const status of [
  "GUEST",
  "IN_PROGRESS",
  "CHOICE_REQUIRED",
]) {
  test(`${status} is denied`, async () => {
    const middleware = createMiddleware(async () => ({
      onboardingStatus: status,
    }));

    const res = createResponse();
    let nextCalled = false;

    await middleware(
      { user: { personId: "person-1" } },
      res,
      () => {
        nextCalled = true;
      }
    );

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.code, "ONBOARDING_REQUIRED");
    assert.equal(res.body.onboardingStatus, status);
  });
}

test("missing person identity is denied without a lookup", async () => {
  let lookupCalled = false;

  const middleware = createMiddleware(async () => {
    lookupCalled = true;
    return { onboardingStatus: "COMPLETED" };
  });

  const res = createResponse();

  await middleware({}, res, () => {
    assert.fail("next() must not be called");
  });

  assert.equal(res.statusCode, 403);
  assert.equal(lookupCalled, false);
});

test("missing participation is denied", async () => {
  const middleware = createMiddleware(async () => null);
  const res = createResponse();

  await middleware(
    { user: { personId: "person-1" } },
    res,
    () => assert.fail("next() must not be called")
  );

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, "ONBOARDING_REQUIRED");
});

test("database failure returns 500 and denies access", async () => {
  const middleware = createMiddleware(async () => {
    throw new Error("Simulated database failure");
  });

  const res = createResponse();
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await middleware(
      { user: { personId: "person-1" } },
      res,
      () => assert.fail("next() must not be called")
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 500);
  assert.equal(
    res.body.error,
    "Unable to verify onboarding status."
  );
});
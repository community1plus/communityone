import { pool } from "./src/db/pool.js";

import {
  ensurePersonParticipation,
} from "./services/personService.js";

const userId =
  "7f461fa4-f6a4-4b8a-b8ea-250df765cb72";

try {
  const result =
    await ensurePersonParticipation(userId);

  console.log(
    "PERSON BOOTSTRAP RESULT:"
  );

  console.dir(result, {
    depth: null,
  });
} catch (error) {
  console.error(
    "PERSON BOOTSTRAP FAILED:",
    error
  );

  process.exitCode = 1;
} finally {
  await pool.end();
}

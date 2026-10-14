import { pool } from "./src/db/pool.js";
import {
  ensurePersonParticipation,
} from "./services/personService.js";

const userId =
  "7f461fa4-6a49-4b8a-b8ea-250df765cb72";

try {
  const check = await pool.query(
    `SELECT id, email FROM public.users WHERE id = $1`,
    [userId]
  );

  console.log("USER LOOKUP:");
  console.table(check.rows);

  if (check.rows.length === 0) {
    throw new Error(
      "Backend cannot find the user; bootstrap cancelled."
    );
  }

  const result =
    await ensurePersonParticipation(userId);

  console.log("BOOTSTRAP RESULT:");
  console.dir(result, { depth: null });
} catch (error) {
  console.error("TEST FAILED:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

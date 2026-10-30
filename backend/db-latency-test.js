
import { pool } from "./src/db/pool.js";
import { performance } from "node:perf_hooks";

try {
  // Warm up the connection
  await pool.query("SELECT 1");

  const results = [];

  for (let i = 1; i <= 10; i++) {
    const start = performance.now();

    await pool.query("SELECT 1");

    const elapsed = performance.now() - start;

    results.push(elapsed);
    console.log(`Test ${i}: ${elapsed.toFixed(2)} ms`);
  }

  const average =
    results.reduce((sum, value) => sum + value, 0) /
    results.length;

  console.log(`Average: ${average.toFixed(2)} ms`);
} catch (error) {
  console.error("Database latency test failed:", error);
} finally {
  await pool.end();
}

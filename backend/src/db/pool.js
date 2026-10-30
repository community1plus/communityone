import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is missing");
}

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});


pool.on("connect", () => {
  console.log("[DB POOL] New database connection established");
});

pool.on("acquire", () => {
  console.log("[DB POOL] Existing connection acquired");
});

pool.on("remove", () => {
  console.log("[DB POOL] Connection removed from pool");
});

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error(
      "❌ MongoDB connection failed:",
      err
    );

    process.exit(1);
  }
}
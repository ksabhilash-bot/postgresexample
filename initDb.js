import pool from "./db.js";

export const creationOfTable = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto" `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `);
  } catch (error) {
    console.log("Error occured in initDb:", error);
  }
};

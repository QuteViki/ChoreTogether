import pg from "pg";
import "dotenv/config";

// Return DATE columns as plain strings ("2026-08-23") instead of JS Date objects.
// Otherwise pg creates a Date at local midnight, which can shift the date backward
// by one day when it is converted to UTC during JSON serialization.
pg.types.setTypeParser(1082, (val) => val);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

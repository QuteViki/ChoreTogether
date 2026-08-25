import pg from "pg";
import "dotenv/config";

// DATE stupce vraćaj kao čisti string ("2026-08-23"), a ne kao JS Date objekt —
// inače pg gradi Date na "ponoć po lokalnoj vremenskoj zoni", što se onda krivo
// pretvori u UTC pri slanju JSON-a i pomakne datum za jedan dan unatrag.
pg.types.setTypeParser(1082, (val) => val);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

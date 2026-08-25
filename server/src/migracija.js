import { pool } from "./db.js";

const sql = `
CREATE TABLE IF NOT EXISTS households (
  id SERIAL PRIMARY KEY,
  naziv TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  ime TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  household_id INTEGER REFERENCES households(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stavke (
  id SERIAL PRIMARY KEY,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  tip TEXT NOT NULL CHECK (tip IN ('zadatak', 'dogadaj')),
  naziv TEXT NOT NULL,
  datum DATE NOT NULL,
  gotovo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS popisi_kupovine (
  id SERIAL PRIMARY KEY,
  household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  stavka_id INTEGER REFERENCES stavke(id) ON DELETE SET NULL,
  naziv TEXT NOT NULL,
  boja TEXT NOT NULL DEFAULT 'primary',
  datum DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stavke_popisa (
  id SERIAL PRIMARY KEY,
  popis_id INTEGER NOT NULL REFERENCES popisi_kupovine(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  kolicina INTEGER NOT NULL DEFAULT 1,
  kupljeno BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

await pool.query(sql);
console.log("Tablice su uspješno kreirane.");
process.exit(0);

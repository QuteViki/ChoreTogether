import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const householdsRoute = Router();

function generirajKodPozivnice() {
  const znakovi = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let kod = "";
  for (let i = 0; i < 6; i++) {
    kod += znakovi[Math.floor(Math.random() * znakovi.length)];
  }
  return kod;
}

householdsRoute.post("/kreiraj", trebaPrijavu, async (req, res) => {
  const { household_name } = req.body;
  if (!household_name)
    return res.status(400).json({ greska: "Naziv kućanstva je obavezan." });

  const kod = generirajKodPozivnice();
  const rezultat = await pool.query(
    `INSERT INTO households (household_name, invite_code)
    VALUES ($1, $2)
    RETURNING id, household_name, invite_code, created_at`,
    [household_name, kod],
  );
  const kucanstvo = rezultat.rows[0];

  await pool.query("UPDATE users SET household_id = $1 WHERE id = $2", [
    kucanstvo.id,
    req.userId,
  ]);

  res.status(201).json(kucanstvo);
});

householdsRoute.post("/pridruzi", trebaPrijavu, async (req, res) => {
  const { kod } = req.body;
  const rezultat = await pool.query(
    "SELECT id, household_name, invite_code, created_at FROM households WHERE invite_code = $1",
    [kod?.toUpperCase()],
  );
  const kucanstvo = rezultat.rows[0];

  if (!kucanstvo)
    return res
      .status(404)
      .json({ greska: "Kod za pridruživanje nije pronađen." });

  await pool.query("UPDATE users SET household_id = $1 WHERE id = $2", [
    kucanstvo.id,
    req.userId,
  ]);

  res.json(kucanstvo);
});

householdsRoute.get("/moje", trebaPrijavu, async (req, res) => {
  const korisnik = await pool.query(
    "SELECT household_id FROM users WHERE id = $1",
    [req.userId],
  );
  const householdId = korisnik.rows[0]?.household_id;

  if (!householdId)
    return res.status(404).json({ greska: "Niste u kućanstvu." });

  const kucanstvo = await pool.query(
    "SELECT id, household_name, invite_code, created_at FROM households WHERE id = $1",
    [householdId],
  );
  const clanovi = await pool.query(
    `SELECT id, username, email, profile_picture
     FROM users WHERE household_id = $1`,
    [householdId],
  );

  res.json({ ...kucanstvo.rows[0], clanovi: clanovi.rows });
});

// Rename a household. trebaKucanstvo always verifies that it belongs to
// the current user, never to another household.
householdsRoute.patch("/", trebaPrijavu, trebaKucanstvo, async (req, res) => {
  const { household_name } = req.body;
  if (!household_name || !household_name.trim()) {
    return res.status(400).json({ greska: "Naziv kućanstva je obavezan." });
  }

  const rezultat = await pool.query(
    `UPDATE households SET household_name = $1 WHERE id = $2
     RETURNING id, household_name, invite_code, created_at`,
    [household_name.trim(), req.householdId],
  );

  res.json(rezultat.rows[0]);
});

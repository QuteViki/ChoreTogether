import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const statistikaRoute = Router();
statistikaRoute.use(trebaPrijavu, trebaKucanstvo);

statistikaRoute.get("/", async (req, res) => {
  const razdoblje = req.query.razdoblje === "mjesec" ? "mjesec" : "tjedan";
  const brojDana = razdoblje === "mjesec" ? 30 : 7;

  const poKorisnikuRezultat = await pool.query(
    `SELECT u.id, u.ime, u.profil_slika, COUNT(s.id)::int AS broj_zavrsenih
     FROM users u
     LEFT JOIN stavke s
       ON s.zavrsio_id = u.id
       AND s.household_id = $1
       AND s.zavrseno_at >= NOW() - ($2 || ' days')::interval
     WHERE u.household_id = $1
     GROUP BY u.id, u.ime, u.profil_slika
     ORDER BY broj_zavrsenih DESC`,
    [req.householdId, brojDana],
  );

  const poZadatkuRezultat = await pool.query(
    `SELECT naziv, COUNT(*)::int AS broj
     FROM stavke
     WHERE household_id = $1
       AND tip = 'zadatak'
       AND zavrseno_at >= NOW() - ($2 || ' days')::interval
     GROUP BY naziv
     ORDER BY broj DESC`,
    [req.householdId, brojDana],
  );

  const prenesenoRezultat = await pool.query(
    `SELECT naziv, COUNT(*)::int AS broj
     FROM stavke
     WHERE household_id = $1
       AND tip = 'zadatak'
       AND gotovo = false
       AND datum < CURRENT_DATE
     GROUP BY naziv
     ORDER BY broj DESC
     LIMIT 3`,
    [req.householdId],
  );

  const ukupnoZavrseno = poKorisnikuRezultat.rows.reduce(
    (zbroj, r) => zbroj + r.broj_zavrsenih,
    0,
  );

  res.json({
    razdoblje,
    poKorisniku: poKorisnikuRezultat.rows,
    ukupnoZavrseno,
    poZadatku: poZadatkuRezultat.rows,
    najviseProneseno: prenesenoRezultat.rows,
  });
});

// Detaljan popis zadataka koje je konkretan član kućanstva odradio u
// odabranom razdoblju — koristi se za prikaz nakon klika na člana na
// stranici statistike. Household provjera je automatska jer se filtrira
// po req.householdId, pa netko iz drugog kućanstva ne može dohvatiti tuđe podatke.
statistikaRoute.get("/korisnik/:id", async (req, res) => {
  const razdoblje = req.query.razdoblje === "mjesec" ? "mjesec" : "tjedan";
  const brojDana = razdoblje === "mjesec" ? 30 : 7;

  const rezultat = await pool.query(
    `SELECT id, naziv, datum, boja, zavrseno_at
     FROM stavke
     WHERE household_id = $1
       AND zavrsio_id = $2
       AND zavrseno_at >= NOW() - ($3 || ' days')::interval
     ORDER BY zavrseno_at DESC`,
    [req.householdId, req.params.id, brojDana],
  );

  res.json(rezultat.rows);
});

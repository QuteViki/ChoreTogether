import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const statistikaRoute = Router();
statistikaRoute.use(trebaPrijavu, trebaKucanstvo);

statistikaRoute.get("/", async (req, res) => {
  const razdoblje = req.query.razdoblje === "mjesec" ? "mjesec" : "tjedan";
  const jedinica = razdoblje === "mjesec" ? "month" : "week";

  const poKorisnikuRezultat = await pool.query(
    `SELECT u.id, u.username, u.profile_picture,
        COUNT(s.id)::int
     FROM users u
     LEFT JOIN items s
       ON s.completed_id = u.id
       AND s.household_id = $1
       AND s.completed_at >= date_trunc($2, NOW())
     WHERE u.household_id = $1
     GROUP BY u.id, u.username, u.profile_picture
     ORDER BY count DESC`,
    [req.householdId, jedinica],
  );

  const poZadatkuRezultat = await pool.query(
    `SELECT item, COUNT(*)::int
     FROM items
     WHERE household_id = $1
       AND item_type = 'zadatak'
       AND completed_at >= date_trunc($2, NOW())
     GROUP BY item
     ORDER BY count DESC`,
    [req.householdId, jedinica],
  );

  const prenesenoRezultat = await pool.query(
    `SELECT item, COUNT(*)::int
     FROM items
     WHERE household_id = $1
       AND item_type = 'zadatak'
       AND completed = false
       AND item_date < CURRENT_DATE
     GROUP BY item
     ORDER BY count DESC
     LIMIT 3`,
    [req.householdId],
  );

  const ukupnoZavrseno = poKorisnikuRezultat.rows.reduce(
    (zbroj, r) => zbroj + r.count,
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

// Return the items completed by a specific household member during the
// selected period. Filtering by req.householdId prevents access to another
// household's data.
statistikaRoute.get("/korisnik/:id", async (req, res) => {
  const razdoblje = req.query.razdoblje === "mjesec" ? "mjesec" : "tjedan";
  const jedinica = razdoblje === "mjesec" ? "month" : "week";

  const rezultat = await pool.query(
    `SELECT id, item, item_date, colour, completed_at
     FROM items
     WHERE household_id = $1
       AND completed_id = $2
       AND completed_at >= date_trunc($3, NOW())
     ORDER BY completed_at DESC`,
    [req.householdId, req.params.id, jedinica],
  );

  res.json(rezultat.rows);
});

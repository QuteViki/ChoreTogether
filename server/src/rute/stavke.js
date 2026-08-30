import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const stavkeRoute = Router();
stavkeRoute.use(trebaPrijavu, trebaKucanstvo);

const OKIDACI_KUPOVINA = ["kupovina namirnica", "shopping", "groceries"];

stavkeRoute.get("/", async (req, res) => {
  const rezultat = await pool.query(
    "SELECT * FROM stavke WHERE household_id = $1 ORDER BY datum",
    [req.householdId],
  );
  res.json(rezultat.rows);
});

stavkeRoute.post("/", async (req, res) => {
  const { tip, naziv, datum, boja } = req.body;
  if (!tip || !naziv || !datum) {
    return res.status(400).json({ greska: "tip, naziv i datum su obavezni." });
  }

  const rezultat = await pool.query(
    "INSERT INTO stavke (household_id, tip, naziv, datum, boja, dodao_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [req.householdId, tip, naziv, datum, boja || "blue", req.userId],
  );
  const novaStavka = rezultat.rows[0];

  const nazivZaUsporedbu = naziv.trim().toLowerCase();
  const jeZaKupovinu = OKIDACI_KUPOVINA.some((okidac) =>
    nazivZaUsporedbu.includes(okidac),
  );

  if (tip === "zadatak" && jeZaKupovinu) {
    await pool.query(
      "INSERT INTO popisi_kupovine (household_id, stavka_id, naziv, datum, boja) VALUES ($1, $2, $3, $4, $5)",
      [
        req.householdId,
        novaStavka.id,
        novaStavka.naziv,
        novaStavka.datum,
        novaStavka.boja,
      ],
    );
  }

  res.status(201).json(novaStavka);
});

// Kad se zadatak označi gotovim, bilježi se TKO i KADA (za statistiku).
// Kad se poništi, ti se podaci brišu. Ako se šalje samo "boja" (bez gotovo),
// zavrsio_id/zavrseno_at ostaju netaknuti.
stavkeRoute.patch("/:id", async (req, res) => {
  const { gotovo, boja } = req.body;

  const zavrsioId =
    gotovo === true ? req.userId : gotovo === false ? null : undefined;
  const zavrsenoAt =
    gotovo === true ? new Date() : gotovo === false ? null : undefined;

  const rezultat = await pool.query(
    `UPDATE stavke SET
       gotovo = COALESCE($1, gotovo),
       boja = COALESCE($2, boja),
       zavrsio_id = CASE WHEN $1::boolean IS NULL THEN zavrsio_id ELSE $3 END,
       zavrseno_at = CASE WHEN $1::boolean IS NULL THEN zavrseno_at ELSE $4 END
     WHERE id = $5 AND household_id = $6
     RETURNING *`,
    [gotovo, boja, zavrsioId, zavrsenoAt, req.params.id, req.householdId],
  );
  const stavka = rezultat.rows[0];
  if (!stavka)
    return res.status(404).json({ greska: "Stavka nije pronađena." });

  if (gotovo === true) {
    await pool.query("DELETE FROM popisi_kupovine WHERE stavka_id = $1", [
      stavka.id,
    ]);
  }

  res.json(stavka);
});

stavkeRoute.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM stavke WHERE id = $1 AND household_id = $2", [
    req.params.id,
    req.householdId,
  ]);
  res.status(204).end();
});

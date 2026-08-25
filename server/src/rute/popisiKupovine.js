import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const popisiKupovineRoute = Router();
popisiKupovineRoute.use(trebaPrijavu, trebaKucanstvo);

popisiKupovineRoute.get("/", async (req, res) => {
  const popisi = await pool.query(
    "SELECT * FROM popisi_kupovine WHERE household_id = $1 ORDER BY datum",
    [req.householdId],
  );

  const popisiSaStavkama = await Promise.all(
    popisi.rows.map(async (popis) => {
      const stavke = await pool.query(
        "SELECT * FROM stavke_popisa WHERE popis_id = $1 ORDER BY created_at",
        [popis.id],
      );
      return { ...popis, stavke: stavke.rows };
    }),
  );

  res.json(popisiSaStavkama);
});

// Promjena naziva i/ili boje popisa — ako je popis vezan uz zadatak, boja se
// prenosi i na taj zadatak (da su list i zadatak uvijek iste boje)
popisiKupovineRoute.patch("/:id", async (req, res) => {
  const { naziv, boja } = req.body;

  const rezultat = await pool.query(
    "UPDATE popisi_kupovine SET naziv = COALESCE($1, naziv), boja = COALESCE($2, boja) WHERE id = $3 AND household_id = $4 RETURNING *",
    [naziv, boja, req.params.id, req.householdId],
  );

  if (!rezultat.rows[0])
    return res.status(404).json({ greska: "Popis nije pronađen." });

  const popis = rezultat.rows[0];

  if (boja && popis.stavka_id) {
    await pool.query("UPDATE stavke SET boja = $1 WHERE id = $2", [
      boja,
      popis.stavka_id,
    ]);
  }

  res.json(popis);
});

popisiKupovineRoute.delete("/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM popisi_kupovine WHERE id = $1 AND household_id = $2",
    [req.params.id, req.householdId],
  );
  res.status(204).end();
});

popisiKupovineRoute.post("/:id/stavke", async (req, res) => {
  const { naziv, kolicina } = req.body;
  if (!naziv)
    return res.status(400).json({ greska: "Naziv namirnice je obavezan." });

  const rezultat = await pool.query(
    "INSERT INTO stavke_popisa (popis_id, naziv, kolicina) VALUES ($1, $2, $3) RETURNING *",
    [req.params.id, naziv, kolicina || 1],
  );

  res.status(201).json(rezultat.rows[0]);
});

popisiKupovineRoute.patch("/stavke/:stavkaId", async (req, res) => {
  const { kupljeno } = req.body;

  const rezultat = await pool.query(
    "UPDATE stavke_popisa SET kupljeno = COALESCE($1, kupljeno) WHERE id = $2 RETURNING *",
    [kupljeno, req.params.stavkaId],
  );

  if (!rezultat.rows[0])
    return res.status(404).json({ greska: "Stavka nije pronađena." });
  res.json(rezultat.rows[0]);
});

popisiKupovineRoute.delete("/stavke/:stavkaId", async (req, res) => {
  await pool.query("DELETE FROM stavke_popisa WHERE id = $1", [
    req.params.stavkaId,
  ]);
  res.status(204).end();
});

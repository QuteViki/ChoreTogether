import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const shoppingListsRoute = Router();
shoppingListsRoute.use(trebaPrijavu, trebaKucanstvo);

shoppingListsRoute.get("/", async (req, res) => {
  const popisi = await pool.query(
    `SELECT id, household_id, article_id, list_name, list_colour, list_date,
              created_at
       FROM shopping_lists WHERE household_id = $1 ORDER BY list_date`,
    [req.householdId],
  );

  const popisiSaStavkama = await Promise.all(
    popisi.rows.map(async (popis) => {
      const stavke = await pool.query(
        `SELECT id, list_id, article, quantity, buy, created_at
         FROM shopping_list_items WHERE list_id = $1 ORDER BY created_at`,
        [popis.id],
      );
      return { ...popis, stavke: stavke.rows };
    }),
  );

  res.json(popisiSaStavkama);
});

// Change a list name and/or colour. If the list is linked to an item, pass
// the colour through to that item so both records stay synchronized.
shoppingListsRoute.patch("/:id", async (req, res) => {
  const { list_name, list_colour } = req.body;

  const rezultat = await pool.query(
    `UPDATE shopping_lists
     SET list_name = COALESCE($1, list_name),
       list_colour = COALESCE($2, list_colour)
     WHERE id = $3 AND household_id = $4
         RETURNING id, household_id, article_id, list_name, list_colour,
           list_date, created_at`,
    [list_name, list_colour, req.params.id, req.householdId],
  );

  if (!rezultat.rows[0])
    return res.status(404).json({ greska: "Popis nije pronađen." });

  const popis = rezultat.rows[0];

  if (list_colour && popis.article_id) {
    await pool.query("UPDATE items SET colour = $1 WHERE id = $2", [
      list_colour,
      popis.article_id,
    ]);
  }

  res.json(popis);
});

shoppingListsRoute.delete("/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM shopping_lists WHERE id = $1 AND household_id = $2",
    [req.params.id, req.householdId],
  );
  res.status(204).end();
});

shoppingListsRoute.post("/:id/stavke", async (req, res) => {
  const { article, quantity } = req.body;
  if (!article)
    return res.status(400).json({ greska: "Naziv namirnice je obavezan." });

  const rezultat = await pool.query(
    `INSERT INTO shopping_list_items (list_id, article, quantity)
       VALUES ($1, $2, $3)
       RETURNING id, list_id, article, quantity, buy, created_at`,
    [req.params.id, article, quantity || 1],
  );

  res.status(201).json(rezultat.rows[0]);
});

shoppingListsRoute.patch("/stavke/:stavkaId", async (req, res) => {
  const { buy } = req.body;

  const rezultat = await pool.query(
    `UPDATE shopping_list_items
       SET buy = COALESCE($1, buy)
       WHERE id = $2
       RETURNING id, list_id, article, quantity, buy, created_at`,
    [buy, req.params.stavkaId],
  );

  if (!rezultat.rows[0])
    return res.status(404).json({ greska: "Stavka nije pronađena." });
  res.json(rezultat.rows[0]);
});

shoppingListsRoute.delete("/stavke/:stavkaId", async (req, res) => {
  await pool.query("DELETE FROM shopping_list_items WHERE id = $1", [
    req.params.stavkaId,
  ]);
  res.status(204).end();
});

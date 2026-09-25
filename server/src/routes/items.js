import { Router } from "express";
import { pool } from "../db.js";
import { trebaPrijavu, trebaKucanstvo } from "./middleware.js";

export const stavkeRoute = Router();
stavkeRoute.use(trebaPrijavu, trebaKucanstvo);

const OKIDACI_KUPOVINA = ["kupovina namirnica", "shopping", "groceries"]; // Triggers for creating a shopping list.

stavkeRoute.get("/", async (req, res) => {
  const rezultat = await pool.query(
    `SELECT id, household_id, item_type, item, item_date, completed,
          created_at, colour, completed_id, completed_at, added_id,
          assigned_id
     FROM items WHERE household_id = $1 ORDER BY item_date`,
    [req.householdId],
  );
  res.json(rezultat.rows);
});
stavkeRoute.post("/", async (req, res) => {
  const { item_type, item, item_date, colour, assigned_id } = req.body;
  if (!item_type || !item || !item_date) {
    return res.status(400).json({ greska: "tip, naziv i datum su obavezni." });
  }
  const rezultat = await pool.query(
    `INSERT INTO items
       (household_id, item_type, item, item_date, colour, added_id, assigned_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, household_id, item_type, item, item_date, completed,
               created_at, colour, completed_id, completed_at, added_id,
               assigned_id`,
    [
      req.householdId,
      item_type,
      item,
      item_date,
      colour || "blue",
      req.userId,
      assigned_id || null,
    ],
  );
  const novaStavka = rezultat.rows[0];
  const nazivZaUsporedbu = item.trim().toLowerCase();
  const jeZaKupovinu = OKIDACI_KUPOVINA.some((okidac) =>
    nazivZaUsporedbu.includes(okidac),
  );
  if (item_type === "zadatak" && jeZaKupovinu) {
    await pool.query(
      `INSERT INTO shopping_lists
         (household_id, article_id, list_name, list_date, list_colour)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.householdId,
        novaStavka.id,
        novaStavka.item,
        novaStavka.item_date,
        novaStavka.colour,
      ],
    );
  }
  res.status(201).json(novaStavka);
});

// When an item is completed, record who completed it and when for statistics.
// When it is uncompleted, clear those values. A colour-only update leaves
// completion data unchanged.
stavkeRoute.patch("/:id", async (req, res) => {
  const { completed, colour } = req.body;

  const zavrsioId =
    completed === true ? req.userId : completed === false ? null : undefined;
  const zavrsenoAt =
    completed === true ? new Date() : completed === false ? null : undefined;

  const rezultat = await pool.query(
    `UPDATE items SET
      completed = COALESCE($1, completed),
      colour = COALESCE($2, colour),
       completed_id = CASE WHEN $1::boolean IS NULL THEN completed_id ELSE $3 END,
       completed_at = CASE WHEN $1::boolean IS NULL THEN completed_at ELSE $4 END
     WHERE id = $5 AND household_id = $6
    RETURNING id, household_id, item_type, item, item_date, completed,
        created_at, colour, completed_id, completed_at, added_id,
        assigned_id`,
    [completed, colour, zavrsioId, zavrsenoAt, req.params.id, req.householdId],
  );
  const stavka = rezultat.rows[0];
  if (!stavka)
    return res.status(404).json({ greska: "Stavka nije pronađena." });

  if (completed === true) {
    await pool.query("DELETE FROM shopping_lists WHERE article_id = $1", [
      stavka.id,
    ]);
  }

  res.json(stavka);
});

stavkeRoute.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM items WHERE id = $1 AND household_id = $2", [
    req.params.id,
    req.householdId,
  ]);
  res.status(204).end();
});

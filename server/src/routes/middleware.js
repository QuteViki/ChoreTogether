import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "privremena-tajna-promijeni-me";

export function trebaPrijavu(req, res, next) {
  const zaglavlje = req.headers.authorization || "";
  const token = zaglavlje.startsWith("Bearer ") ? zaglavlje.slice(7) : null;

  if (!token) {
    return res.status(401).json({ greska: "Niste prijavljeni." });
  }

  try {
    const podaci = jwt.verify(token, JWT_SECRET);
    req.userId = podaci.userId;
    next();
  } catch {
    res.status(401).json({ greska: "Token nije važeći ili je istekao." });
  }
}

export async function trebaKucanstvo(req, res, next) {
  const rezultat = await pool.query(
    "SELECT household_id FROM users WHERE id = $1",
    [req.userId],
  );
  const householdId = rezultat.rows[0]?.household_id;

  if (!householdId) {
    return res
      .status(400)
      .json({ greska: "Prvo se morate pridružiti ili stvoriti kućanstvo." });
  }

  req.householdId = householdId;
  next();
}

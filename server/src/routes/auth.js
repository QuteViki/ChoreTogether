import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { trebaPrijavu } from "./middleware.js";
import { posaljiEmailZaResetLozinke } from "../services/mail.js";

export const authRoute = Router();
const TAJNI_KLJUC = process.env.JWT_SECRET || "tajna_razvojna_vrijednost";

authRoute.post("/registracija", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ greska: "Korisničko ime, email i lozinka su obavezni." });
  }
  try {
    const postoji = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (postoji.rows.length > 0) {
      return res
        .status(409)
        .json({ greska: "Korisnik s tim emailom već postoji." });
    }
    const hash = await bcrypt.hash(password, 10);
    const rezultat = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
      RETURNING id, username, email, household_id, created_at,
           profile_picture, theme, theme_colour, app_language`,
      [username, email, hash],
    );
    const korisnik = rezultat.rows[0];
    const token = jwt.sign({ userId: korisnik.id }, TAJNI_KLJUC, {
      expiresIn: "30d",
    });
    res.status(201).json({ token, korisnik });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.post("/prijava", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ greska: "Email i lozinka su obavezni." });
  }
  try {
    const rezultat = await pool.query(
      `SELECT id, username, email, password_hash, household_id, created_at,
              profile_picture, theme, theme_colour, app_language
       FROM users WHERE email = $1`,
      [email],
    );
    const korisnik = rezultat.rows[0];
    if (!korisnik) {
      return res.status(401).json({ greska: "Pogrešan email ili lozinka." });
    }
    const ispravno = await bcrypt.compare(password, korisnik.password_hash);
    if (!ispravno) {
      return res.status(401).json({ greska: "Pogrešan email ili lozinka." });
    }
    delete korisnik.password_hash;
    const token = jwt.sign({ userId: korisnik.id }, TAJNI_KLJUC, {
      expiresIn: "30d",
    });
    res.json({ token, korisnik });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.post("/zaboravljena-lozinka", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ greska: "Email je obavezan." });
  }
  try {
    const rezultat = await pool.query(
      "SELECT id, username FROM users WHERE email = $1",
      [email],
    );
    const korisnik = rezultat.rows[0];

    if (korisnik) {
      const sirovi = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(sirovi).digest("hex");
      const istice = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query(
        "UPDATE users SET reset_token = $1, reset_token_expire = $2 WHERE id = $3",
        [hash, istice, korisnik.id],
      );

      const frontendUrl =
        process.env.FRONTEND_URL || "https://choretogether.space";
      const link = `${frontendUrl}/auth/reset-lozinke?token=${sirovi}`;

      await posaljiEmailZaResetLozinke(email, korisnik.username, link);
    }

    res.json({
      poruka:
        "Ako postoji račun s tim emailom, poslali smo poveznicu za resetiranje lozinke.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.post("/resetiraj-lozinku", async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) {
    return res
      .status(400)
      .json({ greska: "Token i nova lozinka su obavezni." });
  }
  try {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const rezultat = await pool.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expire > NOW()",
      [hash],
    );
    const korisnik = rezultat.rows[0];
    if (!korisnik) {
      return res
        .status(400)
        .json({ greska: "Poveznica nije valjana ili je istekla." });
    }
    const noviHash = await bcrypt.hash(new_password, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expire = NULL WHERE id = $2",
      [noviHash, korisnik.id],
    );
    res.json({ poruka: "Lozinka je uspješno promijenjena." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/ime", trebaPrijavu, async (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ greska: "Ime ne smije biti prazno." });
  }
  try {
    const rezultat = await pool.query(
      `UPDATE users SET username = $1 WHERE id = $2
       RETURNING id, username, email, household_id, created_at,
             profile_picture, theme, theme_colour, app_language`,
      [username.trim(), req.userId],
    );
    res.json(rezultat.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/postavke", trebaPrijavu, async (req, res) => {
  const { theme, theme_colour, app_language } = req.body;
  try {
    const rezultat = await pool.query(
      `UPDATE users SET
         theme = COALESCE($1, theme),
         theme_colour = COALESCE($2, theme_colour),
         app_language = COALESCE($3, app_language)
       WHERE id = $4
       RETURNING id, username, email, household_id, created_at,
                 profile_picture, theme, theme_colour, app_language`,
      [theme, theme_colour, app_language, req.userId],
    );
    res.json(rezultat.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/lozinka", trebaPrijavu, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ greska: "Obje lozinke su obavezne." });
  }
  try {
    const rezultat = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.userId],
    );
    const ispravno = await bcrypt.compare(
      current_password,
      rezultat.rows[0].password_hash,
    );
    if (!ispravno) {
      return res.status(401).json({ greska: "Stara lozinka nije ispravna." });
    }
    const noviHash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      noviHash,
      req.userId,
    ]);
    res.json({ poruka: "Lozinka je uspješno promijenjena." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/profilna", trebaPrijavu, async (req, res) => {
  const { profile_picture } = req.body;
  try {
    const rezultat = await pool.query(
      `UPDATE users SET profile_picture = $1 WHERE id = $2
       RETURNING id, username, email, household_id, created_at,
             profile_picture, theme, theme_colour, app_language`,
      [profile_picture, req.userId],
    );
    res.json(rezultat.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.delete("/profil", trebaPrijavu, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.userId]);
    res.json({ poruka: "Profil je obrisan." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

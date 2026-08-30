import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { trebaPrijavu } from "./middleware.js";
import { posaljiEmailZaResetLozinke } from "../servisi/mail.js";

export const authRoute = Router();
const TAJNI_KLJUC = process.env.JWT_SECRET || "tajna_razvojna_vrijednost";

authRoute.post("/registracija", async (req, res) => {
  const { ime, email, lozinka } = req.body;
  if (!ime || !email || !lozinka) {
    return res
      .status(400)
      .json({ greska: "Ime, email i lozinka su obavezni." });
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
    const hash = await bcrypt.hash(lozinka, 10);
    const rezultat = await pool.query(
      `INSERT INTO users (ime, email, lozinka_hash)
       VALUES ($1, $2, $3)
       RETURNING id, ime, email, profil_slika, tema_nacin, tema_boja, jezik`,
      [ime, email, hash],
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
  const { email, lozinka } = req.body;
  if (!email || !lozinka) {
    return res.status(400).json({ greska: "Email i lozinka su obavezni." });
  }
  try {
    const rezultat = await pool.query(
      `SELECT id, ime, email, lozinka_hash, household_id, profil_slika, tema_nacin, tema_boja, jezik
       FROM users WHERE email = $1`,
      [email],
    );
    const korisnik = rezultat.rows[0];
    if (!korisnik) {
      return res.status(401).json({ greska: "Pogrešan email ili lozinka." });
    }
    const ispravno = await bcrypt.compare(lozinka, korisnik.lozinka_hash);
    if (!ispravno) {
      return res.status(401).json({ greska: "Pogrešan email ili lozinka." });
    }
    delete korisnik.lozinka_hash;
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
      "SELECT id, ime FROM users WHERE email = $1",
      [email],
    );
    const korisnik = rezultat.rows[0];

    if (korisnik) {
      const sirovi = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(sirovi).digest("hex");
      const istice = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query(
        "UPDATE users SET reset_token = $1, reset_token_istice = $2 WHERE id = $3",
        [hash, istice, korisnik.id],
      );

      const frontendUrl =
        process.env.FRONTEND_URL || "https://choretogether.space";
      const link = `${frontendUrl}/auth/reset-lozinke?token=${sirovi}`;

      await posaljiEmailZaResetLozinke(email, korisnik.ime, link);
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
  const { token, novaLozinka } = req.body;
  if (!token || !novaLozinka) {
    return res
      .status(400)
      .json({ greska: "Token i nova lozinka su obavezni." });
  }
  try {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const rezultat = await pool.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_istice > NOW()",
      [hash],
    );
    const korisnik = rezultat.rows[0];
    if (!korisnik) {
      return res
        .status(400)
        .json({ greska: "Poveznica nije valjana ili je istekla." });
    }
    const noviHash = await bcrypt.hash(novaLozinka, 10);
    await pool.query(
      "UPDATE users SET lozinka_hash = $1, reset_token = NULL, reset_token_istice = NULL WHERE id = $2",
      [noviHash, korisnik.id],
    );
    res.json({ poruka: "Lozinka je uspješno promijenjena." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/ime", trebaPrijavu, async (req, res) => {
  const { ime } = req.body;
  if (!ime || !ime.trim()) {
    return res.status(400).json({ greska: "Ime ne smije biti prazno." });
  }
  try {
    const rezultat = await pool.query(
      "UPDATE users SET ime = $1 WHERE id = $2 RETURNING id, ime, email, profil_slika, tema_nacin, tema_boja, jezik",
      [ime.trim(), req.userId],
    );
    res.json(rezultat.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/postavke", trebaPrijavu, async (req, res) => {
  const { tema_nacin, tema_boja, jezik } = req.body;
  try {
    const rezultat = await pool.query(
      `UPDATE users SET
         tema_nacin = COALESCE($1, tema_nacin),
         tema_boja = COALESCE($2, tema_boja),
         jezik = COALESCE($3, jezik)
       WHERE id = $4
       RETURNING id, ime, email, profil_slika, tema_nacin, tema_boja, jezik`,
      [tema_nacin, tema_boja, jezik, req.userId],
    );
    res.json(rezultat.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ greska: "Greška na serveru." });
  }
});

authRoute.patch("/lozinka", trebaPrijavu, async (req, res) => {
  const { staraLozinka, novaLozinka } = req.body;
  if (!staraLozinka || !novaLozinka) {
    return res.status(400).json({ greska: "Obje lozinke su obavezne." });
  }
  try {
    const rezultat = await pool.query(
      "SELECT lozinka_hash FROM users WHERE id = $1",
      [req.userId],
    );
    const ispravno = await bcrypt.compare(
      staraLozinka,
      rezultat.rows[0].lozinka_hash,
    );
    if (!ispravno) {
      return res.status(401).json({ greska: "Stara lozinka nije ispravna." });
    }
    const noviHash = await bcrypt.hash(novaLozinka, 10);
    await pool.query("UPDATE users SET lozinka_hash = $1 WHERE id = $2", [
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
  const { slika } = req.body;
  try {
    const rezultat = await pool.query(
      "UPDATE users SET profil_slika = $1 WHERE id = $2 RETURNING id, ime, email, profil_slika, tema_nacin, tema_boja, jezik",
      [slika, req.userId],
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

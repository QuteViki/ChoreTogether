import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { authRoute } from "./rute/auth.js";
import { householdsRoute } from "./rute/households.js";
import { stavkeRoute } from "./rute/stavke.js";
import { popisiKupovineRoute } from "./rute/popisiKupovine.js";
import { statistikaRoute } from "./rute/statistika.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://choretogether.space",
      "https://www.choretogether.space",
      "http://localhost:9000",
    ],
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/auth", authRoute);
app.use("/households", householdsRoute);
app.use("/stavke", stavkeRoute);
app.use("/popisi-kupovine", popisiKupovineRoute);
app.use("/statistika", statistikaRoute);
app.get("/health", async (req, res) => {
  const rezultat = await pool.query("SELECT NOW()");
  res.json({ status: "ok", vrijemeBaze: rezultat.rows[0].now });
});

app.listen(PORT, () => {
  console.log(`Server sluša na http://localhost:${PORT}`);
});

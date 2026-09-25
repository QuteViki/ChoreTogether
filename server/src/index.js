import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { authRoute } from "./routes/auth.js";
import { householdsRoute } from "./routes/households.js";
import { stavkeRoute } from "./routes/items.js";
import { shoppingListsRoute } from "./routes/shoppingLists.js";
import { statistikaRoute } from "./routes/statistics.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://choretogether.space",
      "https://www.choretogether.space",
      "http://localhost:9000",
      "capacitor://localhost",
      "https://localhost",
    ],
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/auth", authRoute);
app.use("/households", householdsRoute);
app.use("/stavke", stavkeRoute);
app.use("/popisi-kupovine", shoppingListsRoute);
app.use("/statistika", statistikaRoute);
app.get("/health", async (req, res) => {
  const rezultat = await pool.query("SELECT NOW()");
  res.json({ status: "ok", vrijemeBaze: rezultat.rows[0].now });
});

app.listen(PORT, () => {
  console.log(`Server sluša na http://localhost:${PORT}`);
});

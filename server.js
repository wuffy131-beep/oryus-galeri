import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const { Pool } = pg;
const app = express();

// PostgreSQL bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static("public"));

// Mesaj tablosu oluştur (ilk çalışmada)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        msg TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Messages tablosu hazır!");
  } catch (err) {
    console.error("Tablo oluşturulamadı:", err);
  }
})();

// Mesaj kaydetme API'si
app.post("/api/message", async (req, res) => {
  const { name, msg } = req.body;
  if (!name || !msg) return res.status(400).send("Eksik veri");

  try {
    await pool.query("INSERT INTO messages (name, msg) VALUES ($1, $2)", [name, msg]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Veritabanı hatası:", err);
    res.status(500).send("DB hatası");
  }
});

// Ana sayfa (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`));

import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import cors from "cors";

dotenv.config();
const { Pool } = pkg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());
app.use(express.static(".")); // index.html için

// tabloyu oluştur (ilk çalıştırmada)
const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      msg TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
createTable();

// Mesaj kaydet
app.post("/api/message", async (req, res) => {
  const { name, msg } = req.body;
  if (!name || !msg) return res.status(400).send("Eksik veri");
  try {
    await pool.query("INSERT INTO messages (name, msg) VALUES ($1, $2)", [name, msg]);
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

// Mesajları getir
app.get("/api/messages", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM messages ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Sunucu http://localhost:${port}`));

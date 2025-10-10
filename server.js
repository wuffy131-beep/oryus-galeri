import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const { Pool } = pg;
const app = express();
app.use(express.json());
app.use(express.static("."));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Tablo oluştur
await pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    msg TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Mesaj ekle
app.post("/api/message", async (req, res) => {
  const { name, msg } = req.body;
  try {
    await pool.query("INSERT INTO messages (name, msg) VALUES ($1, $2)", [name, msg]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB hatası");
  }
});

// Mesajları getir
app.get("/api/messages", async (req, res) => {
  try {
    const result = await pool.query("SELECT name, msg FROM messages ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("DB hatası");
  }
});

app.listen(3000, () => console.log("🚀 http://localhost:3000"));

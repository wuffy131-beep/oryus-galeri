import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, msg } = req.body;
    if (!name || !msg) return res.status(400).json({ error: "Eksik veri" });

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          msg TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query("INSERT INTO messages (name, msg) VALUES ($1, $2)", [name, msg]);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

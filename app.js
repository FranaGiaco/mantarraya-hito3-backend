import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { authRequired, JWT_SECRET } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Mantarraya backend vivo 🐙"));

app.get("/users", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name, email, role FROM users");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar users" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validación mínima para tests (opcional pero útil)
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email, role",
      [name, email, hashed]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    // manejo elegante de email duplicado
    if (error?.code === "23505") {
      return res.status(409).json({ error: "Email ya registrado" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Faltan campos" });

    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email=$1",
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
});

export default app;

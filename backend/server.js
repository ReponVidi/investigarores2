// server.js (VERSION CORREGIDA)
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from 'express-rate-limit';
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURACIONES BÁSICAS
app.use(cors({ origin: 'http://localhost:4000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || "unasecretosegura123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const createUserLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// ARCHIVOS ESTÁTICOS Y RUTAS DE PÁGINAS
app.use("/ppricipal", express.static(path.join(__dirname, "../frontend/ppricipal")));
app.use("/login", express.static(path.join(__dirname, "../frontend/inicio_sesion")));
app.use("/registro", express.static(path.join(__dirname, "../frontend/registro")));
app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));
// Agrega esto junto a los otros app.use de estáticos
app.use("/usuario", express.static(path.join(__dirname, "../frontend/usuario")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/ppricipal/pprincipal.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../frontend/inicio_sesion/inicio.html")));
app.get("/registro", (req, res) => res.sendFile(path.join(__dirname, "../frontend/registro/registros.html")));

// Endpoint para obtener los datos del usuario logueado
app.get("/api/user-profile", (req, res) => {
    if (req.session.userId) {
        // Si hay sesión, enviamos el nombre que guardamos al hacer login
        res.json({
            success: true,
            username: req.session.username || "Usuario"
        });
    } else {
        res.status(401).json({ success: false, error: "No autorizado" });
    }
});
// ==========================================
// RUTA 1: LOGIN (POST) - INDEPENDIENTE
// ==========================================
app.post("/login", authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscamos id, login Y la columna admin
        const userRes = await pool.query(
            'SELECT id, login, firstname, admin FROM public.users WHERE login = $1',
            [username]
        );

        if (userRes.rows.length === 0) return res.status(401).json({ success: false, error: "Usuario no encontrado." });

        const user = userRes.rows[0];
        const passRes = await pool.query('SELECT hashed_password FROM public.user_passwords WHERE user_id = $1', [user.id]);

        if (passRes.rows.length === 0) return res.status(401).json({ success: false, error: "Sin contraseña." });

        const validPassword = await bcrypt.compare(password, passRes.rows[0].hashed_password);
        if (!validPassword) return res.status(401).json({ success: false, error: "Contraseña incorrecta." });

        // 2. Guardamos en la sesión si es admin o no
        req.session.userId = user.id;
        req.session.username = user.login;
        req.session.isAdmin = user.admin; // true o false según la DB

        console.log(`✅ Login: ${user.login} | Admin: ${user.admin}`);

        // 3. Enviamos la redirección correcta según el rol
        const destination = user.admin ? "/admin/admin.html" : "/usuario/usuario.html";

        return res.json({
            success: true,
            redirect: destination
        });

    } catch (error) {
        console.error("❌ Error en Login:", error.message);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

// ==========================================
// RUTA 2: REGISTRO (POST) - INDEPENDIENTE
// ==========================================
app.post("/create-user", createUserLimiter, async (req, res) => {
    const client = await pool.connect();
    try {
        const { login, firstName, lastName, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ error: "Las contraseñas no coinciden." });

        await client.query('BEGIN');
        const userRes = await client.query(
            `INSERT INTO public.users (login, firstname, lastname, mail, admin, status, language, type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, false, 1, 'es', 'User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
            [login, firstName, lastName, email]
        );

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await client.query(
            `INSERT INTO public.user_passwords (user_id, hashed_password, salt, created_at, updated_at, type)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'UserPassword::Internal')`,
            [userRes.rows[0].id, hashedPassword, salt]
        );

        await client.query('COMMIT');
        console.log(`✅ Registro exitoso: ${login}`);
        res.status(201).json({ success: true, message: "Usuario creado", redirect: "/usuario/usuario.html" });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error("❌ Error en Registro:", error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// MANEJO 404
app.use((req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));

app.listen(4000, () => console.log(`🚀 Servidor en puerto 4000`));
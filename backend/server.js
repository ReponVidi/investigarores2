// server.js (VERSION CORREGIDA)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from 'express-rate-limit';
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import bcrypt from "bcrypt";

pool.on('connect', (client) => {
    client.query('SET search_path TO core, public');
});

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURACIONES BÁSICAS
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
}));
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
// server.js - ACTUALIZAR ESTE ENDPOINT
app.get("/api/user-profile", (req, res) => {
    if (req.session.userId) {
        res.json({
            success: true,
            userId: req.session.userId,
            username: req.session.username,
            isAdmin: req.session.isAdmin || false // <--- VITAL: Enviar el rol
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
        const { username, password } = req.body; // Este 'username' viene del input del formulario

        // 1. Buscamos al usuario por su 'username' O por su 'email'
        // Usamos las columnas exactas de tu captura: username, email, password_hash, rol_id
        const userRes = await pool.query(
            'SELECT id, nombre, username, email, password_hash, rol_id FROM core.usuarios WHERE username = $1 OR email = $1',
            [username]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, error: "Credenciales no encontradas." });
        }

        const user = userRes.rows[0];
        console.log("Contraseña recibida:", password);
        console.log("Hash en DB:", user.password_hash);
        // 2. Comparamos la contraseña con el hash de la columna 'password_hash'
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ success: false, error: "Contraseña incorrecta." });
        }

        // 3. Verificamos el Rol (Según tu captura, el ID 3 es Administrador)
        const isAdmin = (user.rol_id === 3);

        // 4. Guardamos datos esenciales en la sesión
        req.session.userId = user.id;
        req.session.username = user.username; // Guardamos el login corto
        req.session.nombreReal = user.nombre; // El nombre completo (ej: "carmari reyes")
        req.session.isAdmin = isAdmin;

        console.log(`✅ Sesión iniciada: ${user.username} | Rol ID: ${user.rol_id} (Admin: ${isAdmin})`);

        // 5. Redirección lógica
        const destination = isAdmin ? "/admin/admin.html" : "/usuario/usuario.html";

        return res.json({
            success: true,
            redirect: destination
        });

    } catch (error) {
        console.error("❌ Error en el proceso de Login:", error.message);
        res.status(500).json({ success: false, error: "Error interno del servidor." });
    }
});


app.post("/create-user", createUserLimiter, async (req, res) => {
    const client = await pool.connect();
    try {
        // Desestructuramos usando 'username' (que enviamos desde el JS corregido)
        const { username, firstName, lastName, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: "Las contraseñas no coinciden." });
        }

        await client.query('BEGIN');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Nombre completo para la columna 'nombre'
        const nombreCompleto = `${firstName} ${lastName}`;

        // Inserción en core.usuarios
        // Columnas según tu imagen: id (serial), nombre, email, password_hash, rol_id, username
        const query = `
            INSERT INTO core.usuarios (nombre, email, password_hash, rol_id, username)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username;
        `;

        const values = [nombreCompleto, email, hashedPassword, 1, username];
        const userRes = await client.query(query, values);

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            username: userRes.rows[0].username
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error("❌ Error:", error.message);

        let msg = "Error en el servidor";
        if (error.message.includes('unique constraint')) {
            msg = "El nombre de usuario o correo ya existen.";
        }
        res.status(500).json({ success: false, error: msg });
    } finally {
        client.release();
    }
});
// ... (Todo tu código de /create-user arriba)

// ==========================================
// RUTA 3: GESTIÓN DE PROYECTOS UNEFA (NUEVA)
// ==========================================
// REGISTRO DE USUARIOS
app.post('/usuarios/register', async (req, res) => {
    const { nombre, email, password, rol_id } = req.body; // Datos que vienen del frontend

    try {
        const query = `
            INSERT INTO core.usuarios (nombre, email, password_hash, rol_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email;
        `;

        // Los valores deben coincidir EXACTAMENTE con los $1, $2, $3, $4
        const values = [nombre, email, password, rol_id || 1];
        const result = await pool.query(query, values);

        console.log(`✅ Usuario registrado: ${nombre}`);
        res.json({ exito: true, usuario: result.rows[0] });

    } catch (error) {
        console.error("❌ Error BD:", error.message);
        res.status(500).json({ exito: false, error: error.message });
    }
});

// REGISTRO DE PROYECTOS
app.post('/projects/create', async (req, res) => {
    const { nombre, identificador, descripcion, responsable, fecha_inicio, fecha_fin } = req.body;

    try {
        const query = `
            INSERT INTO core.proyectos_unefa 
            (nombre, identificador, descripcion, responsable, fecha_inicio, fecha_fin, author_id, estatus_id, carrera_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        // Debes completar los campos obligatorios (IDs) que pide tu nueva base de datos
        const values = [
            nombre,
            identificador,
            descripcion,
            responsable,
            fecha_inicio,
            fecha_fin,
            1, // author_id (Carmen)
            1, // estatus_id
            1  // carrera_id
        ];

        const result = await pool.query(query, values);
        res.json({ exito: true, proyecto: result.rows[0] });

    } catch (error) {
        console.error("❌ Error en Proyecto:", error.message);
        res.status(500).json({ exito: false, error: error.message });
    }
});

// ==========================================
// RUTA DE CIERRE DE SESIÓN (Faltante)
// ==========================================
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al destruir la sesión:", err);
            return res.status(500).send("No se pudo cerrar la sesión");
        }
        res.clearCookie('connect.sid'); // Limpia la cookie del navegador
        res.redirect("/login"); // Redirige al login de forma limpia
    });
});

// MANEJO 404
app.use((req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));

app.listen(4000, '0.0.0.0', () => console.log(`🚀 Servidor listo en el puerto 4000`));

//Añadir estas rutas para el esquema CORE

// Endpoint para obtener los logs de una tabla específica del esquema core
app.get('/api/core/audit/:instruccion', async (req, res) => {
    const { instruccion } = req.params;

    // Lista blanca de tablas permitidas por seguridad (evitar SQL Injection)
    const tablasCore = [
        'registrar_proyecto',
        'actualizar_proyecto',
        'eliminar_proyecto',
        'registrar_usuario',
        'eliminar_usuario',
        'guardar_proyecto'
    ];

    if (!tablasCore.includes(instruccion)) {
        return res.status(400).json({ success: false, error: "Instrucción no válida o tabla no encontrada." });
    }

    try {
        // Consultamos al esquema 'core' específicamente
        // Nota: Asegúrate de que las columnas coincidan con las de tu SQL (id, fecha_hora, usuario, detalles)
        const query = `SELECT * FROM core.${instruccion} ORDER BY fecha_hora DESC LIMIT 100`;
        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error(`Error al consultar core.${instruccion}:`, error.message);
        res.status(500).json({ success: false, error: "Error en el servidor al extraer datos de auditoría." });
    }
});
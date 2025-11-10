// server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

import session from "express-session";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Necesario para obtener rutas absolutas correctamente en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
app.use(express.json());
app.use(cors());

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "unasecretosegura123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);


//Aqui Habian Variables de Entornos no necesarias


// Servir archivos estáticos del frontend
app.use("/inicio_sesion", express.static(path.join(__dirname, "../frontend/inicio_sesion")));
app.use(express.static(path.join(__dirname, "../frontend/ppricipal")));
app.use(express.static(path.join(__dirname, "../frontend")));



// Ruta raíz (home) -> devuelve la página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/ppricipal/pprincipal.html"));
});

app.get("/inicio_sesion", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/inicio_sesion/inicio.html"));
});



// Ruta de redirección intermedia tras el logout de OpenProject
app.get("/post_logout_principal", (req, res) => {
    // URL de destino final: Tu página principal
    const finalURL = 'http://localhost:4000/ppricipal/pprincipal.html'; 
    
    // El script de JavaScript obliga al navegador a redirigirse inmediatamente
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cerrando Sesión...</title>
            <script>
                // OBLIGA a la redirección a tu página principal
                window.location.href = '${finalURL}';
            </script>
        </head>
        <body>
            <p>Sesión cerrada con éxito. Redirigiendo...</p>
        </body>
        </html>
    `);
});



// RUTA DE AUTENTICACIÓN
app.use("/auth", authRoutes);



// Ruta para crear usuario en OpenProject
app.post("/create-user", async (req, res) => {
  try {
    const { login, firstName, lastName, email, password } = req.body;

    // Validación básica
    if (!login || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Construir el payload
    const userPayload = {
      _type: "User",
      login,
      firstName,
      lastName,
      email,
      password,
      status: "active",
    };

    // Autenticación con API key
    const authHeader = `Basic ${Buffer.from(`apikey:${API_KEY}`).toString("base64")}`;


    // Petición a OpenProject
    const response = await axios.post(`${OPENPROJECT_URL}/api/v3/users`, userPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      timeout: 10000, // seguridad
    });

    
    // Éxito
    return res.status(201).json({
      message: "Usuario creado exitosamente en OpenProject.",
      user: response.data,
    });

  } catch (error) {
    console.error("Error al crear usuario:", error.response?.data || error.message);

    const status = error.response?.status || 500;
    const msg =
      error.response?.data?.message ||
      "No se pudo crear el usuario. Verifica la configuración o la API key.";

    return res.status(status).json({ error: msg });
  }
});

// RUTA PARA TEST
//app.get("/", (req, res) => {
  //res.send("Servidor backend OpenProject activo");
//});


// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

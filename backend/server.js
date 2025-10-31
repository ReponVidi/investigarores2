// server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// Configuración
app.use(express.json());
app.use(cors());

const OPENPROJECT_URL = process.env.OPENPROJECT_URL;
const API_KEY = process.env.OPENPROJECT_API_KEY;

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

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en puerto ${PORT}`);
});

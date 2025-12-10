// server.js
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

dotenv.config();
const app = express();

// Necesario para obtener rutas absolutas correctamente en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables de entorno
const OPENPROJECT_URL = process.env.OPENPROJECT_URL;
const API_KEY = process.env.OPENPROJECT_API_KEY;

// Verificar variables críticas
if (!OPENPROJECT_URL) {
  console.error("❌ ERROR: OPENPROJECT_URL no está definida en .env");
  process.exit(1);
}
if (!API_KEY) {
  console.warn("⚠️ ADVERTENCIA: OPENPROJECT_API_KEY no está definida. La creación de usuarios fallará.");
}

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:4000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configuración
app.use(express.json());
app.use(cookieParser());

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "unasecretosegura123",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
  })
);

// Rate limiting para creación de usuarios
const createUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 registros por IP
  message: { 
    error: "Demasiados intentos de registro. Por favor, espera 15 minutos.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiting para autenticación OAuth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 intentos por IP
  message: { 
    error: "Demasiados intentos de autenticación. Por favor, espera.",
    code: "AUTH_RATE_LIMIT"
  }
});

// Servir archivos estáticos del frontend
app.use("/inicio_sesion", express.static(path.join(__dirname, "../frontend/inicio_sesion")));
app.use(express.static(path.join(__dirname, "../frontend/ppricipal")));
app.use(express.static(path.join(__dirname, "../frontend/usuario")));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));

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

// RUTAS DE AUTENTICACIÓN
app.use("/auth", authLimiter, authRoutes);

// RUTA PARA PROYECTOS
app.use("/projects", projectRoutes);

// Ruta para crear usuario en OpenProject (MEJORADA)
app.post("/create-user", createUserLimiter, async (req, res) => {
  try {
    const { login, firstName, lastName, email, password, confirmPassword } = req.body;

    // 1. VALIDACIÓN MEJORADA
    if (!login || !firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        error: "Todos los campos son obligatorios.",
        code: "MISSING_FIELDS"
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        error: "Las contraseñas no coinciden.",
        code: "PASSWORD_MISMATCH"
      });
    }

    // Validar fortaleza de contraseña
    if (password.length < 10) {
      return res.status(400).json({ 
        success: false,
        error: "La contraseña debe tener al menos 10 caracteres.",
        code: "WEAK_PASSWORD"
      });
    }

    // Validar formato email - CUALQUIER email válido (sin restricción de dominio)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Formato de email inválido. Debe ser un email válido (ejemplo@gmail.com).",
        code: "INVALID_EMAIL"
      });
    }

    // 2. Construir payload para OpenProject
    const userPayload = {
      _type: "User",
      login,
      firstName,
      lastName,
      email,
      password,
      status: "active",
    };

    // 3. Autenticación con API key
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Error de configuración del servidor. API key no disponible.",
        code: "SERVER_CONFIG_ERROR"
      });
    }

    const authHeader = `Basic ${Buffer.from(`apikey:${API_KEY}`).toString("base64")}`;

    // 4. Petición a OpenProject
    const response = await axios.post(
      `${OPENPROJECT_URL}/api/v3/users`, 
      userPayload, 
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        timeout: 10000,
      }
    );

    // 5. Éxito - Registrar en consola
    console.log(`✅ Usuario creado exitosamente:`);
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Nombre: ${firstName} ${lastName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Login: ${login}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   IP: ${req.ip}`);
    
    // 6. Retornar éxito
    return res.status(201).json({
      success: true,
      message: "🎉 ¡Usuario creado exitosamente en OpenProject!",
      user: {
        id: response.data.id,
        login: response.data.login,
        email: response.data.email,
        name: `${firstName} ${lastName}`,
        createdAt: new Date().toISOString()
      },
      nextSteps: "Ahora puedes iniciar sesión con tus credenciales",
      redirect: "/auth/openproject"
    });

  } catch (error) {
    console.error("❌ Error creando usuario:");
    console.error("   Mensaje:", error.message);
    console.error("   Status:", error.response?.status);
    console.error("   Datos:", error.response?.data);
    console.error("   Timestamp:", new Date().toISOString());
    console.error("   IP:", req.ip);
    
    const status = error.response?.status || 500;
    let errorMessage = "No se pudo crear el usuario. Intenta nuevamente.";
    let errorCode = "UNKNOWN_ERROR";
    let errorDetails = null;
    
    if (error.response?.data) {
      errorDetails = error.response.data;
      
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      if (error.response.data._embedded?.errors) {
        const errors = error.response.data._embedded.errors;
        errorMessage = errors.map(err => err.message).join(", ");
        
        // Códigos específicos de OpenProject
        if (errorMessage.toLowerCase().includes("already exists")) {
          errorCode = "USER_EXISTS";
          errorMessage = "Este usuario ya existe. Intenta con un email o nombre de usuario diferente.";
        } else if (errorMessage.toLowerCase().includes("invalid")) {
          errorCode = "INVALID_DATA";
          errorMessage = "Datos inválidos. Verifica la información ingresada.";
        } else if (errorMessage.toLowerCase().includes("login")) {
          errorCode = "INVALID_LOGIN";
          errorMessage = "Nombre de usuario inválido. Usa solo letras, números y guiones bajos.";
        }
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "No se puede conectar con OpenProject. Verifica que el servidor esté disponible.";
      errorCode = "CONNECTION_ERROR";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Tiempo de espera agotado. El servidor de OpenProject está tardando mucho en responder.";
      errorCode = "TIMEOUT_ERROR";
    }
    
    return res.status(status).json({ 
      success: false,
      error: errorMessage,
      code: errorCode,
      details: errorDetails
    });
  }
});

// Ruta de salud/verificación del servidor
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "OpenProject User Manager",
    version: "1.0.0",
    openproject: {
      url: OPENPROJECT_URL ? "Configurado" : "No configurado",
      api_key: API_KEY ? "Configurado" : "No configurado"
    }
  });
});

// Ruta para obtener información del servidor (solo para admin)
app.get("/server-info", (req, res) => {
  // Verificar si el usuario es administrador
  if (!req.session.user || !req.session.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Acceso denegado. Se requieren permisos de administrador."
    });
  }
  
  res.json({
    success: true,
    server: {
      node_version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development'
    },
    openproject: {
      url: OPENPROJECT_URL,
      api_key_configured: !!API_KEY
    },
    session: {
      active_sessions: req.sessionStore?.length || 0,
      session_id: req.sessionID
    }
  });
});

// Middleware para manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.url}`,
    code: "ROUTE_NOT_FOUND"
  });
});

// Middleware para manejo de errores generales
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Servidor backend escuchando en:
  📍 Local: http://localhost:${PORT}
  📍 Health Check: http://localhost:${PORT}/health
  📍 OpenProject URL: ${OPENPROJECT_URL}
  
  📋 Rutas disponibles:
  - POST /create-user      (Registro de usuarios)
  - GET  /auth/openproject (Inicio de sesión OAuth)
  - POST /projects/create  (Creación de proyectos)
  - GET  /health           (Estado del servidor)
  `);
});

// Manejo elegante de cierre
process.on('SIGTERM', () => {
  console.log('🔄 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente.');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('💥 Error no capturado:', err);
  console.log('🔄 Reiniciando proceso...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada:', reason);
  console.error('   Promesa:', promise);
});
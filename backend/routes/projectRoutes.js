import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.user || !req.session.access_token) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
};

// Ruta para crear proyecto en OpenProject
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { 
      name, 
      identifier, 
      description,
      responsible,
      creator,
      start_date,
      due_date,
      isPublic,
      active
    } = req.body;

    // Validación básica
    if (!name || !identifier) {
      return res.status(400).json({ 
        error: "Nombre e identificador son obligatorios",
        detalles: "El nombre del proyecto y el identificador son campos requeridos"
      });
    }

    // Construir payload MINIMAL para OpenProject API
    const projectPayload = {
      name,
      identifier,
      description: description || `Proyecto creado por: ${responsible || creator || 'Sistema'}`
    };

    // Agregar campos opcionales SOLO si existen
    if (start_date) projectPayload.startDate = start_date;
    if (due_date) projectPayload.dueDate = due_date;
    
    // NO ENVIAR 'status' - OpenProject asignará uno por defecto
    // NO ENVIAR 'public' a menos que sea explícitamente necesario
    // NO ENVIAR 'active' - por defecto es true

    console.log("📤 Payload MINIMAL a OpenProject:", projectPayload);

    // Usar el token OAuth del usuario
    const access_token = req.session.access_token;
    
    const response = await axios.post(
      `${process.env.OPENPROJECT_URL}/api/v3/projects`,
      projectPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`
        },
        timeout: 10000
      }
    );

    console.log("✅ Proyecto creado exitosamente. ID:", response.data.id);

    // Éxito
    return res.status(201).json({
      message: "Proyecto creado exitosamente en OpenProject",
      proyecto: response.data,
      openproject_url: process.env.OPENPROJECT_URL
    });

  } catch (error) {
    console.error("❌ Error completo al crear proyecto:");
    console.error("Status:", error.response?.status);
    console.error("Datos error:", error.response?.data);
    console.error("Mensaje:", error.message);

    const status = error.response?.status || 500;
    let mensaje = "No se pudo crear el proyecto en OpenProject";
    let detalles = error.message;

    if (error.response?.data) {
      if (error.response.data.message) {
        mensaje = error.response.data.message;
      }
      if (error.response.data._embedded?.errors) {
        detalles = error.response.data._embedded.errors.map(err => err.message).join(", ");
      }
    }

    return res.status(status).json({ 
      error: mensaje,
      detalles: detalles
    });
  }
});

export default router;
import express from "express";
import {
  redirectToOpenProject,
  handleOpenProjectCallback,
  getUserSession,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
};

router.get("/openproject", redirectToOpenProject);
router.get("/openproject/callback", handleOpenProjectCallback);
router.get("/me", requireAuth, getUserSession);
router.get("/logout", logoutUser);

export default router;
import express from "express";
import {
  loginLocal,
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

router.post("/login", loginLocal);
router.get("/me", requireAuth, getUserSession);
router.get("/logout", logoutUser);

export default router;
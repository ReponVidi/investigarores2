import express from "express";
import {
  redirectToOpenProject,
  handleOpenProjectCallback,
  getUserSession,
  logoutUser,
} from "../controllers/authController.js";



const router = express.Router();

router.get("/openproject", redirectToOpenProject);
router.get("/openproject/callback", handleOpenProjectCallback);
router.get("/me", getUserSession);
router.get("/logout", logoutUser);

export default router;

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const openprojectURL = process.env.OPENPROJECT_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;

// Redirige al login de OpenProject
// AÑADIDO: &prompt=login
// Esto fuerza a OpenProject a mostrar la pantalla de login, incluso si tiene 
// una sesión web activa, asegurando que respete el flujo OAuth y el redirect_uri.
export const redirectToOpenProject = (req, res) => {
  const authURL = `${openprojectURL}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&scope=api_v3&prompt=login`;
  res.redirect(authURL);
};

// Callback del login (OpenProject redirige aquí)
export const handleOpenProjectCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Error: Falta el parámetro 'code'.");

  try {
    // Intercambiar el code por un access_token
    const tokenResponse = await axios.post(
      `${openprojectURL}/oauth/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectURI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // Obtener información del usuario autenticado
    const userResponse = await axios.get(`${openprojectURL}/api/v3/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userResponse.data;

    // Guardar sesión temporal
    req.session.user = user;
    req.session.access_token = access_token;

    res.redirect("http://localhost:4000/usuario/usuario.html"); // Frontend
  } catch (error) {
    console.error("❌ Error autenticando:", error.message);
    res.status(500).send("Error autenticando con OpenProject.");
  }
};

// Devuelve usuario autenticado
export const getUserSession = (req, res) => {
  if (!req.session.user) return res.status(401).send("No autenticado");
  res.json(req.session.user);
};





// Cierra sesión
// En backend/controllers/authController.js

export const logoutUser = (req, res) => {
    // 1. Destruir la sesión local (Tu aplicación)
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al destruir la sesión local:", err);
            return res.status(500).send("Error al cerrar sesión localmente.");
        }

        // URL de redirección final que queremos que OpenProject use
        const returnToURL = "http://localhost:4000/post_logout_principal";
        
        // 2. Intentar forzar la redirección usando el parámetro más probable ('return_to')
        // Si OpenProject ignora el parámetro, el usuario se quedará en su página de logout.
        const openProjectLogoutURL = `${process.env.OPENPROJECT_URL}/logout?return_to=${encodeURIComponent(returnToURL)}`;
        
        // 3. Redirigir al usuario al logout de OpenProject
        res.redirect(openProjectLogoutURL);
    });
};
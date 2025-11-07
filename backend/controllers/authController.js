import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const openprojectURL = process.env.OPENPROJECT_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;

// Redirige al login de OpenProject
export const redirectToOpenProject = (req, res) => {
  const authURL = `${openprojectURL}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&scope=api_v3`;
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
export const logoutUser = (req, res) => {
    // 1. Destruir la sesión local (tu aplicación)
    req.session.destroy(err => {
        if (err) {
            console.error("Error al destruir la sesión:", err);
            return res.status(500).send("Error al cerrar sesión localmente.");
        }
        
        // 2. Redirigir al endpoint de logout de OpenProject
        // NOTA: Esta URL de logout varía según la configuración de OpenProject.
        // Asumiendo que OpenProject usa el estándar para invalidar la sesión web.
        const openProjectLogoutURL = `${process.env.OPENPROJECT_URL}/auth/logout?redirect_uri=http://localhost:4000/inicio_sesion`;
        
        // Redirige al navegador a OpenProject, que luego lo devuelve al inicio de tu app.
        res.redirect(openProjectLogoutURL);
    });
};

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const openprojectURL = process.env.OPENPROJECT_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;

// Redirige al login de OpenProject
export const redirectToOpenProject = (req, res) => {
  const authURL = `${openprojectURL}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&scope=api_v3&prompt=login`;
  res.redirect(authURL);
};

// Callback del login (OpenProject redirige aquí)
export const handleOpenProjectCallback = async (req, res) => {
  const { code, error, error_description } = req.query;
  
  // Manejar errores de OpenProject
  if (error) {
    console.error(`Error de OpenProject: ${error} - ${error_description}`);
    return res.status(400).send(`Error de autorización: ${error_description}`);
  }
  
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

    // Obtener información COMPLETA del usuario autenticado
    const userResponse = await axios.get(`${openprojectURL}/api/v3/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userResponse.data;
    
    // ============================================
    // NUEVO: Verificar si el usuario es administrador
    // ============================================
    let isAdmin = false;
    
    // Método 1: Verificar campo 'admin' directo (si OpenProject lo devuelve)
    if (user.admin !== undefined) {
      isAdmin = user.admin;
    }
    
    // Método 2: Verificar roles del usuario
    if (user._links && user._links.roles) {
      try {
        const rolesResponse = await axios.get(user._links.roles.href, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        
        const roles = rolesResponse.data._embedded.elements || [];
        // Buscar si tiene rol de administrador
        isAdmin = roles.some(role => 
          role.name.toLowerCase().includes('admin') || 
          role.name.toLowerCase().includes('administrator') ||
          role.name.toLowerCase().includes('manager')
        );
      } catch (roleError) {
        console.log("⚠️ No se pudieron obtener roles, usando valor por defecto");
      }
    }
    
    // Método 3: Verificar permisos específicos
    if (!isAdmin) {
      // Verificar si tiene permiso para crear proyectos (suele ser de admin)
      try {
        const permissionsResponse = await axios.get(`${openprojectURL}/api/v3/my/permissions`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        
        const permissions = permissionsResponse.data._embedded.elements || [];
        // Permisos que suelen tener los administradores
        const adminPermissions = ['admin', 'manage_project', 'create_project', 'edit_project'];
        isAdmin = permissions.some(permission => 
          adminPermissions.includes(permission)
        );
      } catch (permError) {
        console.log("⚠️ No se pudieron verificar permisos");
      }
    }

    console.log(`👤 Usuario: ${user.firstName} ${user.lastName}`);
    console.log(`🛡️  Es administrador: ${isAdmin ? '✅ SÍ' : '❌ NO'}`);

    // Guardar sesión temporal con información de admin
    req.session.user = user;
    req.session.access_token = access_token;
    req.session.isAdmin = isAdmin;

    // ============================================
    // NUEVO: Redirigir según el rol
    // ============================================
    if (isAdmin) {
      res.redirect("http://localhost:4000/admin/admin.html");
    } else {
      res.redirect("http://localhost:4000/usuario/usuario.html");
    }
    
  } catch (error) {
    console.error("❌ Error autenticando:", error.message);
    console.error("Detalles:", error.response?.data);
    res.status(500).send("Error autenticando con OpenProject.");
  }
};

// Devuelve usuario autenticado CON INFO DE ADMIN
export const getUserSession = (req, res) => {
  if (!req.session.user) return res.status(401).send("No autenticado");
  
  // Devolver información completa incluyendo si es admin
  res.json({
    ...req.session.user,
    isAdmin: req.session.isAdmin || false
  });
};

// Cierra sesión
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
        const openProjectLogoutURL = `${process.env.OPENPROJECT_URL}/logout?return_to=${encodeURIComponent(returnToURL)}&force=true`;
        
        // 3. Redirigir al usuario al logout de OpenProject
        res.redirect(openProjectLogoutURL);
    });
};
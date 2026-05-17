<?php
session_start();

// EL ESCUDO: Si no hay sesión iniciada, lo saca de aquí
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php"); 
    exit();
}

/**
 * LÓGICA DE RUTAS (Brutalmente honesta):
 * Como este archivo está en la carpeta /sesion/, para llegar a /imagenes/ o /uploads/
 * debemos subir un nivel usando "../"
 */
$ruta_base = "../";
$foto_perfil = !empty($_SESSION['foto']) ? $ruta_base . $_SESSION['foto'] : $ruta_base . 'imagenes/default_user.png';
$logo_unefa = $ruta_base . "imagenes/unefalogo.png";
$favicon = $ruta_base . "imagenes/lupa.png";
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | VIDI UNEFA</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-brand">
            <img src="imagenes/unefalogo.png" alt="Logo">
            <h2>VIDI</h2>
        </div>

        <div class="user-profile-section" style="text-align: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <img src="<?php echo $foto_perfil; ?>" 
                 alt="Perfil" 
                 style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff33;">
            <p style="color: white; margin-top: 10px; font-size: 0.85rem; font-weight: 600;">
                <?php echo htmlspecialchars($_SESSION['nombre']); ?>
            </p>
        </div>

        <nav>
            <a href="#" class="active">Panel Principal</a>
            <a href="proyecto.php">Proyectos UNEFA</a>
            <a href="perfil.php">Mi Perfil</a>
            <a href="logout.php" class="logout-link">Cerrar Sesión</a>
        </nav>
    </div>

    <div class="main-content">
        <header>
            <h1>Bienvenida, <?php echo htmlspecialchars($_SESSION['nombre']); ?></h1>
            <p>Gestionando el esquema <strong>core</strong> de la base de datos.</p>
        </header>

        <div class="dashboard-header-stats">
            <div class="status-pill">
                <span class="dot pulse"></span> Base de Datos: <strong>Conectado</strong>
            </div>
        </div>

        <div class="map-container">
            <div class="map-header">
                <h3>Ubicación del Investigador</h3>
                <p>Región Estratégica de Defensa Integral (REDI)</p>
            </div>
            
            <div id="venezuela-map">
                <?php 
                // CORRECCIÓN DEL MAPA: Subir nivel para encontrar la carpeta imagenes
                $mapa_path = 'imagenes/ve.svg';
                if (file_exists($mapa_path)) {
                    include $mapa_path;
                } else {
                    echo "<p style='color:red; padding:20px;'>Error: No se encuentra el archivo del mapa en $mapa_path</p>";
                }
                ?>
            </div>
        </div>
    </div>
</body>
</html>
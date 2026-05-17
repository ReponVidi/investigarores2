<?php
session_start();

// Cambiamos != 3 por != 1 para que coincida con tu esquema de base de datos
if (!isset($_SESSION['user_id']) || $_SESSION['rol_id'] != 1) {
    header("Location: ../login/login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Administrativo | VIDI</title>
    <link rel="stylesheet" href="style.css">
    <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-brand">
            <img src="imagenes/unefalogo.png" alt="Logo">
            <h2>VIDI ADMIN</h2>
           
        </div>
        <nav>
            <a href="#" class="active">Vista Global</a>
            <a href="#">Gestionar Usuarios</a>
            <a href="#">Proyectos Totales</a>
            <a href="#">Auditoría de Sistema</a>
            <a href="../sesion/logout.php" class="logout-link">Cerrar Sesión</a>
        </nav>
    </div>

    <div class="main-content">
        <header>
            <div class="header-info">
                <h1>Panel de Control Maestro</h1>
                <p>Administrador: <strong><?php echo htmlspecialchars($_SESSION['nombre']); ?></strong></p>
            </div>
            <div class="server-status">
                <span class="dot"></span> Servidor PostgreSQL Activo
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="info">
                    <h3>Total Usuarios</h3>
                    <p>24</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="info">
                    <h3>Proyectos UNEFA</h3>
                    <p>156</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="info">
                    <h3>Documentos</h3>
                    <p>892</p>
                </div>
            </div>
        </div>

        <section class="admin-section">
            <h2>Acciones Rápidas</h2>
            <div class="action-buttons">
                <button class="btn btn-primary">Nuevo Reporte</button>
                <button class="btn btn-secondary">Limpiar Logs</button>
            </div>
        </section>
    </div>

    <script src="admin.js"></script>
</body>
</html>
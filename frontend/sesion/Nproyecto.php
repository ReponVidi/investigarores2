<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Proyecto | VIDI</title>
    <link rel="stylesheet" href="styles.css"> <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        .form-container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 900px; margin: 0 auto; }
        .vidi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .full-width { grid-column: span 2; }
        .vidi-label { font-weight: 800; color: #003366; margin-bottom: 8px; display: block; font-size: 0.9rem; text-transform: uppercase; }
        .vidi-input { width: 100%; padding: 12px; border: 2px solid #eef2f6; border-radius: 10px; font-family: inherit; transition: 0.3s; }
        .vidi-input:focus { border-color: #003366; outline: none; background: #f8fbff; }
        .btn-vidi { background: #003366; color: white; padding: 15px 35px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-vidi:hover { background: #004a99; transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-brand">
            <img src="imagenes/unefalogo.png" alt="Logo">
            <h2>VIDI</h2>
        </div>
        <nav>
            <a href="sesion.php">Panel Principal</a>
            <a href="proyecto.php" class="active">Proyectos UNEFA</a>
            <a href="perfil.php">Mi Perfil</a>
            <a href="logout.php" class="logout-link">Cerrar Sesión</a>
        </nav>
    </div>

    <div class="main-content">
        <header style="margin-bottom: 30px;">
            <h1 style="color: #003366; font-weight: 800;">Registrar Nuevo Proyecto</h1>
            <p>Integra una nueva investigación al sistema de control regional.</p>
        </header>

        <div class="form-container">
            <form action="procesar_Nproyecto.php" method="POST" class="vidi-grid">
                
                <div class="input-group full-width">
                    <label class="vidi-label">Título del Proyecto</label>
                    <input type="text" name="nombre" required placeholder="Ej: Análisis de Redes Neuronales en Defensa" class="vidi-input">
                </div>

                <label class="vidi-label">Área de Investigación</label>
                <select name="area_id" required class="vidi-input">
                    <option value="1">Ingeniería y Tecnología</option>
                    <option value="2">Ciencias Sociales</option>
                    <option value="3">Seguridad de la Nación</option>
                </select>

                <div class="input-group">
                    <label class="vidi-label">Ubicación (Estado)</label>
                    <select name="id_estado" required class="vidi-input">
                        <option value="">Seleccione el estado...</option>
                        <option value="1">Distrito Capital</option>
                        <option value="2">Miranda</option>
                        <option value="3">Aragua</option>
                        <option value="4">Zulia</option>
                        <option value="5">Carabobo</option>
                    </select>
                </div>

                <div class="input-group">
                    <label class="vidi-label">Fecha de Entrega Estimada</label>
                    <input type="date" name="fecha_entrega" required class="vidi-input">
                </div>

                <div class="input-group">
                    <label class="vidi-label">Estatus Inicial</label>
                    <select name="estatus" class="vidi-input">
                        <option value="Propuesta">Propuesta</option>
                        <option value="En Desarrollo">En Desarrollo</option>
                    </select>
                </div>

                <div class="input-group full-width">
                    <label class="vidi-label">Responsable del Proyecto</label>
                    <input type="text" name="responsable" placeholder="Nombre completo del encargado" required class="vidi-input">
                </div>

                <div class="input-group full-width">
                    <label class="vidi-label">Descripción General</label>
                    <textarea name="descripcion" rows="4" placeholder="Resumen de objetivos y alcance..." class="vidi-input" style="resize: none;"></textarea>
                </div>

                <div class="full-width" style="display: flex; align-items: center; gap: 20px; margin-top: 10px;">
                    <button type="submit" class="btn-vidi">Guardar Proyecto</button>
                    <a href="proyecto.php" style="text-decoration: none; color: #666; font-weight: 600;">Cancelar y volver</a>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
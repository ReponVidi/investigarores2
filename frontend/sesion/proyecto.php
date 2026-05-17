<?php
session_start();

// SEGURIDAD: Si no hay sesión, al login.
if (!isset($_SESSION['user_id'])) {
    header("Location: login/login.php");
    exit();
}

require_once '../../backend/config/db.php'; 

try {
    // Intentaremos con 'created_at' que es el estándar de tu esquema original
    // Si sigue fallando, es porque en tu tabla la columna se llama de otra forma (revisa pgAdmin)
    $query = "SELECT p.id, p.titulo, (per.nombres || ' ' || per.apellidos) as autor, p.creado_en 
          FROM core.proyectos_unefa p
          JOIN core.usuarios u ON p.author_id = u.id
          JOIN core.personas per ON u.persona_id = per.id
          ORDER BY p.creado_en DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Si falla con created_at, el error te lo dirá aquí
    $error_db = "Error al cargar proyectos: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proyectos UNEFA | VIDI</title>
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
        <nav>
            <a href="sesion.php">Panel Principal</a>
            <a href="proyectos.php" class="active">Proyectos UNEFA</a>
            <a href="perfil.php">Mi Perfil</a>
            <a href="logout.php" class="logout-link">Cerrar Sesión</a>
        </nav>
    </div>

    <div class="main-content">
        <header>
            <h1>Proyectos de Investigación</h1>
            <p>Explora y gestiona los proyectos del esquema <strong>core</strong>.</p>
        </header>

        <div class="projects-container">
            <div class="action-bar" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: var(--primary-blue);">Listado General</h2>
                <a href="Nproyecto.php" class="btn-reg"> + Nuevo Proyecto </a>
            </div>

            <div class="map-container" style="text-align: left;">
                <?php if (isset($error_db)): ?>
                    <p style="color: #d32f2f; padding: 20px;"><?php echo $error_db; ?></p>
                <?php else: ?>
                    <table style="width: 100%; border-collapse: collapse; font-family: 'Plus Jakarta Sans', sans-serif;">
                        <thead>
                            <tr style="border-bottom: 2px solid #eee;">
                                <th style="padding: 15px; text-align: left; color: #666;">Título</th>
                                <th style="padding: 15px; text-align: left; color: #666;">Investigador</th>
                                <th style="padding: 15px; text-align: left; color: #666;">Fecha</th>
                                <th style="padding: 15px; text-align: left; color: #666;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($proyectos) > 0): ?>
                                <?php foreach ($proyectos as $p): ?>
                                    <tr style="border-bottom: 1px solid #f9f9f9;">
                                        <td style="padding: 15px; font-weight: 600;">
                                            <?php echo htmlspecialchars($p['titulo']); ?>
                                        </td>
                                        <td style="padding: 15px;">
                                            <?php echo htmlspecialchars($p['autor']); ?>
                                        </td>
                                        <td style="padding: 15px;">
                                            <?php echo date('d/m/Y', strtotime($p['creado_en'])); ?>
                                        </td>
                                        <td style="padding: 15px;">
                                            <a href="detalle.php?id=<?php echo $p['id']; ?>" style="color: var(--primary-blue); text-decoration: none; font-weight: 800;">
                                                Ver Detalle
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="4" style="padding: 30px; text-align: center; color: #999;">
                                        No se encontraron proyectos en la base de datos.
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
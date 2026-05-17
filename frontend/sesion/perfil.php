<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login/login.php");
    exit();
}
require_once '../../backend/config/db.php';

// UNIÓN ESTRATÉGICA: Recuperamos TODO del usuario y la persona asociada
try {
    $stmt = $pdo->prepare("
        SELECT u.*, p.* FROM core.usuarios u 
        JOIN core.personas p ON u.persona_id = p.id 
        WHERE u.id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    die("Error de base de datos: " . $e->getMessage());
}

// Gestión de Rutas
$ruta_base = "../";
$foto_perfil = !empty($_SESSION['foto']) ? $ruta_base . $_SESSION['foto'] : $ruta_base . 'imagenes/default_user.png';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil Investigador | VIDI</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        .profile-card { background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 40px; max-width: 900px; margin: 20px auto; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
        .input-group { display: flex; flex-direction: column; }
        .input-group label { font-size: 0.8rem; font-weight: 700; color: #003366; margin-bottom: 8px; text-transform: uppercase; }
        .input-vidi { padding: 12px; border: 2px solid #eef2f6; border-radius: 10px; font-family: inherit; transition: 0.3s; }
        .input-vidi:focus { border-color: #003366; outline: none; background: #f8fbff; }
        .section-title { grid-column: span 2; border-bottom: 2px solid #f0f2f5; padding-bottom: 10px; margin-top: 20px; color: #003366; font-size: 1.1rem; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-brand">
            <img src="imagenes/unefalogo.png" alt="Logo">
            <h2>VIDI</h2>
        </div>
        <div class="user-profile-section" style="text-align: center; padding: 20px 0;">
            <img src="<?php echo $foto_perfil; ?>" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff33;">
            <p style="color: white; margin-top: 10px; font-weight: 600;"><?php echo htmlspecialchars($_SESSION['nombre']); ?></p>
        </div>
        <nav>
            <a href="sesion.php">Panel Principal</a>
            <a href="proyecto.php">Proyectos UNEFA</a>
            <a href="perfil.php" class="active">Mi Perfil</a>
            <a href="logout.php" class="logout-link">Cerrar Sesión</a>
        </nav>
    </div>

    <div class="main-content">
        <div class="profile-card">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="position: relative; display: inline-block;">
                    <img id="avatar-preview" src="<?php echo $foto_perfil; ?>" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 5px solid #f0f2f5;">
                    <form action="subir_foto.php" method="POST" enctype="multipart/form-data" id="photoForm">
                        <label for="foto-input" style="position: absolute; bottom: 5px; right: 5px; background: #003366; color: white; padding: 10px; border-radius: 50%; cursor: pointer;">📸</label>
                        <input type="file" id="foto-input" name="foto" accept="image/*" style="display: none;" onchange="this.form.submit()">
                    </form>
                </div>
            </div>

            <form action="actualizar_perfil.php" method="POST" class="form-grid">
                <h3 class="section-title">Información Personal</h3>
                <div class="input-group">
                    <label>Nombres</label>
                    <input type="text" name="nombres" class="input-vidi" value="<?php echo htmlspecialchars($user['nombres']); ?>">
                </div>
                <div class="input-group">
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" class="input-vidi" value="<?php echo htmlspecialchars($user['apellidos']); ?>">
                </div>
                <div class="input-group">
                    <label>Teléfono</label>
                    <input type="text" name="telefono" class="input-vidi" value="<?php echo htmlspecialchars($user['telefono'] ?? ''); ?>" placeholder="Ej: 04121234567">
                </div>
                <div class="input-group">
                    <label>Estado Civil</label>
                    <select name="estado_civil" class="input-vidi">
                        <option value="Soltero/a" <?php echo ($user['estado_civil'] == 'Soltero/a') ? 'selected' : ''; ?>>Soltero/a</option>
                        <option value="Casado/a" <?php echo ($user['estado_civil'] == 'Casado/a') ? 'selected' : ''; ?>>Casado/a</option>
                        <option value="Divorciado/a" <?php echo ($user['estado_civil'] == 'Divorciado/a') ? 'selected' : ''; ?>>Divorciado/a</option>
                    </select>
                </div>

                <h3 class="section-title">Datos Académicos</h3>
                <div class="input-group">
                    <label>Grado Académico</label>
                    <select name="grado_academico" class="input-vidi">
                        <option value="T.S.U" <?php echo ($user['grado_academico'] == 'T.S.U') ? 'selected' : ''; ?>>T.S.U</option>
                        <option value="Ingeniero/a" <?php echo ($user['grado_academico'] == 'Ingeniero/a') ? 'selected' : ''; ?>>Ingeniero/a</option>
                        <option value="Magister" <?php echo ($user['grado_academico'] == 'Magister') ? 'selected' : ''; ?>>Magister</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Correo Institucional</label>
                    <input type="email" class="input-vidi" value="<?php echo htmlspecialchars($user['email']); ?>" disabled style="background: #f8f9fa;">
                </div>

                <div class="button-container">
                    <button type="submit" class="btn-save-vidi">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>
</body>
</html>

<?php session_start(); ?>
<?php if (isset($_SESSION['mensaje_exito'])): ?>
    <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #c3e6cb; font-family: sans-serif;">
        <?php 
            echo $_SESSION['mensaje_exito']; 
            unset($_SESSION['mensaje_exito']); // Lo borramos para que no salga siempre
        ?>
    </div>
<?php endif; ?>

<?php if (isset($_SESSION['mensaje_error'])): ?>
    <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #f5c6cb; font-family: sans-serif;">
        <?php 
            echo $_SESSION['mensaje_error']; 
            unset($_SESSION['mensaje_error']); 
        ?>
    </div>
<?php endif; ?>

</style>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso | Plataforma VIDI</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>

<div class="login-container">
    <div class="login-box">
        <div class="login-header">
            <img src="imagenes/unefalogo.png" alt="Logo UNEFA" class="login-logo">
            <h1>Bienvenido</h1>
            <p>Introduce tus credenciales para acceder a VIDI</p>
        </div>

        <form id="loginForm" action="../../backend/controllers/auth.php" method="POST">
            <div class="input-group">
                <label for="username">Nombre de Usuario</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="input-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn-login">Iniciar Sesión</button>
        </form>

        <div class="login-footer-actions">
                <a href="../principal/index.php" class="btn-back">
                    <span class="icon">←</span> Volver al Inicio
                </a>
        </div>
    </div>
</div>

<script src="login-logic.js"></script>
</body>
</html>
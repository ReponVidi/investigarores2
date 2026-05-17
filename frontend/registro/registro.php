<?php 
// REGLA DE ORO: Siempre en la línea 1 para que PHP pueda leer los mensajes de error
session_start(); 
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro | VIDI UNEFA</title>
    <link rel="stylesheet" href="style.css">
    <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>

<div class="reg-container">
    <div class="reg-box">
        <div class="reg-header">
            <img src="imagenes/unefalogo.png" alt="UNEFA" class="reg-logo">
            <h1>Crear Cuenta</h1>
            <p>Únete a la plataforma de investigación</p>
        </div>

            <form id="regForm" action="procesar_registro.php" method="POST" class="registration-form">
                
                <h3 style="color: var(--primary-blue); border-bottom: 2px solid #eee; padding-bottom: 10px;">Datos de Identidad</h3>
                
                <div class="input-group">
                    <label for="cedula">Cédula de Identidad (Formato V-0000 o E-0000)</label>
                    <input type="text" id="cedula" name="cedula" required placeholder="Ej: V-12345678" 
                        pattern="^[VE]-[0-9]+$" title="Debe empezar con V- o E- seguido de números">
                </div>

                <div style="display: flex; gap: 15px;">
                    <div class="input-group" style="flex: 1;">
                        <label for="nombres">Nombres</label>
                        <input type="text" id="nombres" name="nombres" required placeholder="Tus nombres">
                    </div>
                    <div class="input-group" style="flex: 1;">
                        <label for="apellidos">Apellidos</label>
                        <input type="text" id="apellidos" name="apellidos" required placeholder="Tus apellidos">
                    </div>
                </div>

                <h3 style="color: var(--primary-blue); border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 20px;">Credenciales VIDI</h3>
                <div class="input-group">
                    <label for="username">Nombre de Usuario (ID de acceso)</label>
                    <input type="text" id="username" name="username" required placeholder="Ej: carmari_vidi">
                </div>

                <div class="input-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" required placeholder="usuario@unefa.edu.ve">
                </div>

               <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" required placeholder="••••••••">
                </div>

                <div class="input-group">
                    <label for="confirm_password">Confirmar Contraseña</label>
                    <input type="password" id="confirm_password" name="confirm_password" required placeholder="••••••••">
                </div>

                <div class="input-group">
                    <label for="rol_id">Rol en el Sistema</label>
                    <select name="rol_id" id="rol_id" required style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #eee;">
                        <option value="2">Investigador</option>
                        <option value="1">Administrador</option>
                    </select>
                </div>
                <h3 style="color: var(--primary-blue); border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 20px;">Estatus Institucional</h3>

                <div class="input-group">
                    <label for="es_militar">¿Es personal militar?</label>
                    <select id="es_militar" name="es_militar" onchange="toggleRangos()" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #eee;">
                        <option value="no">No, Personal Civil</option>
                        <option value="si">Sí, Personal Militar</option>
                    </select>
                </div>

                <div id="contenedor-rangos" style="display: none; margin-top: 15px;">
                    <div class="input-group">
                        <label for="rango_id">Rango Militar</label>
                        <select name="rango_id" id="rango_id" style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #eee;">
                            <option value="">Seleccione su rango...</option>
                            <?php
                                try {
                                    // Verificamos la ruta: si registro.php está en frontend/sesion/
                                    require_once '../../backend/config/db.php';
                                    $stmt = $pdo->query("SELECT id, nombre_rango FROM core.rangos_militares ORDER BY id ASC");
                                    while ($row = $stmt->fetch()) {
                                        echo "<option value='{$row['id']}'>{$row['nombre_rango']}</option>";
                                    }
                                } catch (Exception $e) {
                                    echo "<option value=''>Error al cargar rangos</option>";
                                }
                            ?>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-login" style="margin-top: 20px;">Crear Cuenta</button>
            </form>
        <p class="footer-text">¿Ya tienes cuenta? <a href="../login/login.php">Inicia sesión aquí</a></p>
    </div>
</div>

<script src="registro.js"></script>

<?php 
if (isset($_SESSION['mensaje_error'])): 
    // Limpiamos el mensaje de saltos de línea y comillas para evitar el SyntaxError
    $error_limpio = str_replace(["\r", "\n", '"'], [" ", " ", "'"], $_SESSION['mensaje_error']);
?>
    <script>
        // Usamos una variable segura
        const mensajeError = "<?php echo addslashes($error_limpio); ?>";
        if (mensajeError) {
            alert(mensajeError);
        }
    </script>
<?php 
    unset($_SESSION['mensaje_error']); 
endif; 
?>
</body>
</html>
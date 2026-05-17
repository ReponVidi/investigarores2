<?php
session_start();
require_once '../config/db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username_input = trim($_POST['username']); 
    $password_input = $_POST['password'];

    try {
        
        $sql = "SELECT u.id, u.username, u.password_hash, u.rol_id, u.foto_url, p.nombres, p.apellidos 
                FROM core.usuarios u
                INNER JOIN core.personas p ON u.persona_id = p.id
                WHERE u.username = :identificador OR u.email = :identificador";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':identificador' => $username_input]);
        $user = $stmt->fetch();

        if ($user && password_verify($password_input, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['usuario'] = $user['username'];
            $_SESSION['nombre'] = $user['nombres'] . " " . $user['apellidos'];
            $_SESSION['rol_id'] = $user['rol_id'];
            $_SESSION['foto'] = $user['foto_url'];
            $_SESSION['foto_url'] = $user['foto_url'];

            // Redirección por roles
            if ($user['rol_id'] == 1) {
                header("Location: ../../frontend/admin/admin.php");
            } else {
                header("Location: ../../frontend/sesion/sesion.php");
            }
            exit();
        } else {
            $_SESSION['mensaje_error'] = "Usuario o contraseña incorrectos.";
            header("Location: ../../frontend/login/login.php");
            exit();
        }
    } catch (PDOException $e) {
        $_SESSION['mensaje_error'] = "Error de sistema: " . $e->getMessage();
        header("Location: ../../frontend/login/login.php");
        exit();
    }
} else {
    header("Location: ../../frontend/login/login.php");
    exit();
}
// Asegúrate de que no haya nada después de esta línea.
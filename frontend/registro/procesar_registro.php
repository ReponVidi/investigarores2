<?php
session_start();
require_once '../../backend/config/db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombres = trim($_POST['nombres']);
    $apellidos = trim($_POST['apellidos']);
    $cedula = trim($_POST['cedula']);
    $username = trim($_POST['username']); // Capturamos el nuevo campo
    $email = trim($_POST['email']);
    $password_hash = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $rol_id = $_POST['rol_id'];
    
    // Lógica para el rango militar
    $rango_id = ($_POST['es_militar'] === 'si' && !empty($_POST['rango_id'])) ? $_POST['rango_id'] : null;

    try {
        $pdo->beginTransaction();

        // PASO 1: (Sin cambios en personas)
        $sqlPersona = "INSERT INTO core.personas (cedula, nombres, apellidos, rango_id) VALUES (?, ?, ?, ?) RETURNING id";
        $stmtPersona = $pdo->prepare($sqlPersona);
        $stmtPersona->execute([$cedula, $nombres, $apellidos, $rango_id]);
        $persona_id = $stmtPersona->fetchColumn();

        // PASO 2: Ajustamos la inserción para incluir el USERNAME
        // Captura el valor del nuevo campo
        $username = trim($_POST['username']); 

        // PASO 2: Inserción en core.usuarios incluyendo el USERNAME
        $sqlUsuario = "INSERT INTO core.usuarios (persona_id, username, email, password_hash, rol_id) VALUES (?, ?, ?, ?, ?)";
        $stmtUsuario = $pdo->prepare($sqlUsuario);
        $stmtUsuario->execute([$persona_id, $username, $email, $password_hash, $rol_id]);
        $pdo->commit();
        
        $_SESSION['mensaje_exito'] = "Registro institucional completado con éxito.";
        header("Location: ../login/login.php");
        exit();

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $_SESSION['mensaje_error'] = "Fallo en el registro: " . $e->getMessage();
        header("Location: registro.php");
        exit();
    }
}
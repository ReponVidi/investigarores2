<?php
session_start();
require_once '../../backend/config/db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        // 1. Obtener el persona_id del usuario actual
        $stmtUser = $pdo->prepare("SELECT persona_id FROM core.usuarios WHERE id = ?");
        $stmtUser->execute([$_SESSION['user_id']]);
        $persona_id = $stmtUser->fetchColumn();

        if (!$persona_id) {
            die("Error: No se encontró el registro de persona.");
        }

        // 2. Capturar los nuevos datos del formulario
        $telefono = trim($_POST['telefono']);
        $fecha_nac = !empty($_POST['fecha_nacimiento']) ? $_POST['fecha_nacimiento'] : null;
        $estado_civil = $_POST['estado_civil'];
        $grado_academico = $_POST['grado_academico'];

        // 3. ACTUALIZACIÓN QUIRÚRGICA: Usamos las columnas existentes
        $sql = "UPDATE core.personas 
                SET telefono = ?, 
                    fecha_nacimiento = ?, 
                    estado_civil = ?, 
                    grado_academico = ? 
                WHERE id = ?";
        
        // NOTA: Revisa si en tu DB es 'grado_academicos' o 'grado_academico' 
        // según la imagen que pasaste parece 'grado_academico'
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$telefono, $fecha_nac, $estado_civil, $grado_academico, $persona_id]);

        header("Location: perfil.php?update=success");
        exit();

    } catch (PDOException $e) {
        die("Error de Base de Datos: " . $e->getMessage());
    }
}
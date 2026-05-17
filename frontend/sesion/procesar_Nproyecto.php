<?php
session_start();
require_once '../../backend/config/db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['user_id'])) {
    
    // Captura de datos (Asegúrate de que el name en el HTML coincida aquí)
    $titulo = trim($_POST['nombre']);
    $descripcion = trim($_POST['descripcion']);
    $area_id = $_POST['area_id']; // Cambiado para coincidir con tu SQL
    $fecha_entrega = $_POST['fecha_entrega'];
    $usuario_id = $_SESSION['user_id']; 

    try {
        // SQL basado exactamente en los atributos que me mostraste en pgAdmin
        // NO agregues columnas que no aparezcan en tu captura de pgAdmin
        $sql = "INSERT INTO core.proyectos_unefa 
                (titulo, descripcion, author_id, fecha_entrega, area_id, estatus_id, creado_en) 
                VALUES (:tit, :des, :aut, :fec, :area, :est, NOW())";
        
        // AQUÍ definimos $stmt para evitar el error de "null"
        $stmt = $pdo->prepare($sql); 
        
        $stmt->execute([
            ':tit'  => $titulo,
            ':des'  => $descripcion,
            ':aut'  => $usuario_id,
            ':fec'  => $fecha_entrega,
            ':area' => $area_id, // ID numérico del select
            ':est'  => 1         // Estatus inicial por defecto
        ]);

        header("Location: proyecto.php?exito=1");
        exit();

    } catch (PDOException $e) {
        // Este bloque te dirá exactamente qué columna falló si vuelves a inventar nombres
        die("Error de Base de Datos: " . $e->getMessage());
    }
}
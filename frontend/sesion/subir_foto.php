<?php
// 1. Reporte de errores para diagnóstico (Solo para desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

// 2. Verificación de Seguridad: Solo usuarios autenticados
if (!isset($_SESSION['user_id'])) {
    die("Acceso denegado.");
}

require_once '../../backend/config/db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['foto'])) {
    $user_id = $_SESSION['user_id'];
    
    /** * CORRECCIÓN DE RUTA FÍSICA: 
     * Usamos "../" para salir de la carpeta 'sesion' y entrar en 'frontend/uploads'
     */
    $dir_fisico = "../uploads/perfiles/";
    
    // Aseguramos que la carpeta exista físicamente en la raíz del frontend
    if (!file_exists($dir_fisico)) {
        mkdir($dir_fisico, 0777, true);
    }

    // Generamos un nombre único basado en el tiempo para evitar conflictos y caché
    $nombre_archivo = time() . "_" . preg_replace("/[^a-zA-Z0-9.]/", "_", basename($_FILES['foto']['name']));
    $ruta_destino = $dir_fisico . $nombre_archivo;
    
    /**
     * RUTA PARA LA BASE DE DATOS:
     * Debe empezar por 'uploads/' para que el TRIGGER 'fn_validar_url_foto' no la rechace
     */
    $ruta_db = "uploads/perfiles/" . $nombre_archivo;

    try {
        // 3. Mover el archivo al servidor
        if (move_uploaded_file($_FILES['foto']['tmp_name'], $ruta_destino)) {
            
            // 4. Actualización en PostgreSQL usando el esquema 'core'
            $sql = "UPDATE core.usuarios SET foto_url = :foto WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':foto' => $ruta_db, ':id' => $user_id]);

            /**
             * 5. SINCRONIZACIÓN DE SESIÓN:
             * Actualizamos la variable para que sesion.php y admin.php reflejen el cambio
             */
            $_SESSION['foto'] = $ruta_db; 

            // Redirección con parámetro de éxito para mostrar alertas si lo deseas
            header("Location: perfil.php?exito=1");
            exit();
        } else {
            die("Error crítico: No se pudo mover el archivo. Verifica permisos en: " . realpath($dir_fisico));
        }
    } catch (PDOException $e) {
        // Captura errores de formato impuestos por el Trigger de la base de datos
        die("Error de validación institucional (Trigger): " . $e->getMessage());
    }
} else {
    header("Location: perfil.php");
    exit();
}
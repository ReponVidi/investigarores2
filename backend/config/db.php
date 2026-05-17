<?php
$host = "localhost"; 
$port = "5433";
$dbname = "proyectounefa5.2";
$user = "postgres";
$password = "123456";

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // IMPORTANTE: Según tu SQL, tus tablas están en el esquema 'core'
    $pdo->exec("SET search_path TO core, public");
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>

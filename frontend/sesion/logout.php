<?php
session_start();
session_unset(); // Borra las variables
session_destroy(); // Destruye la sesión
header("Location: ../login/login.php"); // Te manda al inicio
exit();
?>
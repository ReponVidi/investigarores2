document.addEventListener('DOMContentLoaded', () => {
    console.log("Panel administrativo cargado exitosamente.");

    // Ejemplo: Alerta de bienvenida solo para el log del navegador
    const adminName = document.querySelector('header h1').innerText;
    console.info("Sesión activa de " + adminName);
});
// Inicializar iconos de Lucide
lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
    // 1. Referencia al formulario (Asegúrate que el ID en tu HTML sea 'loginForm')
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Extraer datos de los inputs
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const formData = { username, password };

            try {
                // Petición al servidor
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    // El servidor decide si vas a /admin o /usuario
                    console.log("Acceso concedido. Redirigiendo a:", data.redirect);
                    window.location.href = data.redirect;
                } else {
                    // Mostrar error del servidor (usuario no encontrado, clave mal, etc.)
                    alert(data.error || "Credenciales incorrectas");
                }
            } catch (error) {
                console.error("Error en la conexión al backend:", error);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }

    // 2. Manejo del botón de Registro (si existe en esa página)
    const botonRegistro = document.querySelector(".registrate");
    if (botonRegistro) {
        botonRegistro.addEventListener("click", () => {
            window.location.href = "/registro";
        });
    }
});
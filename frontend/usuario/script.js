// frontend/usuario/script.js

document.addEventListener('DOMContentLoaded', async () => {
    const userInfoElement = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logoutBtn');
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdown = document.getElementById('userDropdown');

    // --- 1. Cargar datos del usuario desde el servidor ---
    async function loadUserData() {
        try {
            // Usamos el endpoint que SI existe en tu server.js
            const response = await fetch('/api/user-profile');
            const data = await response.json();

            if (data.success) {
                // Actualizamos el nombre en el sidebar
                if (userInfoElement) {
                    userInfoElement.innerHTML = `<span>Hola, <strong>${data.username}</strong></span>`;
                }
                console.log("Perfil cargado para:", data.username);
            } else {
                console.warn("Sesión no válida, redirigiendo...");
                window.location.href = '/login';
            }
        } catch (error) {
            console.error("Error al obtener perfil:", error);
            if (userInfoElement) userInfoElement.textContent = "Error de conexión";
        }
    }

    // --- 2. Manejo del Cierre de Sesión ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
                // Como no tienes ruta de logout aún, redirigimos al principal
                window.location.href = '/'; 
            }
        });
    }

    // --- 3. Menú Desplegable ---
    if (userMenuTrigger && userDropdown) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!userMenuTrigger.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Ejecutar carga inicial
    loadUserData();
});
// frontend/usuario/script.js

document.addEventListener('DOMContentLoaded', () => {
    const userInfoElement = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // --- 1. Función para cargar y mostrar datos del usuario ---
    async function loadUserData() {
        try {
            // Llama a la ruta de tu backend que devuelve la sesión
            const response = await fetch('http://localhost:4000/auth/me', {
                credentials: 'include' // Necesario para enviar la cookie de sesión
            });

            if (response.ok) {
                const userData = await response.json();
                
                // Extraer y mostrar los datos del usuario de OpenProject
                const login = userData.login || 'N/A';
                const firstName = userData.firstName || 'Usuario';
                const lastName = userData.lastName || 'Desconocido';
                const email = userData.email || 'N/A';

                userInfoElement.innerHTML = `
                    <p>¡Hola, <strong>${firstName} ${lastName}</strong>!</p>
                    <p>Usuario: <strong>${login}</strong></p>
                    <p>Email: <strong>${email}</strong></p>
                    <p>Esto es un Ejemplo de lo que se Puede lograr.</p>
                `;
            } else if (response.status === 401) {
                // Usuario no autenticado (ej. sesión expiró). Redirige a la raíz.
                userInfoElement.innerHTML = `<p>Error: No hay sesión activa. Redirigiendo...</p>`;
                window.location.href = 'http://localhost:4000/';
            } else {
                userInfoElement.innerHTML = `<p>Error al cargar el perfil. Intenta nuevamente.</p>`;
            }
        } catch (error) {
            console.error('Fallo en la conexión al backend:', error);
            userInfoElement.innerHTML = `<p>No se pudo conectar con el servidor.</p>`;
        }
    }

    // --- 2. Función para manejar el cierre de sesión ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            
            // 1. Mostrar un mensaje instructivo ANTES de la redirección
            const confirmLogout = confirm(
                "¡Atención! Tu sesión se cerrará en OpenProject.\n\n" +
                "Una vez en la página de OpenProject, por favor, utiliza el botón o enlace 'Regresar' si está disponible, o navega manualmente a:\n" +
                "http://localhost:4000/ppricipal/pprincipal.html"
            );

            if (confirmLogout) {
                // 2. Si el usuario confirma, inicia el flujo de logout (redirección a /auth/logout)
                // El backend se encarga de todo el proceso de redirección forzada.
                window.location.href = 'http://localhost:4000/auth/logout';
            }
        });
    }

    // Iniciar la carga de datos al cargar la página
    loadUserData();
});
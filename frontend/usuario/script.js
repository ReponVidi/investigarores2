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
                    <p>¡Hola, **${firstName} ${lastName}**!</p>
                    <p>Usuario: <strong>${login}</strong></p>
                    <p>Email: <strong>${email}</strong></p>
                    <p>Esto es un Ejemplo de lo que se Puede lograr.</p>
                `;
            } else if (response.status === 401) {
                // Usuario no autenticado (ej. sesión expiró)
                userInfoElement.innerHTML = `<p>Error: No hay sesión activa.</p>`;
                window.location.href = 'http://localhost:4000/inicio_sesion';
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
            // Redirige a la ruta de logout en tu backend
            // El backend se encargará de destruir la sesión local y redirigir a OpenProject para el logout total.
            window.location.href = 'http://localhost:4000/auth/logout';
        });
    }

    // Iniciar la carga de datos al cargar la página
    loadUserData();
});
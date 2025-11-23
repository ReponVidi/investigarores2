// frontend/usuario/script.js

document.addEventListener('DOMContentLoaded', () => {
    const userInfoElement = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // --- 1. Función para cargar y mostrar datos del usuario ---
    async function loadUserData() {
        try {
            const response = await fetch('http://localhost:4000/auth/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                const firstName = userData.firstName || 'Usuario';
                const lastName = userData.lastName || 'Desconocido';

                userInfoElement.innerHTML = `<p>¡Hola, <strong>${firstName} ${lastName}</strong>!</p>`;
            } else if (response.status === 401) {
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

    // --- 2. Función unificada para manejar el cierre de sesión ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir comportamiento por defecto
            
            const confirmLogout = confirm(
                "¡Atención! Tu sesión se cerrará en OpenProject.\n\n" +
                "Una vez en la página de OpenProject, por favor, utiliza el botón o enlace 'Regresar' si está disponible, o navega manualmente a:\n" +
                "http://localhost:4000/ppricipal/pprincipal.html"
            );

            if (confirmLogout) {
                window.location.href = 'http://localhost:4000/auth/logout';
            }
        });
    }

    // --- 3. Script para el menú desplegable (MANTENER) ---
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuTrigger && userDropdown) {
        userMenuTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Cerrar menú con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                userDropdown.classList.remove('active');
            }
        });
    }

    // --- 4. Animaciones y menu items (MANTENER) ---
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        const originalHeight = bar.style.height;
        bar.style.height = '0%';
        
        setTimeout(() => {
            bar.style.height = originalHeight;
        }, 300);
    });
    
    const menuItems = document.querySelectorAll('.menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Iniciar la carga de datos al cargar la página
    loadUserData();
});
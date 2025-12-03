// frontend/usuario/script.js

document.addEventListener('DOMContentLoaded', () => {
    const userInfoElement = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logoutBtn');

    checkUserIsNotAdmin();
    
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
                const email = userData.email || '';

                userInfoElement.innerHTML = `
                    <p>¡Hola, <strong>${firstName} ${lastName}</strong>!</p>
                    <small>${email}</small>
                `;
            } else if (response.status === 401) {
                userInfoElement.innerHTML = `<p>Error: No hay sesión activa. Redirigiendo...</p>`;
                setTimeout(() => {
                    window.location.href = 'http://localhost:4000/';
                }, 2000);
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
                "¿Estás seguro de que quieres cerrar sesión?\n\n" +
                "Tu sesión se cerrará tanto aquí como en OpenProject."
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

async function checkUserIsNotAdmin() {
    try {
        const response = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            
            if (userData.isAdmin) {
                // Es administrador, redirigir al panel de admin
                window.location.href = 'http://localhost:4000/admin/admin.html';
                return false;
            }
            
            return true;
        }
    } catch (error) {
        console.error('Error verificando rol:', error);
        return true; // Continuar en panel de usuario por defecto
    }
}
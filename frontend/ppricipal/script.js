// Carrusel de imágenes
document.addEventListener('DOMContentLoaded', function () {
    let slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, 5000);
});

// Esperar que el documento cargue completamente
document.addEventListener("DOMContentLoaded", () => {
    // 1. Manejar el clic del botón de Registro
    const botonRegistro = document.querySelector(".registrate");
    if (botonRegistro) {
        botonRegistro.addEventListener("click", () => {
            // Redirige a la página de inicio de sesión
            window.location.href = "http://localhost:4000/registro";
        });
    }

    // 2. Manejar el clic del botón de Login (Redirección a OpenProject)
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            // Redirección al inicio de sesión de OpenProject
            window.location.href = "http://localhost:4000/login";
        });
    }

    // 3. Mostrar bienvenida del usuario si está autenticado
    showRealUserWelcome();
});

// Función para obtener datos del usuario desde el backend
async function getUserData() {
    try {
        const response = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include' // Importante: incluye cookies de sesión
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        return null;
    }
}

// Mostrar bienvenida con datos reales
async function showRealUserWelcome() {
    const userData = await getUserData();

    // Si hay usuario autenticado, cambiar texto del botón login
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn && userData) {
        const firstName = userData.firstName || 'Usuario';
        loginBtn.textContent = `Bienvenido, ${firstName}`;
        loginBtn.style.backgroundColor = '#4CAF50'; // Verde para indicar sesión activa
        loginBtn.onclick = function () {
            window.location.href = "http://localhost:4000/usuario/usuario.html";
        };
    }
}
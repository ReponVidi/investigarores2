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
    const botonRegistro = document.querySelector(".registrate");

    if (botonRegistro) {
        botonRegistro.addEventListener("click", () => {
            // Redirige a la página de inicio de sesión
            window.location.href = "../inicio_sesion/inicio.html";
        });
    }
});

// Función para obtener datos del usuario desde el backend
async function getUserData() {
    try {
        const response = await fetch('http://localhost:3000/auth/me', {
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

    if (userData) {
        document.getElementById('userLoggedIn').style.display = 'block';
        document.getElementById('userLoggedOut').style.display = 'none';

        // Usar los datos reales del usuario
        const userName = userData.name || userData.fullName || userData.username;
        document.getElementById('userName').textContent =
            `Bienvenido ${userName} a nuestra red de investigación`;
    } else {
        document.getElementById('userLoggedIn').style.display = 'none';
        document.getElementById('userLoggedOut').style.display = 'block';
    }
}

// Llamar cuando la página cargue
document.addEventListener('DOMContentLoaded', showRealUserWelcome);
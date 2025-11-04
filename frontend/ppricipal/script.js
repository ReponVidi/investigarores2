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
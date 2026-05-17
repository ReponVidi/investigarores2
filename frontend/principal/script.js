// Manejo de estados de navegación: Resalta el link donde haces click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) activeLink.classList.remove('active');
        this.classList.add('active');
    });
});

/**
 * ANIMACIÓN DEL HEADER AL SCROLL
 * Ajusta el tamaño del header y el escudo para que no estorben al bajar.
 */
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header-vidi');
    const escudo = document.querySelector('.escudo-header-central img');

    if (window.scrollY > 50) {
        // Estado cuando el usuario baja la página
        header.style.height = '90px';
        if (escudo) escudo.style.height = '70px';
        header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    } else {
        // Estado original cuando está arriba (Coincide con el CSS de 140px)
        header.style.height = '140px';
        if (escudo) escudo.style.height = '110px';
        header.style.boxShadow = 'none';
    }
});

/**
 * LÓGICA DEL CARRUSEL VIDI
 * Cambia las imágenes automáticamente cada 3 segundos.
 */
window.addEventListener('load', function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    // Si no hay slides, detenemos la ejecución para evitar errores
    if (slides.length === 0) return;

    function autoMoveSlide() {
        // 1. Quitar clase active al slide actual
        if (slides[currentSlide]) {
            slides[currentSlide].classList.remove('active');
        }

        // 2. Calcular el índice del siguiente slide
        currentSlide = (currentSlide + 1) % slides.length;

        // 3. Aplicar clase active al nuevo slide
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('active');
        }
    }

    // Iniciamos el ciclo infinito del carrusel
    setInterval(autoMoveSlide, 3000);
});

/**
 * LIMPIEZA DE ERRORES CONSOLA
 * Define funciones que otros archivos (como registro) podrían estar llamando.
 */
function toggleRangos() {
    console.log("Sistema de rangos VIDI activo.");
}
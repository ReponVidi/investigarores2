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
    
    // Elementos del NAV
    const loginLi = document.getElementById('loginLi'); // El LI que contiene "Inicio de sesión"
    const userLoggedInDiv = document.getElementById('userLoggedIn');
    const userNameSpan = document.getElementById('userName');

    if (userData) {
        // USUARIO CONECTADO
        if (loginLi) loginLi.style.display = 'none';
        if (userLoggedInDiv) userLoggedInDiv.style.display = 'flex'; // Usar flex para mostrar
        
        const userName = userData.name || userData.fullName || userData.login; // Usar login si no hay nombre
        if (userNameSpan) userNameSpan.textContent = `Bienvenido ${userName} a nuestra red de investigación`;
        
    } else {
        // USUARIO DESCONECTADO
        if (loginLi) loginLi.style.display = 'list-item'; // Mostrar el LI de login
        if (userLoggedInDiv) userLoggedInDiv.style.display = 'none';
    }
}

// Llamar cuando la página cargue
document.addEventListener('DOMContentLoaded', showRealUserWelcome);

// Detectar cambios de tamaño y ajustar dinámicamente
class ResponsiveManager {
    constructor() {
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupResizeListener();
        this.adjustElements();
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < 769) return 'mobile';
        if (width < 1025) return 'tablet';
        return 'desktop';
    }

    setupMobileMenu() {
        // Crear menú hamburguesa para móviles
        const nav = document.querySelector('nav');
        const ul = nav.querySelector('ul');

        if (window.innerWidth < 769) {
            const hamburger = document.createElement('button');
            hamburger.innerHTML = '☰';
            hamburger.className = 'hamburger-menu';
            hamburger.style.cssText = `
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 10px;
            `;

            hamburger.addEventListener('click', () => {
                ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
            });

            nav.insertBefore(hamburger, ul);
            ul.style.display = 'none';
        }
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.onBreakpointChange();
                }
                this.adjustElements();
            }, 250);
        });
    }

    onBreakpointChange() {
        console.log(`Cambio a: ${this.currentBreakpoint}`);

        // Ajustes específicos por breakpoint
        switch (this.currentBreakpoint) {
            case 'mobile':
                this.enableMobileFeatures();
                break;
            case 'tablet':
                this.enableTabletFeatures();
                break;
            case 'desktop':
                this.enableDesktopFeatures();
                break;
        }
    }

    adjustElements() {
        // Ajustar imágenes
        document.querySelectorAll('img').forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });

        // Ajustar textos según el tamaño
        const baseSize = Math.max(16, Math.min(20, window.innerWidth / 60));
        document.body.style.fontSize = `${baseSize}px`;
    }

    enableMobileFeatures() {
        // Ocultar elementos no esenciales en móvil
        document.querySelectorAll('.mobile-hidden').forEach(el => {
            el.style.display = 'none';
        });
    }

    enableDesktopFeatures() {
        // Mostrar todos los elementos en desktop
        document.querySelectorAll('.mobile-hidden').forEach(el => {
            el.style.display = 'block';
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejar el clic del botón de Registro
    const botonRegistro = document.querySelector(".registrate");
    if (botonRegistro) {
        botonRegistro.addEventListener("click", () => {
            window.location.href = "../inicio_sesion/inicio.html";
        });
    }

    // 2. Manejar el clic del botón de Login (Redirección a OpenProject)
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
         loginBtn.addEventListener("click", () => {
             // Redirección al inicio de sesión de OpenProject
             window.location.href = "http://localhost:4000/auth/openproject";
         });
    }
    
    // 3. Inicializa el manejador de responsividad
    new ResponsiveManager();
    
    // 4. Muestra la bienvenida del usuario (maneja la visibilidad de Login/Logout)
    showRealUserWelcome(); 
    
    // 5. Ajustar interacciones para touch (Si usas el código de detección)
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
        document.querySelectorAll('button, a').forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
    }
});

// Función para detectar touch device
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
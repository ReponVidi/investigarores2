<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIDI | UNEFA</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="shortcut icon" href="imagenes/lupa.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>

<header class="header-vidi">
    <div class="nav-container">
        <div class="brand">
            <div class="brand-text">
                <h1>VIDI</h1>
                <span>UNEFA</span>
            </div>
        </div>

        <div class="escudo-header-central">
            <img src="imagenes/unefalogo.png" alt="Escudo UNEFA">
        </div>

        <nav class="nav-menu">
            <a href="../registro/registro.php" class="nav-link">Registro</a>
            <a href="../login/login.php" class="btn-access">Acceder</a>
        </nav>
    </div>
</header>

<main class="main-content">
<section class="hero-vidi">
    <div class="carousel-inner">
        <div class="slide active">
            <img src="imagenes/fondo.jpg" alt="1">
            <div class="slide-content">
                <h2>Gestión de Proyectos</h2>
                <p>Organización estratégica para investigadores</p>
            </div>
        </div>
        <div class="slide">
            <img src="imagenes/fondo2.jpg" alt="2">
            <div class="slide-content">
                <h2>Investigación UNEFA</h2>
                <p>Conectando el conocimiento con la realidad</p>
            </div>
        </div>
        <div class="slide">
            <img src="imagenes/fondo3.jpg" alt="3">
            <div class="slide-content">
                <h2>Innovación Tecnológica</h2>
                <p>Desarrollo de soluciones de vanguardia</p>
            </div>
        </div>
    </div>
</section>

    <section class="dashboard-preview">
        <div class="info-card">
            <h3>MISION</h3>
            <img src="imagenes/light-bulb-alt.png" alt="Misión" class="icono">
            <p>Unir mentes brillantes de la universidad para convertir ideas en proyectos tangibles.</p>
        </div>
        <div class="info-card">
            <h3>VISION</h3>
            <img src="imagenes/eye-alt.png" alt="Visión" class="icono">
            <p>Construir la mayor comunidad de co-creación académica del país.</p>
        </div>
        <div class="info-card">
            <h3>BLOG</h3>
            <img src="imagenes/menseje.png" alt="Blog" class="icono">
            <p>Sigue el progreso de proyectos y encuentra co-investigadores.</p>
        </div>
    </section>
</main>

<script src="script.js"></script>
</body>
</html>
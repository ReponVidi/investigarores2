// 1. Esta función DEBE estar al principio y fuera de todo para que el HTML la vea
function toggleRangos() {
    const esMilitar = document.getElementById('es_militar').value;
    const contenedor = document.getElementById('contenedor-rangos');

    if (esMilitar === 'si') {
        contenedor.style.display = 'block';
        document.getElementById('rango_id').setAttribute('required', 'required');
    } else {
        contenedor.style.display = 'none';
        document.getElementById('rango_id').removeAttribute('required');
        document.getElementById('rango_id').value = "";
    }
}

// 2. Validación de contraseñas
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('regForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            const pass = document.getElementById('password').value;
            const confirm = document.getElementById('confirm_password').value;

            if (pass !== confirm) {
                e.preventDefault();
                alert("Las contraseñas no coinciden. Por favor, verifica.");
            }
        });
    }
});
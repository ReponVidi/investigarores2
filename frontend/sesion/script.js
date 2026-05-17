// LÓGICA INTEGRADA PARA PERFIL Y CARGA DE IMAGEN
document.addEventListener('DOMContentLoaded', () => {
    const fotoInput = document.getElementById('foto-input');
    const formFoto = document.getElementById('form-foto');
    const avatarPreview = document.getElementById('avatar-preview');

    // Solo se ejecuta si estamos en la página de Perfil
    if (fotoInput && formFoto) {
        fotoInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    // Actualizamos la vista previa antes de subir
                    if (avatarPreview) {
                        avatarPreview.src = e.target.result;
                    }
                };

                reader.readAsDataURL(this.files[0]);

                // Enviamos el formulario automáticamente al procesador PHP
                console.log("Subiendo nueva imagen de perfil...");
                formFoto.submit();
            }
        });
    }
});
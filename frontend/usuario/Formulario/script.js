
        document.getElementById('fichaTecnicaForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar fechas
            const fechaInicio = new Date(document.getElementById('fechaInicio').value);
            const fechaFin = new Date(document.getElementById('fechaFin').value);
            
            if (fechaFin < fechaInicio) {
                alert('La fecha de finalización no puede ser anterior a la fecha de inicio.');
                return;
            }
            
            // Aquí puedes agregar la lógica para guardar los datos
            // Por ejemplo, enviar a un servidor o guardar localmente
            
            alert('¡Ficha técnica guardada exitosamente!');
            // Limpiar el formulario después de guardar
            limpiarFormulario();
        });

        function limpiarFormulario() {
            document.getElementById('fichaTecnicaForm').reset();
        }

        // Establecer fecha mínima para la fecha de inicio (hoy)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fechaInicio').min = today;
        
        // Actualizar fecha mínima de fin cuando cambia la fecha de inicio
        document.getElementById('fechaInicio').addEventListener('change', function() {
            document.getElementById('fechaFin').min = this.value;
        });

/**
 * SISTEMA UNEFA - GESTIÓN DE PROYECTOS
 * Ajustado a Esquema de Base de Datos Extendido
 */

const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    const formOP = document.getElementById('crearProyectoForm');
    if (formOP) {
        formOP.addEventListener('submit', manejarGuardadoProyecto);
    }
    prepararCamposOpenProject();
});

async function manejarGuardadoProyecto(event) {
    event.preventDefault(); // BLOQUEO DE REFRESCO DE PÁGINA

    const boton = document.getElementById('btnCrear');
    const mensajeContenedor = document.getElementById('mensajeResultado');

    try {
        if (boton) {
            boton.disabled = true;
            boton.innerText = "Procesando...";
        }

        // RECOLECCIÓN DE DATOS (Mapeado exacto a tu tabla)
        const payload = {
            // Datos del formulario
            nombre: document.getElementById('nombre').value.trim(),
            identificador: document.getElementById('identificador').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            responsable: document.getElementById('responsable').value.trim(),
            fecha_inicio: document.getElementById('fecha_inicio').value,
            fecha_fin: document.getElementById('fecha_fin').value,

            // PUNTOS CIEGOS: Valores obligatorios para la base de datos
            // Si el server no recibe estos, el INSERT fallará.
            author_id: 1,       // ID del usuario que crea (Carmen, por defecto 1)
            project_id: null,   // Si es un proyecto nuevo de OpenProject
            categoria_id: 1,    // ID de categoría por defecto
            estatus_id: 1,      // 1 suele ser "Nuevo" o "Activo"
            carrera_id: 1,      // Ajustar según la carrera del estudiante
            estado_id: 1,       // Estado administrativo
            area_id: 1          // Área de investigación
        };

        const respuesta = await fetch(`${API_BASE_URL}/projects/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();

        if (respuesta.ok && data.exito) {
            mostrarMensaje("¡Registrado!", "El proyecto se guardó en la tabla correctamente.", "success", data.proyecto);
            event.target.reset();
        } else {
            // Si el servidor responde con error de base de datos
            throw new Error(data.error || "Error de integridad en la base de datos");
        }

    } catch (error) {
        console.error("DEBUG:", error);
        mostrarMensaje("Error de Guardado", error.message, "error");
    } finally {
        if (boton) {
            boton.disabled = false;
            boton.innerText = "Guardar en Base de Datos";
        }
    }
}

// --- FUNCIONES DE SOPORTE ---

function mostrarMensaje(titulo, texto, tipo, proyecto = null) {
    const contenedor = document.getElementById('mensajeResultado');
    if (!contenedor) return;

    contenedor.style.display = 'block';
    contenedor.className = `mensaje-resultado ${tipo}`;
    document.getElementById('tituloResultado').textContent = titulo;
    document.getElementById('textoResultado').textContent = texto;

    const detalles = document.getElementById('detallesProyecto');
    if (proyecto && detalles) {
        detalles.style.display = 'block';
        document.getElementById('proyectoId').textContent = proyecto.id || 'Generado';
        document.getElementById('proyectoNombre').textContent = proyecto.nombre || 'N/A';
    }
}

function prepararCamposOpenProject() {
    const fInicio = document.getElementById('fecha_inicio');
    const hoy = new Date().toISOString().split('T')[0];
    if (fInicio) { fInicio.value = hoy; fInicio.min = hoy; }
}

// Añade esto al final de tu script-unificado.js
function cerrarMensaje() {
    const contenedor = document.getElementById('mensajeResultado');
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}
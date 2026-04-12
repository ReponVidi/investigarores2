/**
 * Módulo de Control y Seguridad (Esquema CORE)
 * Lógica para la extracción y visualización de auditoría dinámica
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Módulo CORE: Inicializando sistema de auditoría...');
    
    // Definición de las instrucciones (tablas en el esquema CORE)
    // Estos nombres deben coincidir exactamente con los que definimos en el server.js
    const configuracionAuditoria = [
        { 
            htmlId: 'table-registro-proyecto', 
            endpoint: 'registrar_proyecto',
            titulo: 'Registro de Proyectos'
        },
        { 
            htmlId: 'table-actualizar-proyecto', 
            endpoint: 'actualizar_proyecto',
            titulo: 'Actualización de Proyectos'
        },
        { 
            htmlId: 'table-eliminar-usuario', 
            endpoint: 'eliminar_usuario',
            titulo: 'Eliminación de Usuarios'
        }
    ];

    // Cargar datos inicialmente
    cargarTodasLasTablas(configuracionAuditoria);

    // Opcional: Refrescar datos cada 30 segundos
    // setInterval(() => cargarTodasLasTablas(configuracionAuditoria), 30000);
});

/**
 * Itera sobre la configuración para poblar cada tabla HTML
 */
async function cargarTodasLasTablas(configuraciones) {
    for (const config of configuraciones) {
        await fetchYRenderizarCore(config.htmlId, config.endpoint);
    }
}

/**
 * Realiza la petición al Backend y construye las filas de la tabla
 */
async function fetchYRenderizarCore(htmlId, endpoint) {
    const tableBody = document.querySelector(`#${htmlId} tbody`);
    if (!tableBody) return;

    try {
        // Petición al endpoint que creamos en server.js
        const response = await fetch(`http://localhost:3000/api/core/audit/${endpoint}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            tableBody.innerHTML = ''; // Limpiar mensajes de carga

            result.data.forEach(registro => {
                const row = document.createElement('tr');
                
                // Formatear la fecha para que sea legible
                const fecha = new Date(registro.fecha_hora).toLocaleString('es-VE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                // Determinar el color del badge según la acción
                const badgeClass = determinarClaseBadge(endpoint);
                const etiquetaAccion = endpoint.replace('_', ' ').toUpperCase();

                row.innerHTML = `
                    <td>${fecha}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user-circle" style="color: #666;"></i>
                            <strong>${registro.usuario_login || registro.username || 'Sistema'}</strong>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${badgeClass}">${etiquetaAccion}</span>
                    </td>
                    <td class="detalles-celda">
                        ${registro.detalles || 'Ejecución de instrucción estándar del módulo.'}
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #999; padding: 20px;">
                        <i class="fas fa-info-circle"></i> No hay registros para esta instrucción aún.
                    </td>
                </tr>`;
        }
    } catch (error) {
        console.error(`Error en CORE (${endpoint}):`, error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--danger); padding: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> Error al conectar con el servidor CORE.
                </td>
            </tr>`;
    }
}

/**
 * Asigna estilos CSS basados en el tipo de operación
 */
function determinarClaseBadge(endpoint) {
    if (endpoint.includes('registrar') || endpoint.includes('guardar')) {
        return 'badge-insert'; // Verde (definido en control.css)
    }
    if (endpoint.includes('eliminar')) {
        return 'badge-delete'; // Rojo (definido en control.css)
    }
    if (endpoint.includes('actualizar')) {
        return 'badge-update'; // Azul/Amarillo
    }
    return '';
}
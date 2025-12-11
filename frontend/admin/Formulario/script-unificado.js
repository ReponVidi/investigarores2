// ============================================
// FUNCIONES PARA LAS PESTAÑAS
// ============================================

function abrirTab(tabName) {
    // Ocultar todas las pestañas
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabName).classList.add('active');
    
    // Actualizar botones de pestañas
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('onclick').includes(tabName)) {
            button.classList.add('active');
        }
    });
    
    // Limpiar mensajes de resultado si existen
    cerrarMensaje();
}

// ============================================
// FUNCIONES PARA LA FICHA TÉCNICA
// ============================================

// Inicializar eventos para la ficha técnica
document.addEventListener('DOMContentLoaded', function() {
    // Evento de envío del formulario de ficha técnica
    const fichaForm = document.getElementById('fichaTecnicaForm');
    if (fichaForm) {
        fichaForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validar fechas
            const fechaInicio = new Date(document.getElementById('fechaInicio').value);
            const fechaFin = new Date(document.getElementById('fechaFin').value);

            if (fechaFin < fechaInicio) {
                alert('La fecha de finalización no puede ser anterior a la fecha de inicio.');
                return;
            }

            // Guardar en localStorage (opcional)
            guardarEnLocalStorage();

            // Generar PDF automáticamente
            generarPDF();

            alert('¡Ficha técnica guardada y PDF generado exitosamente!');
            limpiarFormulario();
        });
    }

    // Delegación: escucha clics solo en los botones X de objetivos
    const objetivosContainer = document.getElementById("objetivos-especificos-container");
    if (objetivosContainer) {
        objetivosContainer.addEventListener("click", function(e) {
            if (e.target.classList.contains("remove-btn")) {
                e.target.parentElement.remove();
            }
        });
    }

    // Inicializar formulario de OpenProject
    inicializarFormularioOpenProject();
});

// Función para agregar integrante al equipo
function agregarIntegrante() {
    const container = document.getElementById("equipoContainer");

    const div = document.createElement("div");
    div.classList.add("equipo-item");

    div.innerHTML = `
        <input type="text" name="equipoTrabajo[]" placeholder="Nombre del integrante">
        <button type="button" class="btn-remove" onclick="eliminarIntegrante(this)">−</button>
    `;

    container.appendChild(div);
}

function eliminarIntegrante(button) {
    button.parentElement.remove();
}

// Función para agregar un nuevo objetivo
function addObjetivo() {
    let container = document.getElementById("objetivos-especificos-container");

    let div = document.createElement("div");
    div.className = "objetivo-item";
    div.style = "display:flex; gap:10px; margin-bottom:5px;";

    div.innerHTML = `
        <input type="text" name="objetivos_especificos[]" class="form-control" placeholder="Escribe un objetivo específico">
        <button type="button" class="btn btn-danger remove-btn">X</button>
    `;

    container.appendChild(div);
}

// Función opcional para guardar en localStorage
function guardarEnLocalStorage() {
    const formData = new FormData(document.getElementById('fichaTecnicaForm'));
    const datos = Object.fromEntries(formData.entries());

    // Guardar en localStorage
    const fichasGuardadas = JSON.parse(localStorage.getItem('fichasTecnicas') || '[]');
    fichasGuardadas.push({
        ...datos,
        fechaCreacion: new Date().toISOString(),
        id: Date.now()
    });
    localStorage.setItem('fichasTecnicas', JSON.stringify(fichasGuardadas));
}

function limpiarFormulario() {
    if (confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos.')) {
        document.getElementById('fichaTecnicaForm').reset();
    }
}

// ============================================
// FUNCIONES PARA GENERAR PDF (Ficha Técnica)
// ============================================

function generarPDF() {
    const formData = new FormData(document.getElementById('fichaTecnicaForm'));
    const datos = Object.fromEntries(formData.entries());

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración
    const margin = 15;
    let yPosition = margin;

    // PORTADA
    doc.setFillColor(26, 95, 20);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Ficha Técnica - Proyecto Especial UNEFA', 105, 25, { align: 'center' });

    yPosition = 50;

    // SECCIÓN 1: DATOS DE LA UNIDAD
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('DATOS DE LA UNIDAD QUE POSTULA', margin, yPosition);
    yPosition += 10;

    // Tabla de datos de unidad
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);

    const filasUnidad = [
        ['UNIDAD', datos.unidad || 'XXXXXXXXXXXXXXXX'],
        ['GRADO', datos.grado || 'XXXXXXXXXXXXXXXX'],
        ['B. DATOS DEL LÍDER DEL PROYECTO', datos.liderProyecto || 'XXXXXXXXXXXXXXXX'],
        ['C. DATOS DEL PROYECTO', datos.tituloProyecto || 'XXXXXXXXXXXXXXXX']
    ];

    filasUnidad.forEach((fila, index) => {
        const y = yPosition + (index * 8);
        doc.line(margin, y, 195, y);
        doc.line(margin, y, margin, y + 8);
        doc.line(105, y, 105, y + 8);
        doc.line(195, y, 195, y + 8);

        doc.text(fila[0], margin + 2, y + 5);
        doc.text(fila[1], 107, y + 5);
    });

    yPosition += (filasUnidad.length * 8) + 15;

    // SECCIÓN 2: DATOS ADICIONALES EN TABLA
    const filasAdicionales = [
        ['ADSCRIPCIÓN', datos.adscripcion || 'XXXXXXXXXXXXXXXX'],
        ['NOMBRES Y APELLIDOS', datos.nombresApellidos || 'XXXXXXXXXXXXXXXX'],
        ['TELÉFONO MÓVIL', datos.telefono || 'XXXXXXXXXXXXXXXX'],
        ['OBJETIVO GENERAL', datos.objetivoGeneral || 'XXXXXXXXXXXXXXXX'],
        ['ALCANCE', datos.alcance || 'XXXXXXXXXXXXXXXX']
    ];

    filasAdicionales.forEach((fila, index) => {
        const y = yPosition + (index * 8);
        doc.line(margin, y, 195, y);
        doc.line(margin, y, margin, y + 8);
        doc.line(105, y, 105, y + 8);
        doc.line(195, y, 195, y + 8);

        doc.text(fila[0], margin + 2, y + 5);
        doc.text(fila[1], 107, y + 5);
    });

    yPosition += (filasAdicionales.length * 8) + 20;

    // SECCIÓN 3: LISTA DE CARACTERÍSTICAS
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('CARACTERÍSTICAS DEL PROYECTO:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const caracteristicas = [
        datos.caracteristica1 || 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
        datos.caracteristica2 || 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
        datos.caracteristica3 || 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
        datos.caracteristica4 || 'XXXXXXXXXXXXXXXXXXXXXXXXXXX'
    ];

    caracteristicas.forEach(caracteristica => {
        doc.text('• ' + caracteristica, margin, yPosition);
        yPosition += 6;
    });

    yPosition += 10;

    // Descripción de beneficios
    doc.text('Debe describir el monto de beneficio (ventajas, reducción de costos y si aplica el caso,', margin, yPosition);
    yPosition += 5;
    doc.text('la comparación con los productos existentes). Explicar las ventajas monetarias que el', margin, yPosition);
    yPosition += 5;
    doc.text('proyecto representa.', margin, yPosition);
    yPosition += 15;

    // SECCIÓN 4: JUSTIFICACIÓN
    if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('JUSTIFICACIÓN', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const justificacion = datos.justificacion || 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const lineasJustificacion = doc.splitTextToSize(justificacion, 180);

    lineasJustificacion.forEach(linea => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text('• ' + linea, margin, yPosition);
        yPosition += 5;
    });

    yPosition += 10;

    // SECCIÓN 5: TIPO DE PROYECTO
    if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('TIPO DE PROYECTO', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const tiposProyecto = [
        '• Investigación básica / Investigación Aplicada / Desarrollo Experimental.',
        datos.tipoProyecto1 || 'XXXXXXXXXXXXXXXXXXXXXXXX',
        datos.tipoProyecto2 || 'XXXXXXXXXXXXXXXXXXXXXXXX',
        datos.tipoProyecto3 || 'XXXXXXXXXXXXXXXXXXXXXXXX'
    ];

    tiposProyecto.forEach(tipo => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text(tipo, margin, yPosition);
        yPosition += 6;
    });

    yPosition += 10;

    // SECCIÓN 6: MONTO SOLICITADO
    if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('MONTO SOLICITADO', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const montoItems = [
        '• ' + (datos.montoPrototipo || 'XXXXXXXXXX') + ' x (01) Prototipo',
        '• ' + (datos.duracionProyecto || 'XX MESES/AÑOS')
    ];

    montoItems.forEach(item => {
        doc.text(item, margin, yPosition);
        yPosition += 6;
    });

    yPosition += 10;

    // SECCIÓN 7: ACTORES
    if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('ACTORES', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const actores = [
        datos.actor1 || 'XXXXXXXXXXX',
        datos.actor2 || 'XXXXXXXXXXXXXXXX',
        datos.actor3 || 'XXXXXXXXXXXXXXXXXXXXXXXX',
        datos.actor4 || 'XXXXXXXXXXXXXXXXXXXXXXXX',
        datos.actor5 || 'XXXXXXXXXXXXXXXXXXXXXXXX'
    ];

    actores.forEach(actor => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text('• ' + actor, margin, yPosition);
        yPosition += 6;
    });

    // PIE DE PÁGINA
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
    }

    // Descargar PDF
    doc.save(`Ficha_Tecnica_${datos.codigoProyecto || 'UNEFA'}.pdf`);
}

// ============================================
// FUNCIONES PARA OPENPROJECT
// ============================================

function inicializarFormularioOpenProject() {
    // Cargar el nombre del usuario autenticado
    cargarNombreUsuario();
    
    // Configurar fecha mínima para fecha de inicio (hoy)
    const fechaInicioOP = document.getElementById('fechaInicioOP');
    const fechaFinOP = document.getElementById('fechaFinOP');
    
    if (fechaInicioOP) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInicioOP.min = hoy;
        fechaInicioOP.value = hoy;
        
        // Cuando se cambia la fecha de inicio, actualizar fecha mínima de fin
        fechaInicioOP.addEventListener('change', function() {
            fechaFinOP.min = this.value;
        });
    }
    
    // Generar identificador automático al cambiar el nombre
    const nombreInputOP = document.getElementById('nombreProyectoOP');
    if (nombreInputOP) {
        nombreInputOP.addEventListener('blur', function() {
            const identificadorInput = document.getElementById('identificador');
            
            // Solo generar automáticamente si el campo identificador está vacío
            if (this.value.trim() && !identificadorInput.value.trim()) {
                const identificadorGenerado = generarIdentificadorAutomatico(this.value);
                identificadorInput.value = identificadorGenerado;
                mostrarMensajeTemporal(`✓ Identificador sugerido: ${identificadorGenerado}`, 'success');
            }
        });
    }
    
    // Validación en tiempo real del identificador
    const identificadorInput = document.getElementById('identificador');
    if (identificadorInput) {
        identificadorInput.addEventListener('input', function() {
            validarIdentificadorEnTiempoReal(this.value);
        });
    }
    
    // Manejar envío del formulario de OpenProject
    const formOP = document.getElementById('crearProyectoForm');
    if (formOP) {
        formOP.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar formulario
            if (!validarFormularioOpenProject()) {
                return;
            }
            
            // Mostrar carga
            const btnCrear = document.getElementById('btnCrear');
            const originalText = btnCrear.innerHTML;
            btnCrear.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando Proyecto...';
            btnCrear.disabled = true;
            
            try {
                // Obtener datos MINIMALES del formulario
                const datosProyecto = obtenerDatosFormularioOpenProject();
                
                console.log("📤 Enviando datos:", datosProyecto);
                
                // Crear proyecto en OpenProject
                const resultado = await crearProyectoOpenProject(datosProyecto);
                
                // Mostrar resultado
                mostrarResultadoOpenProject(resultado);
                
                // Limpiar formulario si fue exitoso
                if (resultado.exito) {
                    limpiarFormularioOP();
                }
                
            } catch (error) {
                console.error('Error en el frontend:', error);
                mostrarResultadoOpenProject({
                    exito: false,
                    mensaje: 'Error al conectar con el servidor',
                    error: error.message
                });
            } finally {
                // Restaurar botón
                btnCrear.innerHTML = originalText;
                btnCrear.disabled = false;
            }
        });
    }
}

// Función para generar identificador automático válido para OpenProject
function generarIdentificadorAutomatico(nombreProyecto) {
    if (!nombreProyecto || nombreProyecto.trim() === '') {
        return 'proyecto-' + Date.now().toString().slice(-6);
    }
    
    let identificador = nombreProyecto.toLowerCase().trim();
    
    identificador = identificador
        .replace(/ñ/g, 'n')
        .replace(/[áäàâ]/g, 'a')
        .replace(/[éëèê]/g, 'e')
        .replace(/[íïìî]/g, 'i')
        .replace(/[óöòô]/g, 'o')
        .replace(/[úüùû]/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, ' ')
        .trim();
    
    identificador = identificador.replace(/\s+/g, '-');
    
    if (!/^[a-z]/.test(identificador)) {
        identificador = 'proyecto-' + identificador;
    }
    
    if (identificador.length > 30) {
        identificador = identificador.substring(0, 30);
    }
    
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    identificador = identificador + '-' + randomSuffix;
    
    identificador = identificador
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    return identificador;
}

function generarIdentificador() {
    const nombreInput = document.getElementById('nombreProyectoOP');
    const identificadorInput = document.getElementById('identificador');
    
    if (!nombreInput.value.trim()) {
        mostrarMensajeTemporal('⚠️ Primero escribe el nombre del proyecto', 'error');
        nombreInput.focus();
        return;
    }
    
    const identificadorGenerado = generarIdentificadorAutomatico(nombreInput.value);
    identificadorInput.value = identificadorGenerado;
    
    mostrarMensajeTemporal(`✓ Identificador generado: ${identificadorGenerado}`, 'success');
}

// Función para mostrar mensajes temporales
function mostrarMensajeTemporal(mensaje, tipo = 'success') {
    const mensajesAnteriores = document.querySelectorAll('.mensaje-temporal');
    mensajesAnteriores.forEach(msg => msg.remove());
    
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-temporal mensaje-${tipo}`;
    mensajeDiv.innerHTML = mensaje;
    mensajeDiv.style.cssText = `
        padding: 8px 12px;
        margin: 8px 0;
        border-radius: 4px;
        font-size: 14px;
        animation: fadeIn 0.3s ease-in;
    `;
    
    if (tipo === 'success') {
        mensajeDiv.style.backgroundColor = '#d4edda';
        mensajeDiv.style.color = '#155724';
        mensajeDiv.style.border = '1px solid #c3e6cb';
    } else {
        mensajeDiv.style.backgroundColor = '#f8d7da';
        mensajeDiv.style.color = '#721c24';
        mensajeDiv.style.border = '1px solid #f5c6cb';
    }
    
    const identificadorGroup = document.querySelector('.form-group label[for="identificador"]')?.parentNode;
    if (identificadorGroup) {
        identificadorGroup.appendChild(mensajeDiv);
    }
    
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.style.opacity = '0';
            mensajeDiv.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (mensajeDiv.parentNode) {
                    mensajeDiv.parentNode.removeChild(mensajeDiv);
                }
            }, 500);
        }
    }, 4000);
}

// Función para cargar el nombre del usuario autenticado
async function cargarNombreUsuario() {
    try {
        const response = await fetch('http://localhost:4000/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            const nombreCompleto = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            const creadorInput = document.getElementById('creador');
            
            if (nombreCompleto && creadorInput) {
                creadorInput.value = nombreCompleto;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

function validarIdentificadorEnTiempoReal(identificador) {
    const identificadorRegex = /^[a-z][a-z0-9\-]*$/;
    
    if (!identificador) {
        return true;
    }
    
    const esValido = (
        /^[a-z]/.test(identificador) &&
        identificadorRegex.test(identificador) &&
        !identificador.endsWith('-') &&
        identificador.length >= 3 &&
        identificador.length <= 100
    );
    
    const inputElement = document.getElementById('identificador');
    if (inputElement) {
        if (esValido) {
            inputElement.style.borderColor = '#4CAF50';
        } else {
            inputElement.style.borderColor = '#f44336';
        }
    }
    
    return esValido;
}

function validarFormularioOpenProject() {
    const nombre = document.getElementById('nombreProyectoOP').value.trim();
    const identificador = document.getElementById('identificador').value.trim();
    const responsable = document.getElementById('responsable').value.trim();
    
    const identificadorRegex = /^[a-z][a-z0-9\-]*$/;
    
    if (!nombre) {
        mostrarMensajeTemporal('⚠️ El nombre del proyecto es obligatorio', 'error');
        return false;
    }
    
    if (!identificador) {
        mostrarMensajeTemporal('⚠️ El identificador es obligatorio', 'error');
        return false;
    }
    
    if (!/^[a-z]/.test(identificador)) {
        mostrarMensajeTemporal('❌ El identificador debe comenzar con una letra minúscula (a-z)', 'error');
        return false;
    }
    
    if (!identificadorRegex.test(identificador)) {
        mostrarMensajeTemporal('❌ Solo letras minúsculas (a-z), números (0-9) y guiones medios (-)', 'error');
        return false;
    }
    
    if (identificador.endsWith('-')) {
        mostrarMensajeTemporal('❌ El identificador no puede terminar con guión (-)', 'error');
        return false;
    }
    
    if (identificador.length < 3) {
        mostrarMensajeTemporal('❌ El identificador debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    if (identificador.length > 100) {
        mostrarMensajeTemporal('❌ El identificador no puede tener más de 100 caracteres', 'error');
        return false;
    }
    
    if (identificador.includes('--')) {
        mostrarMensajeTemporal('❌ El identificador no puede tener guiones consecutivos (--)', 'error');
        return false;
    }
    
    if (!responsable) {
        mostrarMensajeTemporal('⚠️ El responsable principal es obligatorio', 'error');
        return false;
    }
    
    const fechaInicio = document.getElementById('fechaInicioOP').value;
    const fechaFin = document.getElementById('fechaFinOP').value;
    
    if (fechaFin && fechaInicio > fechaFin) {
        mostrarMensajeTemporal('❌ La fecha de finalización no puede ser anterior a la fecha de inicio', 'error');
        return false;
    }
    
    return true;
}

function obtenerDatosFormularioOpenProject() {
    const nombre = document.getElementById('nombreProyectoOP').value.trim();
    const identificador = document.getElementById('identificador').value.trim();
    const descripcion = document.getElementById('descripcionOP').value.trim();
    const responsable = document.getElementById('responsable').value.trim();
    const creador = document.getElementById('creador').value.trim();
    const fechaInicio = document.getElementById('fechaInicioOP').value;
    const fechaFin = document.getElementById('fechaFinOP').value;
    
    const payload = {
        name: nombre,
        identifier: identificador
    };
    
    if (descripcion) {
        payload.description = descripcion;
    } else {
        payload.description = `Proyecto creado por: ${responsable || creador || 'Sistema'}`;
    }
    
    if (responsable) {
        payload.responsible = responsable;
    }
    
    if (creador) {
        payload.creator = creador;
    }
    
    if (fechaInicio) {
        payload.start_date = fechaInicio;
    }
    
    if (fechaFin) {
        payload.due_date = fechaFin;
    }
    
    return payload;
}

async function crearProyectoOpenProject(datosProyecto) {
    try {
        const response = await fetch('http://localhost:4000/projects/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(datosProyecto)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return {
                exito: true,
                mensaje: 'Proyecto creado exitosamente en OpenProject',
                proyecto: data.proyecto,
                openproject_url: data.openproject_url
            };
        } else {
            return {
                exito: false,
                mensaje: data.error || 'Error al crear el proyecto',
                detalles: data.detalles
            };
        }
        
    } catch (error) {
        throw error;
    }
}

function mostrarResultadoOpenProject(resultado) {
    const mensajeDiv = document.getElementById('mensajeResultado');
    const iconoDiv = document.getElementById('iconoResultado');
    const tituloDiv = document.getElementById('tituloResultado');
    const textoDiv = document.getElementById('textoResultado');
    const detallesDiv = document.getElementById('detallesProyecto');
    
    if (resultado.exito) {
        mensajeDiv.className = 'mensaje-resultado success';
        iconoDiv.innerHTML = '✓';
        tituloDiv.textContent = '¡Éxito!';
        textoDiv.textContent = resultado.mensaje;
        
        if (resultado.proyecto) {
            document.getElementById('proyectoId').textContent = resultado.proyecto.id || 'N/A';
            document.getElementById('proyectoNombre').textContent = resultado.proyecto.name || 'N/A';
            document.getElementById('proyectoIdentificador').textContent = resultado.proyecto.identifier || 'N/A';
            
            const openprojectURL = resultado.openproject_url || 'http://openproject.vidiprueba.com';
            const enlace = document.getElementById('proyectoEnlace');
            if (resultado.proyecto.identifier) {
                enlace.href = `${openprojectURL}/projects/${resultado.proyecto.identifier}`;
                enlace.textContent = `Abrir "${resultado.proyecto.identifier}" en OpenProject`;
            } else if (resultado.proyecto.id) {
                enlace.href = `${openprojectURL}/projects/${resultado.proyecto.id}`;
                enlace.textContent = `Abrir proyecto ID: ${resultado.proyecto.id} en OpenProject`;
            }
            
            detallesDiv.style.display = 'block';
        }
        
    } else {
        mensajeDiv.className = 'mensaje-resultado error';
        iconoDiv.innerHTML = '✗';
        tituloDiv.textContent = 'Error';
        textoDiv.textContent = resultado.mensaje;
        
        if (resultado.detalles) {
            textoDiv.innerHTML += `<br><small>Detalles: ${resultado.detalles}</small>`;
        }
        
        detallesDiv.style.display = 'none';
    }
    
    mensajeDiv.style.display = 'block';
}

function cerrarMensaje() {
    const mensajeDiv = document.getElementById('mensajeResultado');
    if (mensajeDiv) {
        mensajeDiv.style.display = 'none';
    }
}

function limpiarFormularioOP() {
    if (confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos.')) {
        document.getElementById('crearProyectoForm').reset();
        
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fechaInicioOP').value = hoy;
        document.getElementById('fechaFinOP').value = '';
        document.getElementById('fechaFinOP').min = hoy;
        
        cargarNombreUsuario();
    }
}

function volverAlPanel() {
    window.location.href = '../usuario.html';
}

function abrirTabDirectamente(tabName) {
            // Ocultar todas las pestañas
            var tabPanes = document.getElementsByClassName("tab-pane");
            for (var i = 0; i < tabPanes.length; i++) {
                tabPanes[i].classList.remove("active");
            }
            
            // Mostrar solo la pestaña que queremos
            var tabToShow = document.getElementById(tabName);
            if (tabToShow) {
                tabToShow.classList.add("active");
            }
            
            // También activar el botón correspondiente si es visible
            var tabButtons = document.getElementsByClassName("tab-button");
            for (var i = 0; i < tabButtons.length; i++) {
                tabButtons[i].classList.remove("active");
                if (tabButtons[i].onclick && tabButtons[i].onclick.toString().includes(tabName)) {
                    tabButtons[i].classList.add("active");
                }
            }
            
            // Cambiar título de la página
            document.title = "Crear Proyecto - OpenProject";
        }
        
        // Función para volver al panel de administración
        function volverAlPanel() {
            window.location.href = '../admin.html';
        }
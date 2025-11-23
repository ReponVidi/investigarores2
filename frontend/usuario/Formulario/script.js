
document.getElementById('fichaTecnicaForm').addEventListener('submit', function (e) {
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

function generarPDF() {
    const formData = new FormData(document.getElementById('fichaTecnicaForm'));
    const datos = Object.fromEntries(formData.entries());

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración
    const margin = 15;
    let yPosition = margin;

    // ==================== PORTADA ====================
    doc.setFillColor(26, 95, 20); // Verde UNEFA
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Ficha Técnica - Proyecto Especial UNEFA', 105, 25, { align: 'center' });

    yPosition = 50;

    // ==================== SECCIÓN 1: DATOS DE LA UNIDAD ====================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 95, 20);
    doc.text('DATOS DE LA UNIDAD QUE POSTULA', margin, yPosition);
    yPosition += 10;

    // Tabla de datos de unidad
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Líneas de la tabla
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);

    // Filas de la tabla
    const filasUnidad = [
        ['UNIDAD', datos.unidad || 'XXXXXXXXXXXXXXXX'],
        ['GRADO', datos.grado || 'XXXXXXXXXXXXXXXX'],
        ['B. DATOS DEL LÍDER DEL PROYECTO', datos.liderProyecto || 'XXXXXXXXXXXXXXXX'],
        ['C. DATOS DEL PROYECTO', datos.tituloProyecto || 'XXXXXXXXXXXXXXXX']
    ];

    filasUnidad.forEach((fila, index) => {
        const y = yPosition + (index * 8);
        doc.line(margin, y, 195, y); // Línea horizontal
        doc.line(margin, y, margin, y + 8); // Línea vertical izquierda
        doc.line(105, y, 105, y + 8); // Línea vertical central
        doc.line(195, y, 195, y + 8); // Línea vertical derecha

        doc.text(fila[0], margin + 2, y + 5);
        doc.text(fila[1], 107, y + 5);
    });

    yPosition += (filasUnidad.length * 8) + 15;

    // ==================== SECCIÓN 2: DATOS ADICIONALES EN TABLA ====================
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

    // ==================== SECCIÓN 3: LISTA DE CARACTERÍSTICAS ====================
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

    // ==================== SECCIÓN 4: JUSTIFICACIÓN ====================
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

    // ==================== SECCIÓN 5: TIPO DE PROYECTO ====================
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

    // ==================== SECCIÓN 6: MONTO SOLICITADO ====================
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

    // ==================== SECCIÓN 7: ACTORES ====================
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

    // ==================== PIE DE PÁGINA ====================
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



document.getElementById('fichaTecnicaForm').addEventListener('submit', function (e) {
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
document.getElementById('fechaInicio').addEventListener('change', function () {
    document.getElementById('fechaFin').min = this.value;
});


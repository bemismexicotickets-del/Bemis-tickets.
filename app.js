/**
 * BEMIS MÉXICO - UTILIDADES FRONTEND & EXPORTACIÓN SHEETJS
 * Archivo: app.js
 */

export function exportarTicketsAExcel(ticketsList) {
  if (typeof XLSX === 'undefined') {
    alert('Error: La librería SheetJS (xlsx.full.min.js) no está disponible en la página.');
    return;
  }

  const rows = ticketsList.map(t => {
    // Cálculo de días transcurridos
    let dias = t.diasTranscurridos || 0;
    if (!dias && t.fechaTicket) {
      const start = new Date(t.fechaTicket);
      const end = t.fechaTermino ? new Date(t.fechaTermino) : new Date();
      dias = Math.max(0, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
    }

    // Columna Comentarios: Concatena solo el comentario en texto y el PORCENTAJE FINAL
    let comentariosFinal = '';
    const pct = t.porcentajeSatisfaccion !== undefined && t.porcentajeSatisfaccion !== null
      ? t.porcentajeSatisfaccion
      : t.encuestaDetalle?.porcentajeFinal !== undefined
      ? t.encuestaDetalle.porcentajeFinal
      : null;

    if (pct !== null) {
      comentariosFinal += `[Satisfacción: ${pct}%] `;
    }

    const userComment = t.comentarioUsuario || t.encuestaDetalle?.comentario;
    if (userComment) {
      comentariosFinal += userComment;
    }

    if (!comentariosFinal) {
      comentariosFinal = t.porcentajeHecho === 100 ? 'Sin comentarios registrados' : 'En atención técnica';
    }

    return {
      'Ticket': t.ticketId || t.id,
      'Usuario Ticket': t.usuario,
      'Nombre del reporte': t.nombreReporte,
      'Column4': t.column4 || '',
      'Prioridad': t.prioridad,
      'Departamento': t.departamento,
      'Categoria': t.categoria,
      'Seguimiento': t.seguimiento || 'Mario (Sistemas)',
      'Fecha de Ticket': t.fechaTicket,
      'Fecha Estimada': t.fechaEstimada || '',
      'Días transc.': dias,
      'Fecha de Termino': t.fechaTermino || (t.porcentajeHecho === 100 ? t.fechaEstimada : 'Pendiente'),
      '% Hecho': `${t.porcentajeHecho || 0}%`,
      'Comentarios': comentariosFinal
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Anchos exactos de las 14 columnas
  worksheet['!cols'] = [
    { wch: 12 }, // Ticket
    { wch: 16 }, // Usuario Ticket
    { wch: 38 }, // Nombre del reporte
    { wch: 10 }, // Column4
    { wch: 12 }, // Prioridad
    { wch: 16 }, // Departamento
    { wch: 22 }, // Categoria
    { wch: 20 }, // Seguimiento
    { wch: 15 }, // Fecha de Ticket
    { wch: 15 }, // Fecha Estimada
    { wch: 12 }, // Días transc.
    { wch: 16 }, // Fecha de Termino
    { wch: 10 }, // % Hecho
    { wch: 45 }  // Comentarios
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Tickets');

  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Reporte_Hrs(g)_Bemis_${fechaHoy}.xlsx`);
}

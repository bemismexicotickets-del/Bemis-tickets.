/**
 * BEMIS MÉXICO - UTILIDADES FRONTEND & EXPORTACIÓN/IMPORTACIÓN SHEETJS
 * Archivo: app.js
 */

export function exportarTicketsAExcel(ticketsList) {
  if (typeof XLSX === 'undefined') {
    alert('Error: La librería SheetJS no está disponible.');
    return;
  }

  // 1. Calcular número de semana actual para el encabezado
  const date = new Date();
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil(days / 7);
  const semText = `SEM${weekNumber}`;

  // 2. Construir la matriz EXACTA que pide el formato Bemis
  const wsData = [
    ['IT *LISTA DE PENDIENTES', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [semText, '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Ticket', 'Usuario Ticket', 'Nombre del reporte', 'Column4', 'Prioridad', 'Departamento', 'Categoria', 'Seguimiento', 'Fecha de Ticket', 'Fecha Estimada', 'Días transc.', 'Fecha de Termino', '% Hecho', 'Comentarios']
  ];

  // 3. Llenar filas dinámicas
  ticketsList.forEach(t => {
    let dias = t.diasTranscurridos || 0;
    if (!dias && t.fechaTicket) {
      const start = new Date(t.fechaTicket);
      const end = t.fechaTermino ? new Date(t.fechaTermino) : new Date();
      dias = Math.max(0, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
    }

    let comentariosFinal = '';
    const pct = t.porcentajeSatisfaccion !== undefined ? t.porcentajeSatisfaccion 
                : t.encuestaDetalle?.porcentajeFinal !== undefined ? t.encuestaDetalle.porcentajeFinal : null;
    if (pct !== null) comentariosFinal += `[Satisfacción: ${pct}%] `;
    
    const userComment = t.comentarioUsuario || t.encuestaDetalle?.comentario;
    if (userComment) comentariosFinal += userComment;
    if (!comentariosFinal) comentariosFinal = t.porcentajeHecho === 100 ? 'Sin comentarios registrados' : 'En atención técnica';

    wsData.push([
      t.ticketId || t.id,
      t.usuario,
      t.nombreReporte,
      t.column4 || '',
      t.prioridad || 'Media',
      t.departamento || '',
      t.categoria || '',
      t.seguimiento || 'Mario (Sistemas)',
      t.fechaTicket || '',
      t.fechaEstimada || '',
      dias,
      t.fechaTermino || (t.porcentajeHecho === 100 ? t.fechaEstimada : 'Pendiente'),
      t.porcentajeHecho || 0,
      comentariosFinal
    ]);
  });

  // 4. Crear hoja de Excel (aoa = array of arrays)
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // 5. Dimensiones exactas
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 38 }, { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, 
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 45 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Tickets');

  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Reporte_Hrs(g)_Bemis_${fechaHoy}.xlsx`);
}

// =========================================================
// LECTOR DE EXCEL HISTÓRICO PARA IMPORTACIÓN A FIREBASE
// =========================================================
export function procesarExcelImportacion(file, callbackExito) {
  if (typeof XLSX === 'undefined') {
    alert('Error: La librería SheetJS no está disponible.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // range: 2 se salta las dos primeras filas inútiles del formato de Bemis y lee desde la fila 3
      const rows = XLSX.utils.sheet_to_json(worksheet, { range: 2 });

      if (rows.length === 0) {
        alert("El archivo parece estar vacío o no coincide con el formato esperado.");
        return;
      }

      const ticketsProcesados = rows.map(r => {
        // Normalización de Fechas de Excel
        const formatDate = (val) => {
          if (!val) return "";
          if (val instanceof Date) return val.toISOString().split("T")[0];
          if (typeof val === 'number') { // Fecha serial de Excel antigua
             const d = new Date(Math.round((val - 25569) * 86400 * 1000));
             return d.toISOString().split("T")[0];
          }
          return String(val);
        };

        const pct = r['% Hecho'] !== undefined ? Number(r['% Hecho']) : 0;
        const statusVal = pct > 100 ? 100 : (pct < 0 ? 0 : pct);

        return {
          ticketId: String(r['Ticket'] || `TIK-OLD-${Math.floor(Math.random()*10000)}`),
          usuario: String(r['Usuario Ticket'] || "Usuario Desconocido"),
          usuarioUid: "",
          nombreReporte: String(r['Nombre del reporte'] || "Reporte Histórico"),
          descripcionDetallada: String(r['Comentarios'] || "Importado de Excel antiguo"),
          column4: String(r['Column4'] || ""),
          prioridad: String(r['Prioridad'] || "Media"),
          departamento: String(r['Departamento'] || "General"),
          categoria: String(r['Categoria'] || "General"),
          seguimiento: String(r['Seguimiento'] || "Mario (Sistemas)"),
          fechaTicket: formatDate(r['Fecha de Ticket']),
          fechaEstimada: formatDate(r['Fecha Estimada']),
          diasTranscurridos: Number(r['Días transc.'] || 0),
          fechaTermino: formatDate(r['Fecha de Termino']),
          porcentajeHecho: statusVal,
          encuestaRespondida: false 
        };
      });

      callbackExito(ticketsProcesados);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar el archivo Excel. Revisa que sea el formato correcto.");
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * BEMIS MÉXICO - UTILIDADES FRONTEND & EXPORTACIÓN/IMPORTACIÓN SHEETJS
 * Archivo: app.js
 */

function getWeekNumber(dateStr) {
  if (!dateStr) return '00';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '00';
  const dNum = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function exportarTicketsAExcel(ticketsList) {
  if (typeof XLSX === 'undefined') {
    alert('Error: La librería de Excel no está disponible.');
    return;
  }

  const sortedTickets = [...ticketsList].sort((a, b) => new Date(a.fechaTicket) - new Date(b.fechaTicket));

  const wsData = [];
  const headers = ['Ticket', 'Usuario Ticket', 'Nombre del reporte', 'Column4', 'Prioridad', 'Departamento', 'Categoria', 'Seguimiento', 'Fecha de Ticket', 'Fecha Estimada', 'Días transc.', 'Fecha de Termino', '% Hecho', 'Comentarios'];
  
  wsData.push(['IT *LISTA DE PENDIENTES', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  let currentWeek = null;

  sortedTickets.forEach(t => {
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

    const week = getWeekNumber(t.fechaTicket);
    
    if (week !== currentWeek) {
      currentWeek = week;
      wsData.push([`SEM${week}`, '', '', '', '', '', '', '', '', '', '', '', '', '']);
      wsData.push([...headers]);
    }

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

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for(let R = range.s.r; R <= range.e.r; ++R) {
    for(let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = {c:C, r:R};
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if(!worksheet[cell_ref]) continue;

      const cell = worksheet[cell_ref];
      const val = String(cell.v);

      let s = {
        font: { name: "Calibri", sz: 11 },
        border: {
          top: { style: "thin", color: { rgb: "BFBFBF" } }, bottom: { style: "thin", color: { rgb: "BFBFBF" } },
          left: { style: "thin", color: { rgb: "BFBFBF" } }, right: { style: "thin", color: { rgb: "BFBFBF" } }
        }
      };

      if (R === 0 && C === 0) {
         s.font = { name: "Calibri", sz: 12, bold: true };
      } else if (val.startsWith("SEM") && C === 0) {
         s.font = { name: "Calibri", sz: 12, bold: true };
         s.fill = { fgColor: { rgb: "D9D9D9" } }; 
      } else if (headers.includes(val) && R !== 0) {
         s.font = { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } };
         s.fill = { fgColor: { rgb: "1E3A8A" } }; 
         s.alignment = { horizontal: "center", vertical: "center" };
      } else if (R > 0) {
         if (C === 12 && val !== "% Hecho") {
            const num = Number(val);
            if (num === 100) s.fill = { fgColor: { rgb: "86EFAC" } }; 
            else s.fill = { fgColor: { rgb: "FDE047" } }; 
         }
      }
      cell.s = s;
    }
  }

  worksheet['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 45 }, { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, 
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 55 }
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
    alert('Error: La librería de Excel no está disponible.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, { range: 2 });

      if (rows.length === 0) {
        alert("El archivo está vacío o no coincide con el formato.");
        return;
      }

      const ticketsProcesados = rows.map(r => {
        const formatDate = (val) => {
          if (!val) return "";
          if (val instanceof Date) return val.toISOString().split("T")[0];
          if (typeof val === 'number') {
             const d = new Date(Math.round((val - 25569) * 86400 * 1000));
             return d.toISOString().split("T")[0];
          }
          return String(val);
        };

        const fApertura = formatDate(r['Fecha de Ticket']);
        const fCierre = formatDate(r['Fecha de Termino']);

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
          fechaTicket: fApertura,
          fechaEstimada: formatDate(r['Fecha Estimada']),
          fechaAperturaExacta: fApertura, // Sin hora, solo la fecha histórica
          diasTranscurridos: Number(r['Días transc.'] || 0),
          fechaTermino: fCierre,
          fechaCierreExacta: fCierre,
          porcentajeHecho: 100, // IMPORTANTE: Obligado a 100% finalizado
          porcentajeSatisfaccion: 100, 
          encuestaRespondida: true // Evita que se envíen encuestas viejas
        };
      });

      callbackExito(ticketsProcesados);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar el archivo Excel. Verifica que sea el formato original.");
    }
  };
  reader.readAsArrayBuffer(file);
}

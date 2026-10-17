/**
 * ==============================================================================
 * BEMIS MÉXICO - MESA DE AYUDA DE TI (SISTEMA DE TICKETS SERVERLESS)
 * BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * ==============================================================================
 * CREDENCIALES FIJAS DE SUPER ADMINISTRADOR:
 * Usuario: "Mario" | Contraseña: "425395"
 * ==============================================================================
 */

const SUPER_ADMIN = {
  usuario: "Mario",
  password: "425395",
  nombre: "Mario (Super Administrador)",
  departamento: "Sistemas",
  rol: "admin"
};

const SHEETS = {
  USUARIOS: "Usuarios",
  TICKETS: "Tickets",
  NOTICIAS: "Noticias",
  CONFIGURACION: "Configuracion",
  DEPARTAMENTOS: "Departamentos"
};

/** Manejador HTTP GET */
function doGet(e) {
  try {
    inicializarHojasSiNoExisten();
    const action = e.parameter.action || "ping";
    let result = {};

    switch (action) {
      case "ping":
        result = { success: true, message: "Bemis API activa", timestamp: new Date() };
        break;
      case "getConfig":
        result = { success: true, config: obtenerConfiguracion() };
        break;
      case "getTickets":
        result = { success: true, tickets: obtenerTodosLosTickets() };
        break;
      case "getDepartamentos":
        result = { success: true, departamentos: obtenerDepartamentos() };
        break;
      case "getNoticias":
        result = { success: true, noticias: obtenerNoticiasPorDepto(e.parameter.departamento || "") };
        break;
      case "getAllData":
        result = {
          success: true,
          config: obtenerConfiguracion(),
          departamentos: obtenerDepartamentos(),
          noticias: obtenerNoticias(),
          tickets: obtenerTodosLosTickets()
        };
        break;
      default:
        result = { success: false, error: "Acción GET no reconocida: " + action };
    }
    return crearRespuestaJSON(result);
  } catch (error) {
    return crearRespuestaJSON({ success: false, error: error.toString() });
  }
}

/** Manejador HTTP POST con CORS */
function doPost(e) {
  try {
    inicializarHojasSiNoExisten();
    let data = {};
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter; }
    } else {
      data = e.parameter;
    }

    const action = data.action || "";
    let result = {};

    switch (action) {
      // Módulo 1: Login y Gestión de Usuarios
      case "login":
        result = procesarLogin(data.username, data.password);
        break;
      case "cambiarPassword":
        result = cambiarPasswordUsuario(data.username, data.newPassword);
        break;
      case "crearUsuario":
        result = crearUsuario(data.user);
        break;
      case "eliminarUsuario":
        result = eliminarUsuario(data.username);
        break;
      case "getUsuarios":
        result = { success: true, usuarios: obtenerUsuarios() };
        break;

      // Departamentos
      case "crearDepartamento":
        result = crearDepartamento(data.nombre, data.descripcion);
        break;
      case "eliminarDepartamento":
        result = eliminarDepartamento(data.id);
        break;

      // Módulo 2: Noticias y Comunicados
      case "crearNoticia":
        result = crearNoticia(data.noticia);
        break;
      case "eliminarNoticia":
        result = eliminarNoticia(data.id);
        break;

      // Módulo 3: Tema Estacional
      case "setTema":
        result = guardarTemaEstacional(data.theme);
        break;

      // Módulo 4: Tickets y Encuesta de Satisfacción por Porcentaje (5 preguntas, cada estrella = 20 pts)
      case "crearTicket":
        result = crearTicket(data.ticket);
        break;
      case "actualizarTicket":
        result = actualizarTicket(data.ticket);
        break;
      case "responderEncuesta":
        result = registrarEncuestaSatisfaccion(
          data.ticketId,
          data.q1,
          data.q2,
          data.q3,
          data.q4,
          data.q5,
          data.porcentajeFinal,
          data.comentario
        );
        break;

      default:
        result = { success: false, error: "Acción POST no reconocida: " + action };
    }
    return crearRespuestaJSON(result);
  } catch (error) {
    return crearRespuestaJSON({ success: false, error: error.toString() });
  }
}

function crearRespuestaJSON(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Inicialización de hojas en Google Sheets: Las 14 columnas exactas */
function inicializarHojasSiNoExisten() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Usuarios
  let sheetUsers = ss.getSheetByName(SHEETS.USUARIOS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEETS.USUARIOS);
    sheetUsers.appendRow(["Usuario", "Nombre Completo", "Departamento", "Password", "Rol", "Requiere Cambio Pass", "Activo", "Fecha Creacion"]);
    sheetUsers.getRange("A1:H1").setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
    sheetUsers.appendRow([SUPER_ADMIN.usuario, SUPER_ADMIN.nombre, SUPER_ADMIN.departamento, SUPER_ADMIN.password, SUPER_ADMIN.rol, "NO", "SI", new Date()]);
    sheetUsers.appendRow(["ana.lopez", "Ana López", "Finanzas", "bemis123", "user", "SI", "SI", new Date()]);
  }

  // 2. Tickets (14 COLUMNAS EXACTAS REQUERIDAS DE REPORTE)
  let sheetTickets = ss.getSheetByName(SHEETS.TICKETS);
  if (!sheetTickets) {
    sheetTickets = ss.insertSheet(SHEETS.TICKETS);
    sheetTickets.appendRow([
      "Ticket", "Usuario Ticket", "Nombre del reporte", "Column4", "Prioridad",
      "Departamento", "Categoria", "Seguimiento", "Fecha de Ticket", "Fecha Estimada",
      "Días transc.", "Fecha de Termino", "% Hecho", "Comentarios"
    ]);
    sheetTickets.getRange("A1:N1").setFontWeight("bold").setBackground("#0052cc").setFontColor("#ffffff");
  }

  // 3. Noticias
  let sheetNoticias = ss.getSheetByName(SHEETS.NOTICIAS);
  if (!sheetNoticias) {
    sheetNoticias = ss.insertSheet(SHEETS.NOTICIAS);
    sheetNoticias.appendRow(["ID", "Titulo", "Contenido", "Fecha", "Es Global", "Departamento Destino", "Autor", "Importancia"]);
    sheetNoticias.getRange("A1:H1").setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
  }

  // 4. Departamentos
  let sheetDeptos = ss.getSheetByName(SHEETS.DEPARTAMENTOS);
  if (!sheetDeptos) {
    sheetDeptos = ss.insertSheet(SHEETS.DEPARTAMENTOS);
    sheetDeptos.appendRow(["ID", "Nombre", "Descripcion"]);
    sheetDeptos.getRange("A1:C1").setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
    const deptosDefault = [
      ["DEP-1", "Sistemas", "Tecnología y Soporte TI"],
      ["DEP-2", "Finanzas", "Contabilidad y Tesorería"],
      ["DEP-3", "Producción", "Manufactura e Inyección"],
      ["DEP-4", "Entrenamiento", "Capacitación y Desarrollo"],
      ["DEP-5", "Calidad", "Aseguramiento y Procesos"],
      ["DEP-6", "Recursos Humanos", "Talento Humano"]
    ];
    deptosDefault.forEach(d => sheetDeptos.appendRow(d));
  }

  // 5. Configuración
  let sheetConfig = ss.getSheetByName(SHEETS.CONFIGURACION);
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet(SHEETS.CONFIGURACION);
    sheetConfig.appendRow(["Clave", "Valor"]);
    sheetConfig.appendRow(["currentTheme", "estandar"]);
    sheetConfig.appendRow(["empresaNombre", "Bemis México"]);
  }
}

function procesarLogin(username, password) {
  if (username.trim().toLowerCase() === SUPER_ADMIN.usuario.toLowerCase()) {
    if (password === SUPER_ADMIN.password) {
      return { success: true, user: { username: "Mario", nombreCompleto: "Mario (Super Admin)", departamento: "Sistemas", role: "admin", requiereCambioPassword: false } };
    }
    return { success: false, error: "Contraseña incorrecta para Mario" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.trim().toLowerCase()) {
      if (String(data[i][3]) === password) {
        return {
          success: true,
          user: {
            username: data[i][0],
            nombreCompleto: data[i][1],
            departamento: data[i][2],
            role: data[i][4] || "user",
            requiereCambioPassword: String(data[i][5]).toUpperCase() === "SI"
          }
        };
      }
      return { success: false, error: "Contraseña incorrecta" };
    }
  }
  return { success: false, error: "Usuario no registrado" };
}

function cambiarPasswordUsuario(username, newPassword) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.toLowerCase()) {
      sheet.getRange(i + 1, 4).setValue(newPassword);
      sheet.getRange(i + 1, 6).setValue("NO");
      return { success: true };
    }
  }
  return { success: false, error: "Usuario no encontrado" };
}

function crearTicket(t) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.TICKETS);
  const id = "TIK-" + (1000 + sheet.getLastRow());
  const today = new Date().toISOString().split("T")[0];

  sheet.appendRow([
    id, t.usuario, t.nombreReporte, t.column4 || "", t.prioridad || "Media",
    t.departamento, t.categoria || "Soporte TI", t.seguimiento || "Mario (Sistemas)",
    today, t.fechaEstimada || today, 0, "", "0%", t.descripcionDetallada || ""
  ]);
  return { success: true, ticketId: id };
}

function actualizarTicket(t) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.TICKETS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(t.id)) {
      sheet.getRange(i + 1, 5).setValue(t.prioridad);
      sheet.getRange(i + 1, 8).setValue(t.seguimiento);
      sheet.getRange(i + 1, 10).setValue(t.fechaEstimada);
      sheet.getRange(i + 1, 12).setValue(t.fechaTermino);
      sheet.getRange(i + 1, 13).setValue(t.porcentajeHecho + "%");
      return { success: true };
    }
  }
  return { success: false, error: "Ticket no encontrado" };
}

/**
 * Guarda la encuesta de 5 preguntas calculando el porcentaje total (cada estrella = 20 pts)
 * En la columna 14 ('Comentarios') solo concatena el comentario en texto y el porcentaje final
 * para no sobrecargar el Excel.
 */
function registrarEncuestaSatisfaccion(ticketId, q1, q2, q3, q4, q5, porcentajeFinal, comentario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.TICKETS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(ticketId)) {
      const row = i + 1;
      const textoFinal = "[Satisfacción: " + (porcentajeFinal || 100) + "%] " + (comentario || "Sin comentarios");
      sheet.getRange(row, 14).setValue(textoFinal);
      return { success: true, message: "Encuesta registrada con éxito" };
    }
  }
  return { success: false, error: "Ticket no encontrado para encuesta" };
}

function obtenerTodosLosTickets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.TICKETS);
  const data = sheet.getDataRange().getValues();
  const tickets = [];

  for (let i = 1; i < data.length; i++) {
    const comentarios = String(data[i][13] || "");
    const regexPct = /\[Satisfacción:\s*(\d+)%\]/i;
    const match = comentarios.match(regexPct);
    const porcentajeSatisfaccion = match ? parseInt(match[1]) : null;

    tickets.push({
      id: String(data[i][0]),
      usuario: String(data[i][1]),
      nombreReporte: String(data[i][2]),
      column4: String(data[i][3] || ""),
      prioridad: String(data[i][4]),
      departamento: String(data[i][5]),
      categoria: String(data[i][6]),
      seguimiento: String(data[i][7] || "Mario (Sistemas)"),
      fechaTicket: formatearFecha(data[i][8]),
      fechaEstimada: formatearFecha(data[i][9]),
      diasTranscurridos: Number(data[i][10] || 0),
      fechaTermino: formatearFecha(data[i][11]),
      porcentajeHecho: parsePorcentaje(data[i][12]),
      porcentajeSatisfaccion: porcentajeSatisfaccion,
      comentarioUsuario: comentarios.replace(regexPct, "").trim(),
      encuestaRespondida: porcentajeSatisfaccion !== null
    });
  }
  return tickets;
}

function guardarTemaEstacional(tema) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CONFIGURACION);
  sheet.getRange("B2").setValue(tema);
  return { success: true, currentTheme: tema };
}

function formatearFecha(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(val);
}

function parsePorcentaje(val) {
  if (typeof val === "number") return val;
  const str = String(val).replace("%", "").trim();
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

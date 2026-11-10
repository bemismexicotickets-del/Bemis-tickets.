/**
 * BEMIS MÉXICO - MÓDULO DE BASE DE DATOS CLOUD FIRESTORE v9
 */
import { db } from "./firebase-config.js";
import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, 
  deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// OBTENCIÓN DE DIRECCIÓN IP DEL CLIENTE
// ==========================================
let cachedClientIP = null;

export async function getClientIP() {
  if (cachedClientIP) return cachedClientIP;

  const endpoints = [
    "https://api.ipify.org?format=json",
    "https://ipwho.is/",
    "https://api.db-ip.com/v2/free/self"
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const ip = data.ip || data.ipAddress;
        if (ip) {
          cachedClientIP = ip;
          return ip;
        }
      }
    } catch (e) {
      // Intenta con el siguiente servicio si hay bloqueo de red
    }
  }

  return "IP no disponible";
}

// ==========================================
// HISTORIAL DE ACTIVIDAD (USUARIOS Y ADMINS)
// ==========================================
export async function logAdminAction(userName, actionDescription, rol = "Administrador") {
  try {
    const ip = await getClientIP();
    await addDoc(collection(db, "audit_logs"), {
      admin: userName || "Administrador",
      rol: rol,
      ip: ip,
      accion: actionDescription,
      fechaExacta: new Date().toLocaleString('es-MX'),
      creadoEn: serverTimestamp()
    });
  } catch (e) {
    console.error("Error guardando en historial:", e);
  }
}

export function subscribeToAuditLogs(callback) {
  const q = query(collection(db, "audit_logs"), orderBy("creadoEn", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ==========================================
// GESTIÓN DE TICKETS
// ==========================================
export async function createTicket(ticketData) {
  const ticketsSnap = await getDocs(collection(db, "tickets"));
  const count = ticketsSnap.size;
  const ticketId = `TIK-${1001 + count}`;
  const now = new Date();
  const ip = await getClientIP();

  const newTicket = {
    ticketId,
    usuario: ticketData.usuario,
    usuarioUid: ticketData.usuarioUid || "",
    ipUsuario: ip,
    nombreReporte: ticketData.nombreReporte,
    descripcionDetallada: ticketData.descripcionDetallada || "",
    column4: ticketData.column4 || "",
    prioridad: ticketData.prioridad || "Media",
    departamento: ticketData.departamento || "General",
    categoria: ticketData.categoria || "Soporte TI",
    seguimiento: ticketData.seguimiento || "Mario (Sistemas)",
    fechaTicket: now.toISOString().split("T")[0],
    fechaEstimada: ticketData.fechaEstimada || now.toISOString().split("T")[0],
    fechaAperturaExacta: now.toLocaleString('es-MX'),
    diasTranscurridos: 0,
    fechaTermino: "",
    fechaCierreExacta: "",
    porcentajeHecho: 0,
    encuestaRespondida: false,
    creadoEn: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "tickets"), newTicket);

  // Registrar automáticamente en el Historial cuando el usuario levanta el ticket
  try {
    await addDoc(collection(db, "audit_logs"), {
      admin: ticketData.usuario || "Usuario",
      rol: "Usuario",
      ip: ip,
      accion: `Levantó el ticket ${ticketId}: "${ticketData.nombreReporte}" (${ticketData.departamento || "General"})`,
      fechaExacta: now.toLocaleString('es-MX'),
      creadoEn: serverTimestamp()
    });
  } catch (e) {
    console.error("Error registrando ticket en historial:", e);
  }

  return { id: docRef.id, ticketId };
}

export async function updateTicket(docId, updateData) {
  const docRef = doc(db, "tickets", docId);
  await updateDoc(docRef, { ...updateData, actualizadoEn: serverTimestamp() });
}

export async function deleteTicket(docId) {
  await deleteDoc(doc(db, "tickets", docId));
}

export async function deleteAllTickets() {
  const snap = await getDocs(collection(db, "tickets"));
  const docs = snap.docs;
  const chunkSize = 400;
  
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function importarTicketsMasivos(ticketsList) {
  const ticketsRef = collection(db, "tickets");
  const chunkSize = 400;
  for (let i = 0; i < ticketsList.length; i += chunkSize) {
    const chunk = ticketsList.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(tData => {
      const newDocRef = doc(ticketsRef);
      batch.set(newDocRef, { ...tData, creadoEn: serverTimestamp() });
    });
    await batch.commit();
  }
  return ticketsList.length;
}

export function subscribeToTickets(callback) {
  const q = query(collection(db, "tickets"), orderBy("creadoEn", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function submitSatisfactionSurvey(docId, survey) {
  const docRef = doc(db, "tickets", docId);
  const scores = [survey.q1, survey.q2, survey.q3, survey.q4, survey.q5];
  const totalPercentage = Math.round(scores.reduce((a, b) => a + (b * 20), 0) / scores.length);

  await updateDoc(docRef, {
    encuestaRespondida: true,
    porcentajeSatisfaccion: totalPercentage,
    comentarioUsuario: survey.comentario || "",
    encuestaDetalle: { ...survey, porcentajeFinal: totalPercentage },
    actualizadoEn: serverTimestamp()
  });
  return { success: true, totalPercentage };
}

// ==========================================
// NOTICIAS Y SETTINGS
// ==========================================
export async function createNews(newsData) {
  const newDoc = {
    ...newsData,
    fecha: new Date().toISOString().split("T")[0],
    departamentoDestino: newsData.esGlobal ? "TODOS" : (newsData.departamentoDestino || "General"),
    creadoEn: serverTimestamp()
  };
  return await addDoc(collection(db, "news"), newDoc);
}

export async function deleteNews(docId) {
  await deleteDoc(doc(db, "news", docId));
}

export function subscribeToNews(userDepartment, callback) {
  const q = query(collection(db, "news"), orderBy("fecha", "desc"));
  return onSnapshot(q, (snapshot) => {
    const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(all.filter(n => n.esGlobal || n.departamentoDestino === "TODOS" || (userDepartment && n.departamentoDestino.toLowerCase() === userDepartment.toLowerCase())));
  });
}

export function subscribeToGlobalTheme(callback) {
  return onSnapshot(doc(db, "settings", "theme"), (snap) => {
    if (snap.exists()) callback(snap.data().activeTheme || "estandar", snap.data().activeBg || "#f8f7f2");
    else callback("estandar", "#f8f7f2");
  });
}

export async function setGlobalTheme(themeName) {
  await setDoc(doc(db, "settings", "theme"), { activeTheme: themeName, actualizadoEn: serverTimestamp() }, { merge: true });
}

export async function setGlobalBackground(bgColor) {
  await setDoc(doc(db, "settings", "theme"), { activeBg: bgColor, actualizadoEn: serverTimestamp() }, { merge: true });
}

export async function getDepartments() {
  const snap = await getDocs(collection(db, "departments"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createDepartment(nombre, descripcion) {
  return await addDoc(collection(db, "departments"), { nombre, descripcion: descripcion || "", creadoEn: serverTimestamp() });
}

export async function deleteDepartment(docId) {
  await deleteDoc(doc(db, "departments", docId));
}

// ==========================================
// USUARIOS
// ==========================================
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveUserProfile(uid, userData) {
  await setDoc(doc(db, "users", uid), { ...userData, actualizadoEn: serverTimestamp() }, { merge: true });
}

export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, "users", uid));
}

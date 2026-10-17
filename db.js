/**
 * BEMIS MÉXICO - MÓDULO DE BASE DE DATOS CLOUD FIRESTORE v9
 * Archivo: db.js
 */

import { db } from "./firebase-config.js";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// 1. GESTIÓN DE TICKETS Y ENCUESTA
// ==========================================
export async function createTicket(ticketData) {
  // Generar ID correlativo amigable
  const ticketsSnap = await getDocs(collection(db, "tickets"));
  const count = ticketsSnap.size;
  const ticketId = `TIK-${1001 + count}`;

  const today = new Date().toISOString().split("T")[0];
  const newTicket = {
    ticketId,
    usuario: ticketData.usuario,
    usuarioUid: ticketData.usuarioUid || "",
    nombreReporte: ticketData.nombreReporte,
    descripcionDetallada: ticketData.descripcionDetallada || "",
    column4: ticketData.column4 || "",
    prioridad: ticketData.prioridad || "Media",
    departamento: ticketData.departamento || "General",
    categoria: ticketData.categoria || "Soporte TI",
    seguimiento: ticketData.seguimiento || "Mario (Sistemas)",
    fechaTicket: today,
    fechaEstimada: ticketData.fechaEstimada || today,
    diasTranscurridos: 0,
    fechaTermino: "",
    porcentajeHecho: 0,
    encuestaRespondida: false,
    creadoEn: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "tickets"), newTicket);
  return { id: docRef.id, ticketId };
}

export async function updateTicket(docId, updateData) {
  const docRef = doc(db, "tickets", docId);
  await updateDoc(docRef, {
    ...updateData,
    actualizadoEn: serverTimestamp()
  });
}

export async function deleteTicket(docId) {
  await deleteDoc(doc(db, "tickets", docId));
}

export async function getAllTickets() {
  const q = query(collection(db, "tickets"), orderBy("fechaTicket", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeToTickets(callback) {
  const q = query(collection(db, "tickets"), orderBy("fechaTicket", "desc"));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

/**
 * Guarda la encuesta de 5 preguntas (20 pts por estrella) en Firestore
 */
export async function submitSatisfactionSurvey(docId, survey) {
  const docRef = doc(db, "tickets", docId);

  // Cada estrella vale 20 puntos
  const scores = [survey.q1, survey.q2, survey.q3, survey.q4, survey.q5];
  const totalPercentage = Math.round(scores.reduce((a, b) => a + (b * 20), 0) / scores.length);

  await updateDoc(docRef, {
    encuestaRespondida: true,
    porcentajeSatisfaccion: totalPercentage,
    comentarioUsuario: survey.comentario || "",
    encuestaDetalle: {
      q1_rapidez: survey.q1,
      q2_comunicacion: survey.q2,
      q3_eficacia: survey.q3,
      q4_amabilidad: survey.q4,
      q5_general: survey.q5,
      porcentajeFinal: totalPercentage,
      comentario: survey.comentario || "",
      fechaRespuesta: new Date().toISOString().split("T")[0]
    },
    actualizadoEn: serverTimestamp()
  });

  return { success: true, totalPercentage };
}

// ==========================================
// 2. GESTIÓN DE NOTICIAS Y COMUNICADOS
// ==========================================
export async function createNews(newsData) {
  const newDoc = {
    titulo: newsData.titulo,
    contenido: newsData.contenido,
    fecha: new Date().toISOString().split("T")[0],
    esGlobal: !!newsData.esGlobal,
    departamentoDestino: newsData.esGlobal ? "TODOS" : (newsData.departamentoDestino || "General"),
    autor: newsData.autor || "Mario (Sistemas)",
    importancia: newsData.importancia || "Normal",
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
    const filtered = all.filter(n => 
      n.esGlobal || 
      n.departamentoDestino === "TODOS" || 
      (userDepartment && n.departamentoDestino.toLowerCase() === userDepartment.toLowerCase())
    );
    callback(filtered);
  });
}

// ==========================================
// 3. TEMA ESTACIONAL EN TIEMPO REAL (SETTINGS)
// ==========================================
export function subscribeToGlobalTheme(callback) {
  const themeDocRef = doc(db, "settings", "theme");
  return onSnapshot(themeDocRef, (snap) => {
    if (snap.exists() && snap.data().activeTheme) {
      callback(snap.data().activeTheme);
    } else {
      callback("estandar");
    }
  });
}

export async function setGlobalTheme(themeName) {
  const themeDocRef = doc(db, "settings", "theme");
  await setDoc(themeDocRef, {
    activeTheme: themeName,
    actualizadoEn: serverTimestamp()
  }, { merge: true });
}

// ==========================================
// 4. DEPARTAMENTOS
// ==========================================
export async function getDepartments() {
  const snap = await getDocs(collection(db, "departments"));
  if (snap.empty) {
    // Si no existen, sembrar los departamentos iniciales de Bemis
    const defaults = [
      { nombre: "Sistemas", descripcion: "Infraestructura y Soporte TI" },
      { nombre: "Finanzas", descripcion: "Contabilidad, Facturación y Tesorería" },
      { nombre: "Producción", descripcion: "Líneas de manufactura y empaque" },
      { nombre: "Entrenamiento", descripcion: "Capacitación y Desarrollo" },
      { nombre: "Calidad", descripcion: "Aseguramiento de procesos" },
      { nombre: "Recursos Humanos", descripcion: "Talento y Nóminas" },
      { nombre: "Logística", descripcion: "Embarques y Almacén" }
    ];
    for (const d of defaults) {
      await addDoc(collection(db, "departments"), d);
    }
    const reload = await getDocs(collection(db, "departments"));
    return reload.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createDepartment(nombre, descripcion) {
  return await addDoc(collection(db, "departments"), {
    nombre,
    descripcion: descripcion || "",
    creadoEn: serverTimestamp()
  });
}

export async function deleteDepartment(docId) {
  await deleteDoc(doc(db, "departments", docId));
}

// ==========================================
// 5. GESTIÓN DE USUARIOS (FIRESTORE)
// ==========================================
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveUserProfile(uid, userData) {
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, {
    ...userData,
    actualizadoEn: serverTimestamp()
  }, { merge: true });
}

export async function deleteUserProfile(uid) {
  await deleteDoc(doc(db, "users", uid));
}

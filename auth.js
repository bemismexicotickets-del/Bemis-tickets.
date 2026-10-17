/**
 * BEMIS MÉXICO - MÓDULO DE AUTENTICACIÓN FIREBASE v9
 * Archivo: auth.js
 */

import { 
  auth, 
  db, 
  ADMIN_EMAIL, 
  ADMIN_DEFAULT_PASS, 
  ADMIN_NAME 
} from "./firebase-config.js";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const LAST_EMAIL_KEY = "bemis_last_remembered_email";

/**
 * Obtiene el último correo recordado exclusivamente en este dispositivo
 */
export function getRememberedEmail() {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || "";
  } catch (e) {
    return "";
  }
}

/**
 * Guarda o limpia el correo recordado en este dispositivo
 */
export function setRememberedEmail(email) {
  try {
    if (email) {
      localStorage.setItem(LAST_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(LAST_EMAIL_KEY);
    }
  } catch (e) {}
}

/**
 * Iniciar sesión con Firebase Authentication
 */
export async function login(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  // Validación de Super Administrador Mario
  const isSuperAdmin = (cleanEmail === ADMIN_EMAIL.toLowerCase() || cleanEmail === "mario.ortiz@bemismfg.com");
  const targetEmail = isSuperAdmin ? ADMIN_EMAIL : cleanEmail;

  try {
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
    } catch (authError) {
      // Si el Super Admin Mario aún no existe en Auth y la contraseña es la maestra "425395", lo auto-crea
      if (isSuperAdmin && password === ADMIN_DEFAULT_PASS && (authError.code === "auth/user-not-found" || authError.code === "auth/invalid-credential")) {
        userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_DEFAULT_PASS);
      } else {
        throw authError;
      }
    }

    const user = userCredential.user;
    setRememberedEmail(targetEmail);

    // Obtener perfil en Firestore
    const userDocRef = doc(db, "users", user.uid);
    let userDocSnap = await getDoc(userDocRef);

    let userData = null;
    if (userDocSnap.exists()) {
      userData = userDocSnap.data();
    } else {
      // Crear documento inicial de perfil
      userData = {
        uid: user.uid,
        email: user.email,
        nombreCompleto: isSuperAdmin ? ADMIN_NAME : user.email.split("@")[0],
        departamento: isSuperAdmin ? "Sistemas" : "General",
        role: isSuperAdmin ? "admin" : "user",
        requiereCambioPassword: !isSuperAdmin,
        activo: true,
        creadoEn: new Date().toISOString()
      };
      await setDoc(userDocRef, userData);
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    let msg = "Error al autenticar. Verifica tu correo y contraseña.";
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
      msg = "Credenciales incorrectas. Verifica tu correo o contraseña.";
    } else if (error.code === "auth/invalid-email") {
      msg = "El formato de correo no es válido.";
    } else if (error.code === "auth/user-disabled") {
      msg = "Este usuario ha sido deshabilitado por el administrador.";
    }
    return { success: false, error: msg };
  }
}

/**
 * Cierre de sesión seguro
 */
export async function logout() {
  await signOut(auth);
  sessionStorage.removeItem("bemis_session_user");
}

/**
 * Cambio de contraseña obligatorio en primer inicio de sesión
 */
export async function changePassword(newPassword) {
  if (!auth.currentUser) throw new Error("No hay usuario autenticado");

  await updatePassword(auth.currentUser, newPassword);

  const userDocRef = doc(db, "users", auth.currentUser.uid);
  await updateDoc(userDocRef, {
    requiereCambioPassword: false,
    actualizadoEn: new Date().toISOString()
  });

  return { success: true };
}

/**
 * Observador de estado de autenticación de Firebase
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          callback(userDocSnap.data());
          return;
        }
      } catch (e) {
        console.error("Error al leer perfil de usuario:", e);
      }
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: firebaseUser.email === ADMIN_EMAIL ? "admin" : "user"
      });
    } else {
      callback(null);
    }
  });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración de tu proyecto
export const firebaseConfig = {
  apiKey: "AIzaSyAy0kp2bv1DMcXic2wKENd6ccYimD7_Cng",
  authDomain: "bemis-tickets.firebaseapp.com",
  projectId: "bemis-tickets",
  storageBucket: "bemis-tickets.firebasestorage.app",
  messagingSenderId: "1078875702585",
  appId: "1:1078875702585:web:f5bd0a3aaef9cc0bdc54e8",
  measurementId: "G-L97F4EFRNJ"
};

// Inicialización de servicios exportados
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Credenciales Maestras
export const ADMIN_EMAIL = "mario.ortiz@bemismfg.com";
export const ADMIN_NAME = "Mario (Super Administrador)";
export const ADMIN_DEFAULT_PASS = "425395";

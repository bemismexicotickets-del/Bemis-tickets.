/**
 * BEMIS MÉXICO - CONFIGURACIÓN DE FIREBASE v9 (SDK MODULAR CDN)
 * Archivo: firebase-config.js
 * Compatible con GitHub Pages mediante <script type="module">
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
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

// Configuración exacta proporcionada por Bemis México
export const firebaseConfig = {
  apiKey: "AIzaSyAyOkp2bv1DMcXic2wKENd6ccYimD7_Cng",
  authDomain: "bemis-tickets.firebaseapp.com",
  projectId: "bemis-tickets",
  storageBucket: "bemis-tickets.firebasestorage.app",
  messagingSenderId: "1078875702585",
  appId: "1:1078875702585:web:f5bd0a3aaef9cc0bdc54e8",
  measurementId: "G-L97F4EFRNJ"
};

// Inicialización de la app y servicios
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Constantes globales
export const ADMIN_EMAIL = "mario.ortiz@bemismfg.com";
export const ADMIN_NAME = "Mario (Super Administrador)";
export const ADMIN_DEFAULT_PASS = "425395";

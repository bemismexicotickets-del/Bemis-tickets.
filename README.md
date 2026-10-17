# 🎫 Bemis Tickets - Mesa de Ayuda TI
### Arquitectura Serverless: Firebase v9 (Auth + Firestore) & GitHub Pages

Sistema de soporte técnico de **Bemis México** con arquitectura 100% serverless, utilizando el SDK Modular de Firebase v9 por CDN y hosting estático en **GitHub Pages**.

---

## 📁 1. Estructura de Carpetas Recomendada para GitHub Pages

Sube estos archivos directamente en la raíz de tu repositorio de GitHub (rama `main`):

```text
mi-repositorio-bemis/
│
├── index.html            # Pantalla de Login con Firebase Auth y Fade-In suave
├── admin.html            # Panel de Super Administrador Mario (Firestore en tiempo real + SheetJS)
├── user.html             # Panel de Usuario (Creación de tickets, Sidebar de noticias y Encuesta de 5 preguntas)
│
├── firebase-config.js    # Credenciales de Firebase y exportación de app, auth y db
├── auth.js               # Módulo de Autenticación, cambio de contraseña y memoria local por dispositivo
├── db.js                 # Operaciones Firestore (Tickets, Noticias, Departamentos, Configuración en tiempo real)
├── app.js                # Exportación a Excel con SheetJS (14 columnas exactas)
├── animations.js         # Motor Canvas a 60fps para los 12 temas estacionales
│
└── README.md             # Guía de instalación y configuración
```

---

## 🔥 2. Configuración en la Consola de Firebase

El proyecto ya viene preconfigurado con las credenciales de tu proyecto `bemis-tickets`:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyAy0kp2bvlDMcXic2wKENd6ccYimD7_Cng",
  authDomain: "bemis-tickets.firebaseapp.com",
  projectId: "bemis-tickets",
  storageBucket: "bemis-tickets.firebasestorage.app",
  messagingSenderId: "1078875702585",
  appId: "1:1078875702585:web:f5bd0a3aaef9cc0bdc54e8",
  measurementId: "G-L97F4EFRNJ"
};
```

### Pasos en [Firebase Console](https://console.firebase.google.com/):
1. **Activar Authentication:**
   - Ve a **Authentication** ➔ **Sign-in method**.
   - Habilita el proveedor **Correo electrónico/Contraseña (Email/Password)**.
2. **Activar Cloud Firestore:**
   - Ve a **Firestore Database** ➔ **Crear base de datos**.
   - Inicia en modo producción o prueba.
3. **Reglas de Seguridad Recomendadas (`firestore.rules`):**

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    // Permitir lectura del tema global a todos los visitantes
    match /settings/theme {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🔑 3. Acceso de Super Administrador y Usuarios

- **Super Administrador:**
  - **Correo:** `mario@bemis.com`
  - **Contraseña Maestra:** `425395`
  - Al iniciar sesión con estas credenciales por primera vez, el sistema autoprovisiona el rol `admin` y da acceso a `admin.html`.
- **Acceso Rápido Seguro:**
  - En `index.html`, el sistema guarda en el `localStorage` del navegador **exclusivamente el último correo que inició sesión en ESE dispositivo en particular**.
  - Si otra persona usa el equipo, puede hacer clic en "✕" para ingresar con sus propias credenciales. No hay botones genéricos visibles para otros.

---

## ⭐ 4. Encuesta de Satisfacción por Porcentaje (5 Preguntas)

Cuando un ticket pasa a estatus **"Resuelto"**, se bloquea la vista del usuario hasta completar la encuesta de 5 preguntas:
1. **Tiempo de respuesta y atención inicial** (1-5 estrellas = 20-100 pts)
2. **Claridad y comunicación** (1-5 estrellas = 20-100 pts)
3. **Eficacia y resolución definitiva** (1-5 estrellas = 20-100 pts)
4. **Amabilidad y profesionalismo** (1-5 estrellas = 20-100 pts)
5. **Satisfacción global con TI Bemis** (1-5 estrellas = 20-100 pts)

**Puntaje Final:** Promedio exacto sumando las 5 preguntas. Se almacena en el documento del ticket en Firestore y se muestra tanto en el panel web como en el reporte de Excel.

---

## 📊 5. Exportación Exacta a Excel (.xlsx)

Cumple con la estructura de 14 columnas requerida:
1. `Ticket` (ID)
2. `Usuario Ticket`
3. `Nombre del reporte`
4. `Column4` (Vacía)
5. `Prioridad`
6. `Departamento`
7. `Categoria`
8. `Seguimiento`
9. `Fecha de Ticket`
10. `Fecha Estimada`
11. `Días transc.`
12. `Fecha de Termino`
13. `% Hecho`
14. `Comentarios` (Concatena `[Satisfacción: X%]` + Comentarios de calidad).

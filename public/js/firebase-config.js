// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCGW6kxIeHUrTEQQcBO6ZszAw0Y5NQ7T4o",
  authDomain: "taxtimew.firebaseapp.com",
  projectId: "taxtimew",
  storageBucket: "taxtimew.firebasestorage.app",
  messagingSenderId: "781789728181",
  appId: "1:781789728181:web:4eda8f41a536cb49335dfc"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// NUEVO: Activar Autenticación
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
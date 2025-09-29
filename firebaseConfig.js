// Configuración de Firebase para la app
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, initializeAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBeVaajLgEgmwPPfd2ubXtSDZo2ekkpb84",
  authDomain: "deviaje-75dbd.firebaseapp.com",
  projectId: "deviaje-75dbd",
  storageBucket: "deviaje-75dbd.firebasestorage.app",
  messagingSenderId: "335192450307",
  appId: "1:335192450307:web:4dfdbf068ec55972d67536",
  measurementId: "G-Q568P7WQ3F"
};

const app = initializeApp(firebaseConfig);
const analytics = Platform.OS === 'web' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const createUserEmailPassword = createUserWithEmailAndPassword;
export const signInEmailPassword = signInWithEmailAndPassword;
export const initAuth = initializeAuth;
export const db = getFirestore(app);

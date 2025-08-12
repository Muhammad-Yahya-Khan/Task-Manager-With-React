import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyC8YLTvPx8Ex3_E5tjBAsDfW-2LF4VHEY4",
	authDomain: "dashboard-b3e46.firebaseapp.com",
	projectId: "dashboard-b3e46",
	storageBucket: "dashboard-b3e46.firebasestorage.app",
	messagingSenderId: "833547949298",
	appId: "1:833547949298:web:20169ef9b205de95ea2c6b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, db };

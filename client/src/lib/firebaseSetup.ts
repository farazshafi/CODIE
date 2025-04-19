// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyD7fIyzKMr76Ky-AXvUo3Rv3dckwiFjjTo",
    authDomain: "earnest-mark-409910.firebaseapp.com",
    projectId: "earnest-mark-409910",
    storageBucket: "earnest-mark-409910.firebasestorage.app",
    messagingSenderId: "180259714983",
    appId: "1:180259714983:web:04644bb2b8cb15c0bf6882",
    measurementId: "G-YYY1XQZ3TH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const gProvider = new GoogleAuthProvider()
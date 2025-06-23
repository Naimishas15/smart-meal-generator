// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2CnFSmbY4RrMmglWa8e_HjglBK4awuuk",
  authDomain: "smartmealgenerator.firebaseapp.com",
  projectId: "smartmealgenerator",
  storageBucket: "smartmealgenerator.firebasestorage.app",
  messagingSenderId: "918948465109",
  appId: "1:918948465109:web:ddd0bb19869d653176955c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { signInWithPopup };

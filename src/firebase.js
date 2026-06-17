import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBEDXyQzVaK_tcbnGFBeoFIPDkH8K381CI",
  authDomain: "todfeed-app-61326.firebaseapp.com",
  projectId: "todfeed-app-61326",
  storageBucket: "todfeed-app-61326.firebasestorage.app",
  messagingSenderId: "921788139665",
  appId: "1:921788139665:web:c19e89c59dfdabaf291730",
  measurementId: "G-JR9DCTXEEZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

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
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics is not supported in this environment:", err);
});

// V-12: Initialize App Check (only in browser context)
if (typeof window !== 'undefined') {
  // Enable debug token for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Replace with your actual reCAPTCHA Enterprise site key from the Firebase Console
  const appCheckSiteKey = 'YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY';
  
  if (appCheckSiteKey && appCheckSiteKey !== 'YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY') {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log("Firebase App Check initialized successfully.");
    } catch (err) {
      console.warn("Failed to initialize Firebase App Check:", err);
    }
  } else {
    console.info("Firebase App Check site key not configured. Skipping App Check initialization.");
  }
}

export const googleProvider = new GoogleAuthProvider();

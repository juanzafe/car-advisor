import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { signInWithPopup, getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDr3WeyypBs7ccQAJAYqA9fLic1h85Sewk',
  authDomain: 'car-advisor-pro.firebaseapp.com',
  projectId: 'car-advisor-pro',
  storageBucket: 'car-advisor-pro.firebasestorage.app',
  messagingSenderId: '595109125478',
  appId: '1:595109125478:web:c462a594c4f74406357ca7',
  measurementId: 'G-7GYR1ZHXVM',
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Usuario logueado:', result.user.displayName);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
  }
};

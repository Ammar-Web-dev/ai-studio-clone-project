import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "GEMINI_API_KEY",
  authDomain: "clean-branch-fxfb9.firebaseapp.com",
  projectId: "clean-branch-fxfb9",
  storageBucket: "clean-branch-fxfb9.firebasestorage.app",
  messagingSenderId: "231477350122",
  appId: "1:231477350122:web:2c85442d7edb3935d79193"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the custom databaseId from the blueprint
const db = getFirestore(app, "ai-studio-foodpandaclone-d7217290-baa2-42ff-81f1-503d5b94f836");

const auth = getAuth(app);

export { app, auth, db };

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXYqecKRQpUTyDzpOU8GgyZETlgQuWKmQ",
  authDomain: "webproject-6d706.firebaseapp.com",
  projectId: "webproject-6d706",
  storageBucket: "webproject-6d706.firebasestorage.app",
  messagingSenderId: "369405151835",
  appId: "1:369405151835:web:b81077b8e794a99ff18d7e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
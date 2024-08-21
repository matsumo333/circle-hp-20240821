import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAG-WBgDSAF_V1P7S1cAGNBfOAOKRgflGo",
  authDomain: "circle-hp.firebaseapp.com",
  projectId: "circle-hp",
  storageBucket: "circle-hp.appspot.com",
  messagingSenderId: "247305075297",
  appId: "1:247305075297:web:134ff70d11329244ac0820",
  measurementId: "G-7Q6E6X9Q5T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

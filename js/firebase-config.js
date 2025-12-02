// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// Get this from: Firebase Console > Project Settings > Your Apps > Web App

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "sobat-hijau.firebaseapp.com",
  projectId: "sobat-hijau",
  storageBucket: "sobat-hijau.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = firebase.firestore();
const auth = firebase.auth();

console.log('Firebase initialized successfully');

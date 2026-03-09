/**
 * DevPanda — Firebase Analytics
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyBxP-emECTO4c6cnotmRrHTLYrDD9doNXg",
    authDomain: "devpanda-f04fa.firebaseapp.com",
    databaseURL: "https://devpanda-f04fa-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "devpanda-f04fa",
    storageBucket: "devpanda-f04fa.firebasestorage.app",
    messagingSenderId: "37266490214",
    appId: "1:37266490214:web:05a4353eee04b1ffebbea7",
    measurementId: "G-229SC67WFY"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

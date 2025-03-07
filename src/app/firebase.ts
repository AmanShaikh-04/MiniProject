import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCiAAF1IEOyB0R-tg-ZR73LY5MEOU4Kps",
  authDomain: "scms-e3b13.firebaseapp.com",
  projectId: "scms-e3b13",
  storageBucket: "scms-e3b13.firebasestorage.app",
  messagingSenderId: "723412926773",
  appId: "1:723412926773:web:8a29f94310be510586cc7c",
  measurementId: "G-7MBK0FMXL6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let analytics: any = null;
if (typeof window !== "undefined") {
  (async () => {
    try {
      const { getAnalytics, isSupported } = await import("firebase/analytics");
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    } catch (error) {
      console.error("Failed to load Firebase Analytics:", error);
    }
  })();
}

export { auth, db, analytics };
export default app;

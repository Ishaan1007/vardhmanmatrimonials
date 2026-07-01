import { initializeApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier, type Auth } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

const clientConfig: Partial<FirebaseClientConfig> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function initFirebaseClient() {
  if (!getApps().length) {
    const { apiKey, authDomain, projectId, appId } = clientConfig;
    if (!apiKey || !authDomain || !projectId || !appId) {
      return null;
    }
    initializeApp({ apiKey, authDomain, projectId, appId });
  }
  return getAuth();
}

export function createRecaptchaVerifier(auth: Auth, containerId = "recaptcha-container") {
  if (typeof window === "undefined") return null;
  
  // Clear previous verifier if it exists
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // ignore cleanup errors
    }
    window.recaptchaVerifier = null;
  }
  
  const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  window.recaptchaVerifier = verifier;
  return verifier;
}

export default initFirebaseClient;

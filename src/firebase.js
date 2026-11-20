import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "firebase/ai";

const e = import.meta.env;
const app = initializeApp({
  apiKey: e.VITE_FIREBASE_API_KEY,
  authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: e.VITE_FIREBASE_PROJECT_ID,
  storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: e.VITE_FIREBASE_APP_ID,
});

// App Check is required by the hackathon. In dev, a debug token is printed in the console.
if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(e.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

// The older default model (gemini-2.5-flash-lite) is no longer available to new projects.
const CLOUD_MODEL = "gemini-3.5-flash-lite";

const ai = getAI(app, { backend: new GoogleAIBackend() });

export const localModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  inCloudParams: { model: CLOUD_MODEL },
});
export const cloudModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
  inCloudParams: { model: CLOUD_MODEL },
});
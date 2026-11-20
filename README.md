# Private Reading Companion

A web app that summarizes, explains, or rewrites text using **Firebase AI Logic hybrid inference**:
short or private text runs on-device (Chrome's built-in model), long text goes to the cloud (Gemini).
Every result shows which path was used and why.

## Run it
1. Use desktop Chrome 139+ and enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, then restart Chrome.
2. In the Firebase console: AI Services > AI Logic > Get started > Gemini Developer API.
3. Register a Web app, copy its config into `.env` (see `.env.example`).
4. Create a reCAPTCHA Enterprise (Fraud Defense) website key, add it as `VITE_RECAPTCHA_SITE_KEY`, and register it under App Check using the Fraud Defense provider.
5. `npm install` then `npm run dev`. Copy the App Check debug token from the browser console into
   Firebase console > App Check > Apps > Manage debug tokens.

## How AI Logic is used
All generation goes through `getGenerativeModel` from `firebase/ai` (see `src/firebase.js`) with
`PREFER_ON_DEVICE` and `ONLY_IN_CLOUD` modes, chosen by the router in `src/main.js`.

License: MIT

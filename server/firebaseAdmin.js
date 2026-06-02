/**
 * firebaseAdmin.js
 * ─────────────────
 * Initialises the Firebase Admin SDK from environment variables.
 *
 * Required env vars (add to .env):
 *   FIREBASE_PROJECT_ID      – e.g. online-5ff89
 *   FIREBASE_CLIENT_EMAIL    – service-account client_email field
 *   FIREBASE_PRIVATE_KEY     – service-account private_key field (with literal \n)
 */

import "dotenv/config";
import admin from "firebase-admin";

const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// ── Validate before initialising ────────────────────────────────────────────
const missing = [];
if (!projectId)   missing.push("FIREBASE_PROJECT_ID");
if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
if (!privateKey)  missing.push("FIREBASE_PRIVATE_KEY");

if (missing.length) {
  console.error(
    "\n❌  Firebase Admin SDK: missing environment variable(s):\n" +
    missing.map((v) => `       ${v}`).join("\n") +
    "\n\n    Steps to fix:\n" +
    "    1. Go to Firebase Console → Project Settings → Service accounts\n" +
    "    2. Click \"Generate new private key\" and download the JSON file\n" +
    "    3. Copy the three values into your .env  (see .env.example)\n"
  );
  process.exit(1);
}

// ── Initialise (guard against double-init in watch mode) ─────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminAuth = admin.auth();
export const adminDb   = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;

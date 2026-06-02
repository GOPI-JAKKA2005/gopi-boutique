/**
 * setAdminUser.js
 * ---------------
 * Creates or promotes an account to admin role.
 *
 * Requirements: fill in .env at the project root (copy .env.example).
 * Then run:  npm run seed:admin
 */

import "dotenv/config";
import { adminAuth, adminDb, FieldValue } from "./firebaseAdmin.js";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error(
    "\n❌  Missing env vars.\n" +
    "    Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file, then re-run:\n" +
    "    npm run seed:admin\n"
  );
  process.exit(1);
}

// ── 1. Find or create the Firebase Auth user ──────────────────────────────────
let user;
try {
  user = await adminAuth.getUserByEmail(email);
  console.log(`✔  Found existing Firebase Auth user: ${email}`);
} catch (error) {
  if (error.code !== "auth/user-not-found") throw error;

  user = await adminAuth.createUser({
    email,
    password,
    displayName: "Gopi Boutique Admin",
    emailVerified: true,
  });
  console.log(`✔  Created Firebase Auth user: ${email}`);
}

// ── 2. Set the custom claim so Auth tokens carry role:"admin" ─────────────────
await adminAuth.setCustomUserClaims(user.uid, { role: "admin" });
console.log("✔  Custom claim  role:admin  set on Auth token");

// ── 3. Write / merge the Firestore users/{uid} document ──────────────────────
await adminDb
  .collection("users")
  .doc(user.uid)
  .set(
    {
      uid: user.uid,
      name: user.displayName || "Gopi Boutique Admin",
      email,
      role: "admin",          // <-- this is what AdminRoute checks
      photoURL: user.photoURL || "",
      addresses: [],
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }           // safe to run multiple times
  );

console.log(`✔  Firestore users/${user.uid}  →  role: "admin"`);
console.log(`\n✅  Admin setup complete for ${email}`);
console.log("    You can now log in at /login  (Admin tab)  or  /admin/login\n");

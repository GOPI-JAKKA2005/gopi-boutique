import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./config";

export async function createUserProfile(user, extras = {}) {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: extras.name || user.displayName || "Shopper",
      email: user.email,
      role: "user",
      photoURL: extras.photoURL || user.photoURL || "",
      addresses: [],
      createdAt: serverTimestamp(),
    });
  }
}

export async function registerWithEmail({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await createUserProfile(credential.user, { name });
  return credential.user;
}

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGooglePopup() {
  const credential = await signInWithPopup(auth, googleProvider);
  await createUserProfile(credential.user);
  return credential.user;
}

export function logoutUser() {
  return signOut(auth);
}

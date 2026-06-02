import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const SESSION_KEY = "gopi-boutique-session";

function sessionId() {
  if (typeof window === "undefined") return "server";
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(SESSION_KEY, next);
  return next;
}

async function record(collectionName, payload) {
  try {
    await addDoc(collection(db, collectionName), {
      ...payload,
      sessionId: sessionId(),
      path: typeof window === "undefined" ? "" : window.location.pathname,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.debug("Analytics event skipped", error.message);
  }
}

export function trackClick(label, metadata = {}) {
  return record("clickEvents", { label, metadata });
}

export function logChatMessage({ message, response, action = "message" }) {
  return record("chatLogs", { action, message, response });
}


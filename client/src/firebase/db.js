import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";

export const productsRef = collection(db, "products");
export const ordersRef = collection(db, "orders");
export const usersRef = collection(db, "users");
export const reviewsRef = collection(db, "reviews");
export const siteContentRef = collection(db, "siteContent");
export const chatLogsRef = collection(db, "chatLogs");
export const clickEventsRef = collection(db, "clickEvents");
export const consultationRequestsRef = collection(db, "consultationRequests");

export async function getProducts({ featured, category, search, sortBy = "newest", pageSize = 24 } = {}) {
  const constraints = [];
  if (featured !== undefined) constraints.push(where("isFeatured", "==", featured));
  if (category && category !== "All") constraints.push(where("category", "==", category));

  // Removed orderBy to avoid needing composite indexes
  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(productsRef, ...constraints));
  let products = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

  if (search) {
    const lowered = search.toLowerCase();
    products = products.filter((product) =>
      [product.name, product.brand, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered)),
    );
  }

  return products;
}

export async function getProduct(id) {
  const snapshot = await getDoc(doc(db, "products", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export function saveProduct(product, id) {
  const payload = {
    ...product,
    price: Number(product.price),
    discountPrice: Number(product.discountPrice || product.price),
    stock: Number(product.stock),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    status: product.status || "active",
    updatedAt: serverTimestamp(),
  };

  if (id) return updateDoc(doc(db, "products", id), payload);
  return addDoc(productsRef, { ...payload, createdAt: serverTimestamp() });
}

export function deleteProduct(id) {
  return deleteDoc(doc(db, "products", id));
}

export function createOrder(order) {
  return addDoc(ordersRef, {
    ...order,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateOrderStatus(orderId, status) {
  return updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
}

export function createConsultationRequest(payload) {
  return addDoc(consultationRequestsRef, {
    ...payload,
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateConsultationStatus(requestId, status) {
  return updateDoc(doc(db, "consultationRequests", requestId), { status, updatedAt: serverTimestamp() });
}

export async function getSiteContent(pageId) {
  const snapshot = await getDoc(doc(db, "siteContent", pageId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export function saveSiteContent(pageId, content) {
  return setDoc(
    doc(db, "siteContent", pageId),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
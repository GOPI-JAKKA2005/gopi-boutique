import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints = [orderBy("createdAt", "desc")];
    if (userId) constraints.unshift(where("userId", "==", userId));

    const unsubscribe = onSnapshot(query(collection(db, "orders"), ...constraints), (snapshot) => {
      setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { orders, loading };
}

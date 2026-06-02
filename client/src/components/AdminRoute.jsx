import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";

export default function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    getDoc(doc(db, "ADMIN", currentUser.uid)).then((snap) => {
      setIsAdmin(snap.exists() && snap.data()?.ADMIN === "ROLE");
    });
  }, [currentUser]);

  if (loading || isAdmin === null) return <Loader label="Checking admin access..." />;
  if (!currentUser) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
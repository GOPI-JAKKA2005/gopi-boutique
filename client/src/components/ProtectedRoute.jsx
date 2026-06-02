import { Navigate, useLocation } from "react-router-dom";
import Loader from "./Loader";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session" />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

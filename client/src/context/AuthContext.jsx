import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { auth, db } from "../firebase/config";
import { loginWithEmail, loginWithGooglePopup, logoutUser, registerWithEmail } from "../firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return undefined;
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : null;
      setUserProfile(data);
      setUserRole(data?.role || "user");
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      userProfile,
      userRole,
      loading,
      login: (email, password) => loginWithEmail(email, password),
      register: (payload) => registerWithEmail(payload),
      loginWithGoogle: loginWithGooglePopup,
      logout: logoutUser,
      updateProfileData: async ({ name, photoURL, addresses }) => {
        if (!currentUser) return;
        const updates = { updatedAt: serverTimestamp() };
        if (name !== undefined) updates.name = name;
        if (photoURL !== undefined) updates.photoURL = photoURL;
        if (addresses !== undefined) updates.addresses = addresses;
        await updateDoc(doc(db, "users", currentUser.uid), updates);
        if (name || photoURL) await updateProfile(currentUser, { displayName: name, photoURL });
        toast.success("Profile updated");
      },
    }),
    [currentUser, loading, userProfile, userRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

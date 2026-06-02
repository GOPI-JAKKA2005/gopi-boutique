import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Consultation from "./pages/Consultation";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminConsultations from "./pages/admin/AdminConsultations";

function Page({ children }) {
  return (
    <motion.main initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.22 }}>
      {children}
    </motion.main>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <CartDrawer />
      <Chatbot />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/shop" element={<Page><Shop /></Page>} />
          <Route path="/consultation" element={<Page><Consultation /></Page>} />
          <Route path="/product/:id" element={<Page><ProductDetail /></Page>} />
          <Route path="/cart" element={<Page><Cart /></Page>} />
          <Route path="/checkout" element={<ProtectedRoute><Page><Checkout /></Page></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><Page><OrderSuccess /></Page></ProtectedRoute>} />
          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/admin/login" element={<Page><AdminLogin /></Page>} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Page><AdminDashboard /></Page></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><Page><AdminProducts /></Page></AdminRoute>} />
          <Route path="/admin/products/add" element={<AdminRoute><Page><AdminAddProduct /></Page></AdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<AdminRoute><Page><AdminEditProduct /></Page></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><Page><AdminOrders /></Page></AdminRoute>} />
          <Route path="/admin/consultations" element={<AdminRoute><Page><AdminConsultations /></Page></AdminRoute>} />
          <Route path="/admin/leads" element={<AdminRoute><Page><AdminLeads /></Page></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute><Page><AdminContent /></Page></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Page><AdminUsers /></Page></AdminRoute>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { createOrder } from "../firebase/db";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import emailjs from "@emailjs/browser";

// ✅ All Keys Configured
const RAZORPAY_KEY_ID = "rzp_test_Suj0WkRzi6mPk1";
const EMAILJS_SERVICE_ID = "service_ar0fjol";
const EMAILJS_TEMPLATE_ID = "template_erghx5u";
const EMAILJS_PUBLIC_KEY = "sIGDLP8Gu4uXHu0Pq";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getDeliveryDates() {
  const orderDate = new Date();
  const deliveryDate = new Date();
  deliveryDate.setDate(orderDate.getDate() + 7);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return {
    orderDate: orderDate.toLocaleDateString("en-IN", options),
    deliveryDate: deliveryDate.toLocaleDateString("en-IN", options),
  };
}

async function sendEmail({ toEmail, toName, items, total, orderId, orderDate, deliveryDate, paymentMethod, paymentId }) {
  try {
    const itemsList = items
      .map((i) => `${i.name} x${i.quantity} - Rs.${i.price * i.quantity}`)
      .join("\n");

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name: toName,
        order_id: orderId,
        items_list: itemsList,
        total_amount: `Rs.${total}`,
        payment_method: paymentMethod,
        payment_id: paymentId || "N/A",
        order_date: orderDate,
        delivery_date: deliveryDate,
        shop_name: "Bell Boutique",
      },
      EMAILJS_PUBLIC_KEY
    );
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

export default function Checkout() {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const { items, totals, clearCart } = useCart();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({
    name: userProfile?.name || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const canSubmit = items.length > 0 && Object.values(form).every(Boolean);

  async function sendNotifications({ orderId, paymentMethod, paymentId }) {
    const { orderDate, deliveryDate } = getDeliveryDates();
    await sendEmail({
      toEmail: currentUser.email,
      toName: form.name,
      items,
      total: totals.total,
      orderId,
      orderDate,
      deliveryDate,
      paymentMethod,
      paymentId,
    });
  }

  async function placeCODOrder() {
    setSaving(true);
    try {
      const { orderDate, deliveryDate } = getDeliveryDates();
      const order = await createOrder({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: form.name,
        items,
        totalAmount: totals.total,
        shippingAddress: form,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
        orderDate,
        deliveryDate,
        updatedAt: serverTimestamp(),
      });
      await updateProfileData({ addresses: [...(userProfile?.addresses || []), form] });
      await sendNotifications({ orderId: order.id, paymentMethod: "Cash on Delivery", paymentId: null });
      clearCart();
      navigate(`/order-success?orderId=${order.id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function placeUPIOrder() {
    setSaving(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load Razorpay. Check your internet.");
      setSaving(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(totals.total * 100),
      currency: "INR",
      name: "Bell Boutique",
      description: `Order for ${form.name}`,
      image: "/favicon.ico",
      prefill: { name: form.name, contact: form.phone, email: currentUser.email },
      method: { upi: true, card: false, netbanking: false, wallet: false },
      theme: { color: "#e11d48" },
      handler: async function (response) {
        try {
          const { orderDate, deliveryDate } = getDeliveryDates();
          const order = await createOrder({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: form.name,
            items,
            totalAmount: totals.total,
            shippingAddress: form,
            paymentMethod: "UPI",
            paymentStatus: "paid",
            razorpayPaymentId: response.razorpay_payment_id,
            orderDate,
            deliveryDate,
            updatedAt: serverTimestamp(),
          });
          await updateProfileData({ addresses: [...(userProfile?.addresses || []), form] });
          await sendNotifications({ orderId: order.id, paymentMethod: "UPI", paymentId: response.razorpay_payment_id });
          clearCart();
          navigate(`/order-success?orderId=${order.id}`);
        } catch (err) {
          toast.error("Order saving failed: " + err.message);
        } finally {
          setSaving(false);
        }
      },
      modal: {
        ondismiss: () => { toast.error("Payment cancelled"); setSaving(false); },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (r) => { toast.error("Payment failed: " + r.error.description); setSaving(false); });
    rzp.open();
  }

  async function handlePlaceOrder() {
    if (!canSubmit) return toast.error("Complete all shipping details");
    paymentMethod === "cod" ? await placeCODOrder() : await placeUPIOrder();
  }

  const { deliveryDate } = getDeliveryDates();

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-black">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">

        <div className="card p-5">
          <h2 className="text-xl font-black">Shipping address</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Full name"],
              ["phone", "Phone"],
              ["address", "Address"],
              ["city", "City"],
              ["pincode", "Pincode"],
            ].map(([key, label]) => (
              <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                <label className="label">{label}</label>
                <input className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-black">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={`cursor-pointer rounded-lg border p-4 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-primary" />
              <span className="ml-2 font-bold">Cash on Delivery</span>
            </label>
            <label className={`cursor-pointer rounded-lg border p-4 transition-all ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
              <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="accent-primary" />
              <span className="ml-2 font-bold">UPI Payment</span>
              <span className="ml-2 text-xs text-green-600 font-semibold">✅ Live</span>
            </label>
          </div>

          {paymentMethod === "upi" && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
              💳 You will be redirected to Razorpay to complete UPI payment securely.
            </div>
          )}

          <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-bold text-green-700">🚚 Estimated Delivery</p>
            <p className="text-sm text-green-600 mt-1">
              Your order will be delivered by <strong>{deliveryDate}</strong> (within 7 days)
            </p>
            <p className="text-xs text-green-500 mt-1">
              📧 Email confirmation will be sent after order
            </p>
          </div>
        </div>

        <aside className="card h-max p-5">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span>{item.name} × {item.quantity}</span>
                <b>{formatCurrency(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t pt-4">
            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <button disabled={!canSubmit || saving} className="btn-primary mt-5 w-full" onClick={handlePlaceOrder}>
            {saving ? "Processing..." : paymentMethod === "upi" ? "Pay with UPI" : "Place Order"}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            📧 Confirmation sent to Email
          </p>
        </aside>
      </div>
    </div>
  );
}
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiMessageCircle, FiScissors, FiSend, FiShoppingBag, FiX } from "react-icons/fi";
import { logChatMessage, trackClick } from "../utils/analytics";
import { useAuth } from "../context/AuthContext";

const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "916300912517";
const whatsappUrl = `https://wa.me/${phone}?text=Hi%20Bell%20Boutique%2C%20I%20want%20to%20book%20an%20appointment.`;

const quickActions = [
  {
    label: "Book",
    icon: FiClock,
    message: "I want to book a boutique appointment.",
    response: "Perfect. You can share your event date, outfit type, and preferred budget on WhatsApp. The studio can confirm the slot from there.",
    href: whatsappUrl,
  },
  {
    label: "Budget",
    icon: FiScissors,
    message: "What starting budget should I expect?",
    response: "Women custom looks usually start around Rs. 22,000, men around Rs. 36,000, and kids around Rs. 9,500. Handwork, fabric, and delivery timeline can change the final quote.",
  },
  {
    label: "Shop",
    icon: FiShoppingBag,
    message: "Show me boutique collections.",
    response: "The collections page has Women, Men, and Kids posts with pricing, stock, and featured styles. You can open it from the button below.",
    to: "/shop",
  },
];

function autoReply(message, name) {
  const text = message.toLowerCase();
  if (text.includes("price") || text.includes("budget") || text.includes("cost")) {
    return "For a fast estimate, choose outfit type and handwork level on the consultation page. A designer can finalize pricing after fabric and embroidery details.";
  }
  if (text.includes("order") || text.includes("delivery")) {
    return "Order progress is available in your profile after login. Admins can also update order status from the control panel.";
  }
  if (text.includes("book") || text.includes("appointment")) {
    return "You can book through WhatsApp or the consultation page. Share outfit type, event date, and inspiration notes for a smoother appointment.";
  }
  return `Thanks${name ? `, ${name}` : ""}. A boutique assistant can help with outfit type, budget, order status, or appointment booking.`;
}

export default function Chatbot() {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi, I can help with appointments, outfit budget, collections, and order guidance.",
    },
  ]);

  function pushConversation(userText, botText, action = "message") {
    setMessages((current) => [...current, { role: "user", text: userText }, { role: "bot", text: botText }]);
    logChatMessage({ message: userText, response: botText, action });
  }

  function submit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    const response = autoReply(message, userProfile?.name);
    pushConversation(message, response);
    setDraft("");
  }

  function quick(action) {
    trackClick(`chatbot_${action.label.toLowerCase()}`);
    pushConversation(action.message, action.response, "quick-action");
    if (action.href) window.open(action.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.section
            className="mb-4 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
          >
            <div className="rainbow-strip h-1.5" />
            <div className="flex items-start justify-between gap-3 border-b p-4 dark:border-white/10">
              <div>
                <p className="text-sm font-black">Boutique assistant</p>
                <p className="text-xs text-slate-500">Chats and clicks are logged for admin insights.</p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close chat">
                <FiX />
              </button>
            </div>
            <div className="max-h-80 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100"}`}>
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} type="button" className="rounded-lg border bg-white px-2 py-2 text-xs font-bold transition hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/5" onClick={() => quick(action)}>
                    <Icon className="mx-auto mb-1" />
                    {action.label}
                  </button>
                );
              })}
            </div>
            <form className="border-t p-4 dark:border-white/10" onSubmit={submit}>
              <div className="flex gap-2">
                <input className="input py-2" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about fit, budget, order..." />
                <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-white" aria-label="Send chat message">
                  <FiSend />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <a className="font-bold text-primary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackClick("chatbot_whatsapp_link")}>
                  WhatsApp studio
                </a>
                <Link className="font-bold text-primary" to="/consultation" onClick={() => trackClick("chatbot_consultation_link")}>
                  Consultation
                </Link>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <button
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-orange-500 to-accent text-2xl text-white shadow-soft transition hover:-translate-y-1 sm:w-auto sm:px-5 sm:text-sm sm:font-bold"
        onClick={() => {
          setOpen((value) => !value);
          trackClick("chatbot_toggle");
        }}
        aria-label="Open boutique assistant"
      >
        <FiMessageCircle />
        <span className="hidden sm:ml-2 sm:inline">Boutique chat</span>
      </button>
    </div>
  );
}


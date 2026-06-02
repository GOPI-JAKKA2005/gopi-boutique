import { FiFacebook, FiInstagram, FiMail, FiMapPin, FiMessageCircle, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";

const whatsappUrl = "https://wa.me/916300912517?text=Hi%20Gopi%20Boutique%2C%20I%20want%20to%20book%20an%20appointment.";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white/70 backdrop-blur dark:bg-slate-950/85">
      <div className="rainbow-strip h-1" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.35fr_1fr_1fr_1.25fr]">
        <div>
          <p className="text-xl font-black">Gopi<span className="rainbow-text">Boutique</span></p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Andhra Pradesh-based designer boutique for bridal blouses, lehengas, gowns, hand embroidery, premium tailoring, and custom occasion wear.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="https://www.instagram.com/gopikohli982" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border bg-white hover:border-primary hover:text-primary" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="https://www.facebook.com/GopiBoutique" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border bg-white hover:border-primary hover:text-primary" aria-label="Facebook">
              <FiFacebook />
            </a>
          </div>
        </div>
        <div>
          <p className="font-bold">Studio</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-500">
            <Link to="/shop">Collections</Link>
            <Link to="/consultation">Book consultation</Link>
            <Link to="/shop?category=Women">Women</Link>
            <Link to="/shop?category=Men">Men</Link>
            <Link to="/shop?category=Kids">Kids</Link>
          </div>
        </div>
        <div>
          <p className="font-bold">Services</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-500">
            <span>Handwork embroidery</span>
            <span>Body-type fitting</span>
            <span>Fabric selection</span>
            <span>Family wedding wear</span>
          </div>
        </div>
        <div>
          <p className="font-bold">Contact</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <a className="flex items-center gap-3 hover:text-primary" href="tel:+916300912517"><FiPhone /> +91 63009 12517</a>
            <a className="flex items-center gap-3 font-bold text-primary hover:text-accent" href={whatsappUrl} target="_blank" rel="noreferrer"><FiMessageCircle /> WhatsApp booking</a>
            <a className="flex items-center gap-3 hover:text-primary" href="mailto:gopijakka2005@gmail.com"><FiMail /> gopijakka2005@gmail.com</a>
            <span className="flex items-center gap-3"><FiMapPin /> Narasaraopet, Andhra Pradesh - 522413</span>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-5 w-full"><FiMessageCircle /> Book on WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}
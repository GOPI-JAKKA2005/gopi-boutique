import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export const defaultSiteContent = {
  home: {
    eyebrow: "Bangalore designer boutique for bridal and custom wear",
    title: import.meta.env.VITE_SITE_NAME || "Bell Fashion Boutique",
    subtitle:
      "Bridal blouses, lehengas, gowns, handcrafted embroidery, premium fabric selection, and body-type-aware fittings created through a personal designer-led process.",
    primaryCta: "Book consultation",
    secondaryCta: "View collections",
    videoUrl: import.meta.env.VITE_HERO_VIDEO_URL || "/media/hero-video.mp4",
    posterImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1900&q=85",
    stats: [
      { value: "12+", label: "custom service categories" },
      { value: "6", label: "fitting and finishing checkpoints" },
      { value: "100%", label: "made-to-order approach" },
    ],
  },
  shop: {
    eyebrow: "Bell catalog",
    title: "Custom boutique collections",
    subtitle:
      "Browse boutique collections by Women, Men, and Kids. Admins manage images and posts for each section while customers explore and request custom styling.",
  },
  consultation: {
    eyebrow: "Designer consultation",
    title: "Plan a made-to-order outfit with Bell Boutique.",
    subtitle:
      "Capture outfit type, embroidery level, fitting preference, event date, and inspiration notes before your boutique appointment.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=85",
  },
};

export function useSiteContent(pageId) {
  const fallback = useMemo(() => defaultSiteContent[pageId] || {}, [pageId]);
  const [content, setContent] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "siteContent", pageId),
      (snapshot) => {
        setContent(snapshot.exists() ? { ...fallback, ...snapshot.data() } : fallback);
        setLoading(false);
      },
      () => {
        setContent(fallback);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [fallback, pageId]);

  return { content, loading };
}


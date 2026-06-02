import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiCheckCircle, FiEdit3, FiHeart, FiScissors, FiShoppingBag, FiStar, FiUsers } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { useProducts } from "../hooks/useProducts";
import { useSiteContent } from "../hooks/useSiteContent";
import { lookbook, processSteps, services } from "../data/boutique";

const serviceIcons = [FiHeart, FiScissors, FiEdit3, FiUsers];

function HeroMediaFrame({ content }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const stats = Array.isArray(content.stats) ? content.stats : [];
  const shouldShowVideo = content.videoUrl && !videoFailed;

  return (
    <motion.div className="hidden lg:block" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
      <div className="relative">
        <div className="absolute -inset-3 rounded-[2rem] bg-white/10 blur-2xl" />
        <div className="relative overflow-hidden rounded-[1.6rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between px-2 text-xs font-bold uppercase tracking-[0.2em] text-white/55">
            <span>Hero media</span>
            <span>Local / Admin</span>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900">
            {shouldShowVideo ? (
              <video
                className="h-full w-full object-cover"
                src={content.videoUrl}
                poster={content.posterImage}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoFailed(true)}
              />
            ) : (
              <img src={content.posterImage} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-x-4 bottom-4 grid gap-2">
              {stats.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/15 bg-neutral-950/55 p-4 backdrop-blur">
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="mt-1 text-xs text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { content } = useSiteContent("home");
  const { products: featured, loading } = useProducts({ featured: true, pageSize: 8 });
  const { products: arrivals } = useProducts({ pageSize: 8 });

  return (
    <div>
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          <img src={content.posterImage} alt="" className="h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/78 to-neutral-950/10" />
          <div className="rainbow-strip absolute inset-x-0 bottom-0 h-2" />
        </div>
        <div className="container-page relative grid min-h-[82vh] items-center gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <motion.p className="font-semibold text-yellow-200" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              {content.eyebrow}
            </motion.p>
            <motion.h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {content.title}
            </motion.h1>
            <motion.p className="mt-5 max-w-xl text-base leading-7 text-white/78" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {content.subtitle}
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link to="/consultation" className="btn-primary">
                <FiCalendar /> {content.primaryCta}
              </Link>
              <Link to="/shop" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">
                {content.secondaryCta} <FiArrowRight />
              </Link>
            </motion.div>
          </div>
          <HeroMediaFrame content={content} />
        </div>
      </section>

      <section className="container-page -mt-12 relative z-10 grid gap-4 md:grid-cols-3">
        {[
          ["Designer-led", "Personal recommendations for silhouette, fabric, and event styling.", FiStar],
          ["Handcrafted", "Aari, zardozi, cutdana, pearl, stone, and sequin work.", FiScissors],
          ["Tailor-made", "Measurements and trials focused on fit, elegance, and finishing.", FiCheckCircle],
        ].map(([title, text, Icon], index) => (
          <div key={title} className="rainbow-panel rainbow-border-top flex items-start gap-4 p-5">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg text-white ${["bg-rose-500", "bg-emerald-500", "bg-blue-500"][index]}`}><Icon /></span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Signature services</p>
            <h2 className="text-3xl font-black">Designed around your occasion</h2>
          </div>
          <Link to="/consultation" className="hidden text-sm font-bold text-primary sm:block">Plan an outfit</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = serviceIcons[index];
            return (
              <article key={service.title} className="rainbow-panel rainbow-border-top p-6">
                <span className={`grid h-12 w-12 place-items-center rounded-lg text-white ${["bg-rose-500", "bg-orange-500", "bg-emerald-500", "bg-violet-600"][index]}`}>
                  <Icon className="text-2xl" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{service.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rainbow-band py-16 dark:bg-white/[0.03]">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Featured couture</p>
              <h2 className="text-3xl font-black">Bridal and occasion picks</h2>
            </div>
            <Link to="/shop" className="hidden text-sm font-bold text-primary sm:block">View all</Link>
          </div>
          {loading ? <Loader /> : (
            <Swiper modules={[Autoplay, Navigation]} navigation autoplay={{ delay: 3600 }} spaceBetween={18} breakpoints={{ 320: { slidesPerView: 1.15 }, 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 4 } }}>
              {featured.map((product, index) => <SwiperSlide key={product.id}><ProductCard product={product} index={index} /></SwiperSlide>)}
            </Swiper>
          )}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Boutique workflow</p>
            <h2 className="mt-2 text-3xl font-black">From first idea to final fitting</h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
              The advanced workflow helps customers move from inspiration to appointment with clear checkpoints for consultation, measurement, handwork approval, and delivery.
            </p>
            <Link to="/consultation" className="btn-primary mt-7"><FiCalendar /> Start your design brief</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <div key={step} className="rainbow-panel p-5">
                <span className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-black text-white ${["bg-rose-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-blue-500", "bg-violet-600"][index]}`}>{index + 1}</span>
                <p className="mt-4 font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-6">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-primary">Lookbook</p>
          <h2 className="text-3xl font-black">Event-wise styling ideas</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lookbook.map((item) => (
            <article key={item.title} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/85 to-transparent p-5 text-white">
                <p className="text-lg font-black">{item.title}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-lg bg-neutral-950 p-8 text-white sm:p-12">
          <div className="rainbow-strip mb-8 h-1.5 rounded-full" />
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-rose-200">Advanced boutique experience</p>
              <h2 className="mt-2 text-3xl font-black">Bring measurements, inspiration, and event dates into one consultation.</h2>
              <p className="mt-3 max-w-2xl text-white/65">Use the consultation form to capture outfit type, budget, timeline, embroidery preference, and contact details before the studio appointment.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/consultation" className="btn-primary"><FiCalendar /> Book now</Link>
              <Link to="/shop" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20"><FiShoppingBag /> Browse catalog</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="mb-8"><p className="text-sm font-bold uppercase text-primary">New to the studio</p><h2 className="text-3xl font-black">Recently added concepts</h2></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {arrivals.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      </section>
    </div>
  );
}

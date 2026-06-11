/**
 * HomeSectionsMotion — 3 new Framer Motion sections appended after existing HomeSections.
 * 1. HowItWorks   — 3-step animated process with staggered cards
 * 2. DigitalOffers — Offers/promotions grid with hover 3D tilt + parallax badge
 * 3. TrustBadges  — Partner logos / certifications strip with marquee + count-up
 */
"use client";
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  UserPlus, ScanFace, Wallet, Zap, Gift, Percent, Globe2,
  ArrowRight, BadgeCheck, ShieldCheck, Lock, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── shared helpers ─── */
function useCountUp(target: number, trigger: boolean, duration = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * ease));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [trigger, target, duration]);
  return v;
}

/* ── SECTION 1: How It Works ── */
const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up with your NID in under 3 minutes — no branch visit required.",
    color: "from-primary/20 to-primary/5",
  },
  {
    n: "02",
    icon: ScanFace,
    title: "Verify your identity",
    body: "A quick selfie and liveness check secures your profile with bank-grade KYC.",
    color: "from-gold/20 to-gold/5",
  },
  {
    n: "03",
    icon: Wallet,
    title: "Start banking instantly",
    body: "Transfer money, pay bills and manage cards — all from your pocket.",
    color: "from-success/20 to-success/5",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const lineVariants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, delay: 0.3, ease: "easeOut" } },
};

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-14 max-w-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Up and running in minutes.
        </h2>
        <p className="mt-3 text-muted-foreground">
          No paperwork. No queues. Just open the app and follow three simple steps.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="relative grid gap-6 md:grid-cols-3"
      >
        {/* connector line */}
        <motion.div
          variants={lineVariants}
          className="absolute left-[calc(16.6%+24px)] right-[calc(16.6%+24px)] top-12 hidden h-px origin-left bg-border md:block"
        />

        {steps.map((s) => (
          <motion.div
            key={s.n}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className="surface-card relative flex flex-col gap-4 overflow-hidden p-7"
          >
            {/* gradient bg blob */}
            <div className={`pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} blur-2xl`} />

            <div className="relative flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-lg">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="font-display text-4xl font-extrabold text-border">{s.n}</span>
            </div>
            <h3 className="relative font-display text-lg font-bold text-foreground">{s.title}</h3>
            <p className="relative text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-10 flex justify-center"
      >
        <Button asChild size="lg" className="gradient-brand text-primary-foreground shadow-md">
          <Link to="/auth">
            Open account now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}

/* ── SECTION 2: Digital Offers ── */
const offers = [
  {
    icon: Zap,
    tag: "Limited time",
    tagColor: "bg-gold/15 text-gold-foreground",
    title: "0% fee on first transfer",
    body: "Send money to any bank in Bangladesh completely free for your first 5 transfers.",
    badge: "New",
    gradient: "from-primary to-primary-glow",
  },
  {
    icon: Percent,
    tag: "Cards",
    tagColor: "bg-primary/10 text-primary",
    title: "6 months interest-free",
    body: "Get a Pubali Visa Platinum and enjoy zero interest on purchases for 6 months.",
    badge: "Hot",
    gradient: "from-[oklch(0.55_0.18_280)] to-[oklch(0.40_0.15_280)]",
  },
  {
    icon: Gift,
    tag: "Rewards",
    tagColor: "bg-success/10 text-success",
    title: "5x points on dining",
    body: "Every taka spent at restaurants earns 5× reward points redeemable for cashback.",
    badge: "Popular",
    gradient: "from-success to-[oklch(0.42_0.17_155)]",
  },
  {
    icon: Globe2,
    tag: "Remittance",
    tagColor: "bg-gold/15 text-gold-foreground",
    title: "2.5% bonus on inward FX",
    body: "Receive international remittance and earn an extra 2.5% bonus credited instantly.",
    badge: "Exclusive",
    gradient: "from-[oklch(0.60_0.18_45)] to-[oklch(0.45_0.16_45)]",
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DigitalOffers() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="border-y border-border bg-secondary/30 py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Current offers</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              More value, every day.
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/auth">See all offers <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {offers.map((o) => (
            <motion.div key={o.title} variants={cardVariants}>
              <TiltCard className="surface-card group relative h-full cursor-pointer overflow-hidden p-6">
                {/* top gradient strip */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${o.gradient}`} />

                <div className="flex items-start justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${o.tagColor}`}>
                    {o.tag}
                  </span>
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background"
                  >
                    {o.badge}
                  </motion.span>
                </div>

                <div className={`mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${o.gradient} text-white shadow-lg`}>
                  <o.icon className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-display text-base font-bold text-foreground">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.body}</p>

                <motion.div
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  whileHover={{ x: 4 }}
                >
                  Claim offer <ArrowRight className="h-3.5 w-3.5" />
                </motion.div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── SECTION 3: Trust & Certifications ── */
const trustItems = [
  { icon: ShieldCheck, label: "Bangladesh Bank licensed" },
  { icon: Lock, label: "256-bit SSL encryption" },
  { icon: BadgeCheck, label: "ISO 27001 certified" },
  { icon: Building2, label: "Deposit insurance covered" },
];

const certBadges = [
  "Visa Certified", "Mastercard Partner", "SWIFT Member",
  "PCI DSS Level 1", "Bangladesh Bank", "bKash Gateway",
  "BEFTN Member", "RTGS Connected",
];

const stats = [
  { value: 2800000, suffix: "+", label: "Customers" },
  { value: 515, suffix: "", label: "Branches" },
  { value: 65, suffix: "yrs", label: "Of trust" },
  { value: 99, suffix: ".9%", label: "Uptime" },
];

export function TrustBadges() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const c0 = useCountUp(stats[0].value, inView);
  const c1 = useCountUp(stats[1].value, inView);
  const c2 = useCountUp(stats[2].value, inView);
  const c3 = useCountUp(stats[3].value, inView);
  const counts = [c0, c1, c2, c3];

  return (
    <section className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* count-up stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={cardVariants}
              className="surface-card flex flex-col items-center justify-center gap-1 p-8 text-center"
            >
              <motion.p
                className="font-display text-4xl font-extrabold text-foreground"
              >
                {counts[i].toLocaleString("en-BD")}{s.suffix}
              </motion.p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* trust icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {trustItems.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{t.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* scrolling cert badges marquee */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card py-5">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="flex w-max gap-6"
          >
            {[...certBadges, ...certBadges].map((b, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-primary" /> {b}
              </div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 flex flex-col items-center gap-4 text-center"
        >
          <p className="font-display text-xl font-bold text-foreground sm:text-2xl">
            Trusted by 2.8 million Bangladeshis — and counting.
          </p>
          <Button asChild size="lg" className="gradient-brand text-primary-foreground shadow-lg">
            <Link to="/auth">
              Join them today <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

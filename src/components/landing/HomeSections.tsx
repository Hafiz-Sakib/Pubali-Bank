import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, ShieldCheck, Smartphone, Globe2, Coins, Building2, Users, Award,
  ArrowRight, Calculator, Quote, ChevronDown, MapPin, Sparkles, Wallet,
  CreditCard, Banknote, PiggyBank, Activity, Star, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ---------------- Reveal on scroll ---------------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: shown ? "translateY(0)" : "translateY(24px)",
        opacity: shown ? 1 : 0,
        transition: `all 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Section 1: Live market ticker ---------------- */
function MarketTicker() {
  const items = [
    { s: "USD/BDT", v: "117.45", d: "+0.12%" },
    { s: "EUR/BDT", v: "126.80", d: "+0.34%" },
    { s: "GBP/BDT", v: "148.20", d: "-0.18%" },
    { s: "SAR/BDT", v: "31.32", d: "+0.05%" },
    { s: "GOLD 22K", v: "৳1,42,500", d: "+0.6%" },
    { s: "DSEX", v: "5,412.30", d: "+0.41%" },
    { s: "Repo Rate", v: "10.00%", d: "0.00" },
    { s: "Call Money", v: "9.85%", d: "-0.05" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-3 sm:px-6">
        <div className="flex animate-[ticker_40s_linear_infinite] gap-10 whitespace-nowrap text-sm">
          {[...items, ...items].map((i, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              <span className="font-medium text-muted-foreground">{i.s}</span>
              <span className="font-mono font-semibold text-foreground">{i.v}</span>
              <span className={i.d.startsWith("-") ? "text-destructive" : "text-success"}>{i.d}</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
}

/* ---------------- Section 2: Animated counters ---------------- */
function useCounter(target: number, run: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return v;
}

function StatsImpact() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const a = useCounter(2800000, shown);
  const b = useCounter(515, shown);
  const c = useCounter(65, shown);
  const d = useCounter(98, shown);
  const fmt = (n: number) => n.toLocaleString("en-BD");
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our impact</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Bangladesh's bank, in numbers.</h2>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, label: "Customers served", v: fmt(a) + "+" },
          { icon: Building2, label: "Branches & sub-branches", v: fmt(b) },
          { icon: Award, label: "Years of trust", v: fmt(c) },
          { icon: Activity, label: "Customer satisfaction", v: d + "%" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="surface-card p-6">
              <s.icon className="h-6 w-6 text-primary" />
              <p className="mt-4 font-display text-3xl font-extrabold text-foreground">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Section 3: Interactive product tabs ---------------- */
function ProductExplorer() {
  const tabs = [
    { id: "save", label: "Savings", icon: PiggyBank,
      title: "Premier Savings Account",
      bullets: ["Up to 6.5% interest p.a.", "Free debit card & cheque book", "Daily-balance interest calculation"],
      cta: "/auth" },
    { id: "card", label: "Cards", icon: CreditCard,
      title: "Visa Signature Card",
      bullets: ["0% intro APR for 6 months", "5x reward points on dining", "Airport lounge access worldwide"],
      cta: "/cards" },
    { id: "loan", label: "Loans", icon: Banknote,
      title: "Home Loan @ 8.75% p.a.",
      bullets: ["Up to ৳2 crore financing", "Tenure up to 25 years", "Pre-approval in 3 days"],
      cta: "/loans" },
    { id: "fx", label: "FX & Remittance", icon: Globe2,
      title: "Global Remittance",
      bullets: ["2.5% bonus on inward remittance", "80+ countries supported", "Same-day credit to your account"],
      cta: "/fx" },
  ];
  const [active, setActive] = useState(tabs[0].id);
  const cur = tabs.find(t => t.id === active)!;
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Explore products</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Pick what fits your goals.</h2>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${active === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
        <div key={cur.id} className="mt-8 grid animate-fade-in gap-8 lg:grid-cols-2">
          <div className="surface-card p-8">
            <h3 className="font-display text-2xl font-bold text-foreground">{cur.title}</h3>
            <ul className="mt-5 space-y-3">
              {cur.bullets.map(b => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> {b}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 gradient-brand text-primary-foreground">
              <Link to={cur.cta as "/auth"}>Apply now <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="surface-card grid place-items-center p-8">
            <div className="grid h-40 w-40 place-items-center rounded-full gradient-brand text-primary-foreground shadow-2xl">
              <cur.icon className="h-16 w-16" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section 4: Spending chart ---------------- */
function SpendingInsights() {
  const data = useMemo(() => [
    { m: "Jan", in: 92, out: 71 }, { m: "Feb", in: 95, out: 68 }, { m: "Mar", in: 102, out: 80 },
    { m: "Apr", in: 110, out: 76 }, { m: "May", in: 118, out: 84 }, { m: "Jun", in: 125, out: 91 },
    { m: "Jul", in: 130, out: 88 }, { m: "Aug", in: 134, out: 95 },
  ], []);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Smart insights</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Know exactly where your money goes.</h2>
          <p className="mt-4 text-muted-foreground">Automatic categorisation, monthly trends and budget alerts — built right into your mobile banking app.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[{ i: TrendingUp, t: "Spend trends" }, { i: Sparkles, t: "Smart tags" }, { i: ShieldCheck, t: "Fraud alerts" }, { i: Wallet, t: "Budget goals" }].map(x => (
              <div key={x.t} className="flex items-center gap-2 text-sm text-foreground"><x.i className="h-4 w-4 text-primary" /> {x.t}</div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="surface-card h-80 p-4">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gIn" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d4a017" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#d4a017" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="m" stroke="currentColor" opacity={0.6} />
                <YAxis stroke="currentColor" opacity={0.6} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="in" stroke="var(--color-primary)" fill="url(#gIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="out" stroke="#d4a017" fill="url(#gOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Section 5: Loan calculator ---------------- */
function LoanCalculator() {
  const [amt, setAmt] = useState(500000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(9);
  const emi = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    return Math.round((amt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [amt, years, rate]);
  const total = emi * years * 12;
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">EMI calculator</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Plan your loan in seconds.</h2>
          <div className="mt-8 space-y-6">
            {[
              { label: "Loan amount (৳)", val: amt, min: 50000, max: 5000000, step: 10000, set: setAmt },
              { label: "Tenure (years)", val: years, min: 1, max: 25, step: 1, set: setYears },
              { label: "Interest rate (% p.a.)", val: rate, min: 5, max: 18, step: 0.25, set: (v: number) => setRate(v) },
            ].map((f) => (
              <div key={f.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-semibold text-foreground">{typeof f.val === "number" ? f.val.toLocaleString() : f.val}</span>
                </div>
                <input
                  type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={(e) => f.set(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="surface-card flex h-full flex-col justify-center p-8 text-center">
            <Calculator className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-sm uppercase tracking-wider text-muted-foreground">Monthly EMI</p>
            <p className="mt-2 font-display text-5xl font-extrabold text-foreground">৳ {emi.toLocaleString()}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border p-4">
                <p className="text-muted-foreground">Total payable</p>
                <p className="mt-1 font-semibold text-foreground">৳ {total.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-muted-foreground">Interest</p>
                <p className="mt-1 font-semibold text-foreground">৳ {(total - amt).toLocaleString()}</p>
              </div>
            </div>
            <Button asChild className="mt-6 gradient-brand text-primary-foreground">
              <Link to="/loans">Apply for this loan</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Section 6: Security pillars ---------------- */
function SecurityPillars() {
  const cards = [
    { i: ShieldCheck, t: "Multi-factor auth", d: "OTP, biometric and device-trust binding for every login." },
    { i: Activity, t: "24/7 fraud monitoring", d: "AI models flag suspicious activity within milliseconds." },
    { i: Smartphone, t: "Instant card controls", d: "Freeze, set limits and toggle channels from your phone." },
    { i: Coins, t: "Insured deposits", d: "All deposits protected under Bangladesh Bank guidelines." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Security first</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Your money, vault-grade safe.</h2>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.t} delay={i * 80}>
            <div className="surface-card group relative overflow-hidden p-6 transition hover:-translate-y-1">
              <div className="absolute inset-0 -z-10 opacity-0 transition group-hover:opacity-100"
                   style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 8%, transparent), transparent)" }} />
              <c.i className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Section 7: Testimonials carousel ---------------- */
function Testimonials() {
  const items = [
    { n: "Ayesha Rahman", r: "Entrepreneur, Dhaka", q: "Opening a current account took less than 10 minutes. The new app is genuinely a joy to use." },
    { n: "Md. Karim", r: "Remitter, Riyadh", q: "Sending money home is instant now — my family receives it before I close the app." },
    { n: "Tahmina Akter", r: "Salaried, Chattogram", q: "I love the budgeting insights. I finally know where my salary disappears every month." },
    { n: "Rafiq Hassan", r: "SME Owner, Sylhet", q: "Pubali Bank approved my SME loan in 4 days. Fast, transparent and very supportive." },
  ];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI(v => (v + 1) % items.length), 4500); return () => clearInterval(id); }, [items.length]);
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <Quote className="mx-auto h-10 w-10 text-primary" />
        <div className="relative mt-6 min-h-[140px]">
          {items.map((t, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-all duration-700"
              style={{ opacity: i === idx ? 1 : 0, transform: `translateY(${i === idx ? 0 : 12}px)` }}
            >
              <p className="font-display text-xl text-foreground sm:text-2xl">"{t.q}"</p>
              <p className="mt-5 text-sm font-semibold text-foreground">{t.n}</p>
              <p className="text-xs text-muted-foreground">{t.r}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-3 bg-border"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section 8: Mobile app preview with parallax ---------------- */
function AppPreview() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Mobile app</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Pubali in your pocket.</h2>
          <p className="mt-4 text-muted-foreground">Bills, transfers, deposits, cards and customer support — all from one beautifully designed mobile experience.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="gradient-brand text-primary-foreground">Download for iOS</Button>
            <Button variant="outline">Get it on Android</Button>
          </div>
        </Reveal>
        <div className="relative mx-auto h-[460px] w-[230px]">
          <div
            className="absolute inset-0 rounded-[2.5rem] border-[10px] border-foreground/80 bg-card shadow-2xl"
            style={{ transform: `translateY(${y * -0.04}px)` }}
          >
            <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/60" />
            <div className="flex h-full flex-col gap-3 overflow-hidden p-4 pt-7">
              <div className="rounded-2xl gradient-brand p-4 text-primary-foreground">
                <p className="text-[10px] uppercase tracking-wider opacity-80">Balance</p>
                <p className="mt-1 font-display text-xl font-bold">৳ 482,350</p>
              </div>
              {[{ t: "Salary credit", a: "+৳95,000", g: true }, { t: "Grameenphone", a: "-৳499", g: false }, { t: "Daraz order", a: "-৳2,140", g: false }, { t: "FX inward", a: "+৳18,200", g: true }].map(r => (
                <div key={r.t} className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                  <span className="text-muted-foreground">{r.t}</span>
                  <span className={r.g ? "font-semibold text-success" : "font-semibold text-foreground"}>{r.a}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-primary/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section 9: Branch network with interactive grid ---------------- */
function BranchNetwork() {
  const cities = ["Dhaka","Chattogram","Sylhet","Khulna","Rajshahi","Barishal","Rangpur","Mymensingh","Cumilla","Narayanganj","Bogura","Jashore"];
  const [hover, setHover] = useState<string | null>(null);
  const data = [{ name: "Urban", value: 60 }, { name: "Semi-urban", value: 28 }, { name: "Rural", value: 12 }];
  const colors = ["var(--color-primary)", "#d4a017", "var(--color-muted-foreground)"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Nationwide</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">500+ branches across Bangladesh.</h2>
          <p className="mt-4 text-muted-foreground">From the heart of Dhaka to the riverbanks of Barishal — Pubali Bank is always nearby. Hover a district to learn more.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {cities.map(c => (
              <button key={c} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)}
                className="group flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-foreground">
                <MapPin className="h-3 w-3 text-primary opacity-0 transition group-hover:opacity-100" /> {c}
              </button>
            ))}
          </div>
          {hover && <p className="mt-4 text-sm text-foreground">Pubali Bank operates multiple branches across <span className="font-semibold text-primary">{hover}</span>.</p>}
        </Reveal>
        <Reveal delay={120}>
          <div className="surface-card grid h-80 place-items-center p-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3}>
                  {data.map((_, idx) => <Cell key={idx} fill={colors[idx]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Section 10: FAQ accordion ---------------- */
function FAQ() {
  const faqs = [
    { q: "How do I open an account online?", a: "Sign up with your NID, take a selfie and answer a few questions — your account is ready in minutes." },
    { q: "Is mobile banking really free?", a: "Yes. All standard transfers, balance checks and bill payments are free of charge for retail customers." },
    { q: "How fast are loan approvals?", a: "Most personal loans are pre-approved within 24 hours. Home and SME loans take 3-5 working days." },
    { q: "Can I receive international remittance?", a: "Yes — we partner with 80+ exchange houses worldwide. Funds typically arrive within minutes." },
    { q: "Are my deposits insured?", a: "All deposits are protected under Bangladesh Bank's deposit insurance scheme." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Common questions, answered.</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className="surface-card overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left">
                    <span className="font-medium text-foreground">{f.q}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className="grid transition-all duration-500 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
            <span className="ml-2">4.8 / 5 from 12,400+ app reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Master export ---------------- */
export function HomeSections() {
  return (
    <>
      <MarketTicker />
      <StatsImpact />
      <ProductExplorer />
      <SpendingInsights />
      <LoanCalculator />
      <SecurityPillars />
      <Testimonials />
      <AppPreview />
      <BranchNetwork />
      <FAQ />
    </>
  );
}

export default HomeSections;

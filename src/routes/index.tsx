import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Smartphone, Globe2, Landmark, ArrowRight, CreditCard, Wallet, Banknote, Sparkles, ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { HomeSections } from "@/components/landing/HomeSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pubali Bank Limited — Modern Digital Banking in Bangladesh" },
      { name: "description", content: "Secure accounts, instant transfers, low-rate loans, premium cards and 500+ branches. Bank with the spirit of tradition." },
      { property: "og:title", content: "Pubali Bank Limited — Modern Digital Banking" },
      { property: "og:description", content: "ঐতিহ্যের পথ বেয়ে অর্থনৈতিক অগ্রগতি — Bank with the spirit of tradition." },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: ShieldCheck, title: "Bank-grade security", body: "Multi-factor authentication, biometric login and 24/7 fraud monitoring keep your money safe." },
  { icon: Smartphone, title: "Modern digital banking", body: "Manage accounts, pay bills and send money in seconds from any device." },
  { icon: Globe2, title: "Global remittance", body: "Receive funds from 80+ countries directly to your Pubali Bank account." },
  { icon: Landmark, title: "500+ branches & ATMs", body: "A nationwide network — from Dhaka to your hometown — always nearby." },
];

const products = [
  { icon: Wallet, title: "Personal Banking", desc: "Savings, salary and current accounts tailored to your life." },
  { icon: CreditCard, title: "Cards", desc: "Visa Platinum, Mastercard Gold and Signature cards with global acceptance." },
  { icon: Banknote, title: "Loans", desc: "Home, auto, personal and SME loans from 8.75% p.a." },
];

function LandingPage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#products" className="hover:text-foreground">Personal</a>
            <a href="#products" className="hover:text-foreground">Business</a>
            <a href="#features" className="hover:text-foreground">Why Pubali</a>
            <Link to="/branches" className="hover:text-foreground">Branches</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="gradient-brand text-primary-foreground">
              <Link to="/auth">Open account</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Banking since 1959 · Reimagined for today
            </span>
            <h1 className="mt-6 font-bangla text-3xl font-bold leading-tight text-foreground sm:text-5xl">
              ঐতিহ্যের পথ বেয়ে <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">অর্থনৈতিক অগ্রগতি</span>
            </h1>
            <p className="mt-4 max-w-xl font-display text-2xl font-bold text-foreground sm:text-3xl">
              Modern banking, the way it should be.
            </p>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Open an account in minutes, send money instantly, and manage every taka with Pubali Bank's new digital experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-brand text-primary-foreground shadow-lg">
                <Link to="/auth">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/loans">Explore loans</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
              <div><p className="font-display text-2xl font-bold text-foreground">500+</p><p className="text-xs text-muted-foreground">Branches</p></div>
              <div><p className="font-display text-2xl font-bold text-foreground">2.8M+</p><p className="text-xs text-muted-foreground">Customers</p></div>
              <div><p className="font-display text-2xl font-bold text-foreground">65 yrs</p><p className="text-xs text-muted-foreground">of trust</p></div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 to-gold/30 blur-2xl" />
            <div className="relative rotate-1 rounded-3xl border border-border bg-card p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Primary Savings</p>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">Active</span>
              </div>
              <p className="font-display text-3xl font-extrabold text-foreground">৳ 482,350.75</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">1234 5678 9012</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                {["Send","Pay Bill","Top-up"].map((l) => (
                  <div key={l} className="rounded-xl border border-border bg-background py-3 font-medium text-foreground hover:border-primary/40">{l}</div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { t: "Salary — Ace Limited", a: "+ ৳95,000", g: true },
                  { t: "DESCO Electricity", a: "− ৳3,120", g: false },
                  { t: "BKash Payment", a: "− ৳4,500", g: false },
                ].map((r) => (
                  <div key={r.t} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{r.t}</span>
                    <span className={r.g ? "font-semibold text-success" : "font-semibold text-foreground"}>{r.a}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden w-44 -rotate-6 rounded-2xl gradient-brand p-4 text-primary-foreground shadow-xl sm:block">
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/80">Visa Platinum</p>
              <p className="mt-3 font-mono text-xs tracking-widest">**** 4421</p>
              <p className="mt-1 text-sm font-semibold">৳ 251,250 available</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Why Pubali</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">A bank built for every Bangladeshi.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="surface-card p-6 transition hover:-translate-y-1">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Products</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Everything you need, in one bank.</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/auth">See all services <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((p) => (
            <div key={p.title} className="group surface-card p-6 transition hover:-translate-y-1">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <Link to="/auth" className="mt-5 inline-flex items-center text-sm font-medium text-primary transition group-hover:gap-2">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <HomeSections />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">

        <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 text-primary-foreground sm:p-12">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to bank the modern way?</h2>
              <p className="mt-3 max-w-xl text-primary-foreground/80">Sign in to your demo account and explore the new Pubali Bank digital experience.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link to="/auth">Sign in to demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/branches">Find a branch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <BrandMark />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">Pubali Bank Limited. Banking the way it should be — since 1959.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Banking</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/accounts" className="hover:text-foreground">Accounts</Link></li>
                <li><Link to="/cards" className="hover:text-foreground">Cards</Link></li>
                <li><Link to="/loans" className="hover:text-foreground">Loans</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Services</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/transfer" className="hover:text-foreground">Fund Transfer</Link></li>
                <li><Link to="/fx" className="hover:text-foreground">Exchange Rates</Link></li>
                <li><Link to="/branches" className="hover:text-foreground">Branch Locator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>26 Dilkusha C/A, Dhaka 1000</li>
                <li>+880 2 9555881</li>
                <li>info@pubalibangla.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Pubali Bank Limited. All rights reserved.</p>
            <p className="font-bangla">পূবালী ব্যাংক লিমিটেড</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

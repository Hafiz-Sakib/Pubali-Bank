import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, CreditCard, ArrowLeftRight, Receipt, Banknote, Plus, Smartphone, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart } from "recharts";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { StatCard } from "@/components/banking/StatCard";
import { AccountCard } from "@/components/banking/AccountCard";
import { TransactionRow } from "@/components/banking/TransactionRow";
import { accounts, transactions, balanceHistory, spendingByCategory, formatBDT } from "@/lib/banking-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Pubali Bank" }] }),
  component: DashboardPage,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary-glow)"];

function DashboardPage() {
  const { user } = useAuth();
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const monthIn = transactions.filter((t) => t.type === "credit" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const monthOut = transactions.filter((t) => t.type === "debit" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const recent = useMemo(() => transactions.slice(0, 6), []);

  return (
    <>
      <Topbar title={`Welcome back, ${user?.name.split(" ")[0]}`} subtitle="Here's what's happening with your money today." />
      <PageContainer>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Balance" value={formatBDT(totalBalance)} sub={`Across ${accounts.length} accounts`} icon={Wallet} accent="primary" />
          <StatCard label="Money In (30d)" value={formatBDT(monthIn)} sub="+12.4% vs last month" icon={ArrowDownLeft} accent="success" />
          <StatCard label="Money Out (30d)" value={formatBDT(monthOut)} sub="−3.1% vs last month" icon={ArrowUpRight} accent="destructive" />
          <StatCard label="Cards Available" value={formatBDT(388810)} sub="2 active cards" icon={CreditCard} accent="gold" />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="surface-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">Balance trend</h3>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                <TrendingUp className="h-3 w-3" /> +18.6%
              </span>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bal" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatBDT(v)} />
                  <Area type="monotone" dataKey="balance" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#bal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card p-5">
            <h3 className="font-display text-base font-semibold text-foreground">Spending by category</h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spendingByCategory} dataKey="amount" nameKey="category" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {spendingByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatBDT(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5 text-xs">
              {spendingByCategory.map((s, i) => (
                <li key={s.category} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{s.category}</span>
                  <span className="font-medium text-foreground tabular-nums">{formatBDT(s.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-foreground">Your accounts</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/accounts">View all</Link></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AccountCard account={accounts[0]} featured />
            <AccountCard account={accounts[1]} />
            <AccountCard account={accounts[2]} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="surface-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="font-display text-base font-semibold text-foreground">Recent transactions</h3>
              <Button asChild variant="ghost" size="sm"><Link to="/transactions">See all</Link></Button>
            </div>
            <div>{recent.map((t) => <TransactionRow key={t.id} tx={t} />)}</div>
          </div>

          <div className="surface-card p-5">
            <h3 className="font-display text-base font-semibold text-foreground">Quick actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: ArrowLeftRight, label: "Transfer", to: "/transfer" },
                { icon: Receipt, label: "Pay Bills", to: "/transactions" },
                { icon: Smartphone, label: "Top-up", to: "/transfer" },
                { icon: CreditCard, label: "Cards", to: "/cards" },
                { icon: Banknote, label: "FX Rates", to: "/fx" },
                { icon: Plus, label: "New Loan", to: "/loans" },
              ].map((a) => (
                <Link key={a.label} to={a.to} className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium text-foreground">{a.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 rounded-xl gradient-gold p-4 text-gold-foreground">
              <Zap className="h-5 w-5" />
              <p className="mt-2 font-display text-sm font-bold">Pre-approved Personal Loan</p>
              <p className="text-xs">Up to ৳15,00,000 at 9.5% p.a.</p>
              <Button asChild size="sm" className="mt-3 bg-foreground text-background hover:bg-foreground/90"><Link to="/loans">Apply now</Link></Button>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
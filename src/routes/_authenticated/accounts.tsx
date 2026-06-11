import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { AccountCard } from "@/components/banking/AccountCard";
import { StatCard } from "@/components/banking/StatCard";
import { accounts, transactions, formatBDT, formatDate } from "@/lib/banking-data";
import { Wallet, TrendingUp, PiggyBank, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Pubali Bank" }] }),
  ssr: false,
  component: AccountsPage,
});

function AccountsPage() {
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const savings = accounts.filter(a => a.type !== "Current").reduce((s, a) => s + a.balance, 0);

  return (
    <>
      <Topbar title="My Accounts" subtitle="All your Pubali Bank accounts in one place." />
      <PageContainer>
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Net worth" value={formatBDT(total)} icon={Wallet} />
          <StatCard label="Savings" value={formatBDT(savings)} icon={PiggyBank} accent="success" />
          <StatCard label="Active accounts" value={String(accounts.length)} sub="+1 FDR maturing in 14 months" icon={TrendingUp} accent="gold" />
        </section>

        <section className="mt-6 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">All accounts</h3>
          <Button size="sm" className="gradient-brand text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> Open new</Button>
        </section>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a, i) => <AccountCard key={a.id} account={a} featured={i === 0} />)}
        </div>

        <section className="mt-8 surface-card overflow-hidden">
          <div className="border-b border-border p-5">
            <h3 className="font-display text-base font-semibold text-foreground">Account activity summary</h3>
            <p className="text-xs text-muted-foreground">Last few transactions per account</p>
          </div>
          <div className="divide-y divide-border">
            {accounts.map((a) => {
              const list = transactions.filter(t => t.accountId === a.id).slice(0, 3);
              return (
                <div key={a.id} className="grid gap-4 p-5 md:grid-cols-[260px_minmax(0,1fr)]">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{a.type} · {a.branch}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{a.name}</p>
                    <p className="mt-2 font-display text-xl font-bold text-foreground">{formatBDT(a.balance)}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{a.number}</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {list.length === 0 ? <li className="text-muted-foreground">No recent activity</li> : list.map(t => (
                      <li key={t.id} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-foreground">{t.description}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatDate(t.date)}</span>
                        <span className={t.type === "credit" ? "shrink-0 font-semibold text-success" : "shrink-0 font-semibold text-foreground"}>
                          {t.type === "credit" ? "+" : "−"} {formatBDT(t.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
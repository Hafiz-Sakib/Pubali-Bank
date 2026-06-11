import type { Account } from "@/lib/banking-data";
import { formatBDT } from "@/lib/banking-data";
import { Wallet, CreditCard, Briefcase, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

const iconByType = { Savings: PiggyBank, Current: Briefcase, Salary: Wallet, FDR: CreditCard } as const;

export function AccountCard({ account, featured }: { account: Account; featured?: boolean }) {
  const Icon = iconByType[account.type];
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-xl",
      featured ? "gradient-brand border-transparent text-primary-foreground" : "border-border bg-card text-card-foreground",
    )}>
      {featured ? <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl" /> : null}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-xs font-medium uppercase tracking-wide", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {account.type} · {account.branch}
          </p>
          <p className={cn("mt-1 truncate text-sm", featured ? "text-primary-foreground/90" : "text-foreground")}>{account.name}</p>
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", featured ? "bg-white/15" : "bg-primary/10 text-primary")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={cn("mt-6 font-display text-2xl font-bold sm:text-3xl", featured ? "text-primary-foreground" : "text-foreground")}>
        {formatBDT(account.balance)}
      </p>
      <p className={cn("mt-2 font-mono text-xs tracking-wider", featured ? "text-primary-foreground/70" : "text-muted-foreground")}>{account.number}</p>
    </div>
  );
}
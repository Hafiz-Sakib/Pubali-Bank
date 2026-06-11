import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, sub, icon: Icon, accent = "primary", className }: {
  label: string; value: string; sub?: string; icon?: LucideIcon; accent?: "primary" | "gold" | "success" | "destructive"; className?: string;
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold-foreground",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  }[accent];
  return (
    <div className={cn("surface-card p-5 transition hover:shadow-lg", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
          {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", accentClass)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
import type { Transaction } from "@/lib/banking-data";
import { formatBDT, formatDate } from "@/lib/banking-data";
import { ArrowDownLeft, ArrowUpRight, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === "credit";
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/40">
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", isCredit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
        {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
        <p className="truncate text-xs text-muted-foreground">{formatDate(tx.date)} · {tx.category} · {tx.reference}</p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold tabular-nums", isCredit ? "text-success" : "text-foreground")}>
          {isCredit ? "+" : "−"} {formatBDT(tx.amount)}
        </p>
        {tx.status !== "completed" ? (
          <Badge variant={tx.status === "pending" ? "secondary" : "destructive"} className="mt-1 gap-1 text-[10px]">
            {tx.status === "pending" ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {tx.status}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
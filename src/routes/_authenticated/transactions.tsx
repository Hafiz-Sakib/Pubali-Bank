import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { TransactionRow } from "@/components/banking/TransactionRow";
import { transactions, accounts, formatBDT } from "@/lib/banking-data";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Pubali Bank" }] }),
  ssr: false,
  component: TransactionsPage,
});

const categories = ["All","Salary","Transfer","Bills","Shopping","Food","Travel","ATM","Investment","Other"];

function TransactionsPage() {
  const [q, setQ] = useState("");
  const [accountId, setAccountId] = useState("all");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => transactions.filter(t => {
    if (q && !`${t.description} ${t.reference}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (accountId !== "all" && t.accountId !== accountId) return false;
    if (category !== "All" && t.category !== category) return false;
    if (type !== "all" && t.type !== type) return false;
    return true;
  }), [q, accountId, category, type]);

  const totals = filtered.reduce((acc, t) => {
    if (t.status !== "completed") return acc;
    if (t.type === "credit") acc.in += t.amount; else acc.out += t.amount;
    return acc;
  }, { in: 0, out: 0 });

  function exportCsv() {
    const header = ["Date","Description","Category","Reference","Type","Amount","Status"];
    const rows = filtered.map(t => [new Date(t.date).toISOString().slice(0,10), t.description, t.category, t.reference, t.type, t.amount.toString(), t.status]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pubali-transactions-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions`);
  }

  return (
    <>
      <Topbar title="Transactions" subtitle="Search, filter, and export your transaction history." />
      <PageContainer>
        <section className="surface-card p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search description, reference…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Account" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportCsv} variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Filter className="h-3 w-3" /> {filtered.length} of {transactions.length} shown</span>
            <span>Money in: <strong className="text-success">{formatBDT(totals.in)}</strong></span>
            <span>Money out: <strong className="text-foreground">{formatBDT(totals.out)}</strong></span>
          </div>
        </section>

        <section className="mt-5 surface-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No transactions match your filters.</div>
          ) : filtered.map(t => <TransactionRow key={t.id} tx={t} />)}
        </section>
      </PageContainer>
    </>
  );
}
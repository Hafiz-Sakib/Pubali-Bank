import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { fxRates, formatBDT } from "@/lib/banking-data";
import { ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/fx")({
  head: () => ({ meta: [{ title: "Exchange Rates — Pubali Bank" }] }),
  ssr: false,
  component: FxPage,
});

function FxPage() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BDT");

  const fromRate = fxRates.find(r => r.code === from);
  const toRate = fxRates.find(r => r.code === to);
  let converted = amount;
  if (from === "BDT" && toRate) converted = amount / toRate.sell;
  else if (to === "BDT" && fromRate) converted = amount * fromRate.buy;
  else if (fromRate && toRate) converted = (amount * fromRate.buy) / toRate.sell;

  return (
    <>
      <Topbar title="Foreign Exchange" subtitle="Live indicative rates and currency converter." />
      <PageContainer>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border p-5">
              <h3 className="font-display text-base font-semibold text-foreground">Today's exchange rates</h3>
              <p className="text-xs text-muted-foreground">Rates per 1 unit foreign currency in BDT · indicative only</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Currency</th>
                    <th className="px-5 py-3 text-right font-medium">Buy (BDT)</th>
                    <th className="px-5 py-3 text-right font-medium">Sell (BDT)</th>
                    <th className="px-5 py-3 text-right font-medium">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fxRates.map(r => (
                    <tr key={r.code} className="hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl leading-none">{r.flag}</span>
                          <div><p className="font-medium text-foreground">{r.code}</p><p className="text-xs text-muted-foreground">{r.name}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">{r.buy.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">{r.sell.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", r.change >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"].join(" ")}>
                          {r.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {r.change >= 0 ? "+" : ""}{r.change.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-primary" /><h3 className="font-display text-lg font-semibold">Currency converter</h3></div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Amount</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1.5 font-display text-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">From</label>
                  <Select value={from} onValueChange={setFrom}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">🇧🇩 BDT</SelectItem>
                      {fxRates.map(r => <SelectItem key={r.code} value={r.code}>{r.flag} {r.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">To</label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">🇧🇩 BDT</SelectItem>
                      {fxRates.map(r => <SelectItem key={r.code} value={r.code}>{r.flag} {r.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl gradient-brand p-5 text-primary-foreground">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/80">You get</p>
                <p className="mt-1 font-display text-3xl font-extrabold">
                  {to === "BDT" ? formatBDT(converted) : `${converted.toFixed(4)} ${to}`}
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">Indicative · {from} → {to}</p>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
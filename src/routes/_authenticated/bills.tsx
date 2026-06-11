import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Smartphone, Wifi, Tv2, Flame, Droplets, GraduationCap, Check } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/banking/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { accounts, formatBDT } from "@/lib/banking-data";

export const Route = createFileRoute("/_authenticated/bills")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Bills & Recharge — Pubali Bank" },
      { name: "description", content: "Pay utility bills, recharge mobile, and manage payments." },
    ],
  }),
  component: BillsPage,
});

const categories = [
  { id: "electricity", label: "Electricity", icon: Zap, providers: ["DESCO", "DPDC", "REB", "NESCO", "WZPDCL"] },
  { id: "mobile", label: "Mobile Recharge", icon: Smartphone, providers: ["Grameenphone", "Robi", "Banglalink", "Teletalk", "Airtel"] },
  { id: "internet", label: "Internet", icon: Wifi, providers: ["Link3", "Amber IT", "ICC Communication", "Aamra Networks"] },
  { id: "tv", label: "Cable / TV", icon: Tv2, providers: ["Akash DTH", "Realview", "JadooTV"] },
  { id: "gas", label: "Gas", icon: Flame, providers: ["Titas Gas", "Bakhrabad Gas", "Jalalabad Gas"] },
  { id: "water", label: "Water (WASA)", icon: Droplets, providers: ["Dhaka WASA", "Chittagong WASA", "Khulna WASA"] },
  { id: "education", label: "Education", icon: GraduationCap, providers: ["BUET", "DU", "NSU", "BRAC University"] },
] as const;

interface PaymentRecord {
  id: string;
  type: string;
  provider: string;
  account: string;
  amount: number;
  at: string;
}

const HISTORY_KEY = "pbl_bill_history_v1";
function loadHistory(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveHistory(h: PaymentRecord[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function BillsPage() {
  const [category, setCategory] = useState<typeof categories[number]["id"]>("electricity");
  const [provider, setProvider] = useState<string>(categories[0].providers[0]);
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [billNo, setBillNo] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<PaymentRecord[]>(() => loadHistory());

  const current = categories.find((c) => c.id === category)!;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!billNo.trim()) return toast.error("Enter the account / mobile / bill number");
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    const rec: PaymentRecord = {
      id: "p-" + Date.now(),
      type: current.label,
      provider,
      account: billNo,
      amount: amt,
      at: new Date().toISOString(),
    };
    const next = [rec, ...history].slice(0, 30);
    setHistory(next);
    saveHistory(next);
    setBusy(false);
    setBillNo("");
    setAmount("");
    toast.success(`${formatBDT(amt)} paid to ${provider}`);
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Bills & Recharge</h1>
        <p className="text-sm text-muted-foreground">Pay utility bills and recharge in seconds.</p>
      </div>

      <Tabs defaultValue="pay">
        <TabsList>
          <TabsTrigger value="pay">Make a payment</TabsTrigger>
          <TabsTrigger value="history">Payment history</TabsTrigger>
        </TabsList>

        <TabsContent value="pay" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Choose a service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const active = c.id === category;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCategory(c.id); setProvider(c.providers[0]); }}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition ${active ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-center">{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handlePay} className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Provider</Label>
                      <Select value={provider} onValueChange={setProvider}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {current.providers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pay from</Label>
                      <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name} — {formatBDT(a.balance)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Account / Mobile / Bill no.</Label>
                      <Input value={billNo} onChange={(e) => setBillNo(e.target.value)} placeholder="e.g. 01XXXXXXXXX" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Amount (BDT)</Label>
                      <Input type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                  <Button type="submit" disabled={busy} className="h-11 gradient-brand text-primary-foreground">
                    {busy ? "Processing…" : "Pay now"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why pay with Pubali?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {[
                    "Instant confirmation, no queues",
                    "Zero convenience fee for in-house accounts",
                    "Reminders for upcoming bills",
                    "Receipts saved in your account",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" /> {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          <Card>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No payments yet.</div>
              ) : (
                <ul className="divide-y">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center justify-between p-4">
                      <div>
                        <div className="text-sm font-medium">{h.provider} <Badge variant="secondary" className="ml-1">{h.type}</Badge></div>
                        <div className="text-xs text-muted-foreground">{h.account} · {new Date(h.at).toLocaleString()}</div>
                      </div>
                      <div className="font-mono text-sm text-foreground">-{formatBDT(h.amount)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

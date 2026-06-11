import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Shield, ArrowLeftRight, CreditCard, Megaphone, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/banking/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/notifications")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Notifications — Pubali Bank" }],
  }),
  component: NotificationsPage,
});

type NType = "transaction" | "security" | "alert" | "promo";
interface Notif {
  id: string;
  type: NType;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

const SEED: Notif[] = [
  { id: "n1", type: "transaction", title: "Payment received", body: "BDT 25,000 from ACME Industries credited to your Savings.", at: "2026-06-10T09:14:00Z", read: false },
  { id: "n2", type: "security", title: "New device sign-in", body: "Chrome on Windows from Dhaka. If this wasn't you, secure your account.", at: "2026-06-10T08:02:00Z", read: false },
  { id: "n3", type: "alert", title: "Card spending limit reached 80%", body: "Your Platinum Credit card is at 80% of monthly limit.", at: "2026-06-09T18:30:00Z", read: false },
  { id: "n4", type: "transaction", title: "Bill paid", body: "DESCO bill of BDT 1,840 paid successfully.", at: "2026-06-09T11:20:00Z", read: true },
  { id: "n5", type: "promo", title: "0% EMI on electronics", body: "Use your Pubali Credit Card for 0% EMI up to 12 months.", at: "2026-06-08T14:00:00Z", read: true },
  { id: "n6", type: "security", title: "Password changed", body: "Your account password was updated successfully.", at: "2026-06-07T20:00:00Z", read: true },
];

const KEY = "pbl_notifications_v1";
const loadAll = (): Notif[] => {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch { return SEED; }
};
const saveAll = (n: Notif[]) => {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(n));
};

const ICONS: Record<NType, typeof Bell> = {
  transaction: ArrowLeftRight,
  security: Shield,
  alert: CreditCard,
  promo: Megaphone,
};

function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>(SEED);
  const [tab, setTab] = useState<"all" | "unread" | NType>("all");

  useEffect(() => { setItems(loadAll()); }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "unread") return items.filter((i) => !i.read);
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  const markAll = () => {
    const next = items.map((i) => ({ ...i, read: true }));
    setItems(next); saveAll(next);
    toast.success("All notifications marked as read");
  };
  const toggle = (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, read: !i.read } : i));
    setItems(next); saveAll(next);
  };

  const unread = items.filter((i) => !i.read).length;

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread} unread · {items.length} total</p>
        </div>
        <Button variant="outline" onClick={markAll} disabled={unread === 0}>
          <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="transaction">Transactions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
          <TabsTrigger value="promo">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-5">
          <Card>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">You're all caught up.</div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((n) => {
                    const Icon = ICONS[n.type];
                    return (
                      <li key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-primary/[0.03]" : ""}`}>
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{n.title}</span>
                            {!n.read && <Badge className="h-4 px-1.5 text-[10px]">New</Badge>}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                          <div className="mt-1 text-[11px] text-muted-foreground">{new Date(n.at).toLocaleString()}</div>
                        </div>
                        <button onClick={() => toggle(n.id)} className="text-xs text-muted-foreground hover:text-foreground">
                          {n.read ? "Mark unread" : "Mark read"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

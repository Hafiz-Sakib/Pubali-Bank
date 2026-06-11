import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { creditCards, transactions, formatBDT, formatDate } from "@/lib/banking-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreditCard, Snowflake, Settings2, ShieldAlert, RefreshCw, Ban, Globe, Wifi } from "lucide-react";
import { useBankingStore, getCardSettings, setCardSettings, log, useHydrated } from "@/lib/banking-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cards")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cards — Pubali Bank" },
      { name: "description", content: "View, freeze, set spending limits and manage your Pubali Bank credit and debit cards." },
      { property: "og:title", content: "Cards — Pubali Bank" },
      { property: "og:description", content: "View, freeze, set spending limits and manage your Pubali Bank credit and debit cards." },
      { property: "og:url", content: "/cards" },
    ],
    links: [{ rel: "canonical", href: "/cards" }],
  }),
  component: CardsPage,
});

function CardsPage() {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const hydrated = useHydrated();
  const cardSettings = useBankingStore((s) => s.cardSettings);

  const cardTx = transactions
    .filter((t) => t.category === "Shopping" || t.category === "Food" || t.category === "Travel" || t.category === "ATM")
    .slice(0, 8);
  const totalSpend = cardTx.reduce((a, b) => a + b.amount, 0);

  if (!hydrated) {
    return (
      <>
        <Topbar title="Cards" subtitle="Manage your cards — freeze, set limits, toggle channels and request replacements." />
        <PageContainer>
          <div className="grid gap-5 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="surface-card h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Topbar title="Cards" subtitle="Manage your cards — freeze, set limits, toggle channels and request replacements." />
      <PageContainer>
        <section className="grid gap-5 lg:grid-cols-2">
          {creditCards.map((c, i) => {
            const s = cardSettings[c.id] ?? getCardSettings(c.id);
            const pct = (c.outstanding / c.limit) * 100;
            return (
              <div key={c.id} className="surface-card overflow-hidden p-0">
                <div
                  className={[
                    "relative p-6 text-primary-foreground",
                    s.blocked ? "bg-destructive" : s.frozen ? "bg-slate-600" : i === 0 ? "gradient-brand" : "bg-foreground",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-primary-foreground/80">{c.type}</p>
                      <p className="mt-1 font-display text-base font-semibold">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.frozen ? (
                        <Badge className="bg-white/20 text-white">
                          <Snowflake className="mr-1 h-3 w-3" />Frozen
                        </Badge>
                      ) : null}
                      {s.blocked ? (
                        <Badge className="bg-white/20 text-white">
                          <Ban className="mr-1 h-3 w-3" />Blocked
                        </Badge>
                      ) : null}
                      <CreditCard className="h-6 w-6 text-primary-foreground/80" />
                    </div>
                  </div>
                  <p className="relative mt-10 font-mono text-lg tracking-[0.3em]">{c.number}</p>
                  <div className="relative mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-primary-foreground/70">Available</p>
                      <p className="font-display text-xl font-bold">{formatBDT(c.available)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-primary-foreground/70">Limit</p>
                      <p className="text-sm">{formatBDT(c.limit)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Used {Math.round(pct)}%</span>
                    <span className="font-medium text-foreground">
                      {formatBDT(c.outstanding)} / {formatBDT(c.limit)}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2" />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="rounded-lg border border-border p-2">
                      <p className="text-muted-foreground">Total due</p>
                      <p className="mt-1 font-semibold text-foreground">{formatBDT(c.dueAmount)}</p>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <p className="text-muted-foreground">Minimum</p>
                      <p className="mt-1 font-semibold text-foreground">{formatBDT(c.minDue)}</p>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <p className="text-muted-foreground">Due date</p>
                      <p className="mt-1 font-semibold text-foreground">{formatDate(c.dueDate)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="gradient-brand text-primary-foreground" disabled={s.blocked}>
                      Pay now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={s.blocked}
                      onClick={() => {
                        setCardSettings(c.id, { frozen: !s.frozen });
                        log({ type: "card", message: `${s.frozen ? "Unfroze" : "Froze"} card ${c.name}` });
                        toast.success(s.frozen ? "Card unfrozen" : "Card frozen");
                      }}
                    >
                      <Snowflake className="mr-1 h-4 w-4" />
                      {s.frozen ? "Unfreeze" : "Freeze"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setOpenCard(c.id)}>
                      <Settings2 className="mr-1 h-4 w-4" />Settings
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">Card statements</h3>
                <p className="text-xs text-muted-foreground">Across all your Pubali Bank cards</p>
              </div>
            </div>
            <Tabs defaultValue="recent">
              <TabsList className="mx-5 mt-4 grid w-fit grid-cols-2">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="recent">
                <div className="divide-y divide-border">
                  {cardTx.map((t) => (
                    <div key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{t.description}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDate(t.date)} · {t.category}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground tabular-nums">− {formatBDT(t.amount)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="p-5">
                <p className="text-sm text-muted-foreground">Spend last 30 days</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{formatBDT(totalSpend)}</p>
                <div className="mt-4 space-y-2">
                  {["Shopping", "Food", "Travel", "ATM"].map((cat) => {
                    const sum = cardTx.filter((t) => t.category === cat).reduce((a, b) => a + b.amount, 0);
                    const catPct = totalSpend ? (sum / totalSpend) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs">
                          <span>{cat}</span>
                          <span className="font-medium">{formatBDT(sum)}</span>
                        </div>
                        <Progress value={catPct} className="mt-1 h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldAlert className="h-4 w-4 text-primary" />Security tips
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs text-muted-foreground">
              <li>Freeze your card immediately if misplaced — no charges can be made.</li>
              <li>Disable international transactions until you travel.</li>
              <li>Set a low daily spend limit on cards used for online shopping.</li>
              <li>Block &amp; replace a card if you suspect it has been compromised.</li>
            </ul>
          </div>
        </section>
      </PageContainer>

      <CardSettingsDialog cardId={openCard} onClose={() => setOpenCard(null)} />
    </>
  );
}

function CardSettingsDialog({ cardId, onClose }: { cardId: string | null; onClose: () => void }) {
  const card = creditCards.find((c) => c.id === cardId);
  const cardSettings = useBankingStore((s) => s.cardSettings);
  if (!card) return null;
  const s = cardSettings[card.id] ?? getCardSettings(card.id);
  return (
    <Dialog open={!!cardId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card.name} — settings</DialogTitle>
          <DialogDescription>Card-level controls take effect immediately.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Row label="Freeze card" hint="Temporarily block all transactions" icon={<Snowflake className="h-4 w-4" />}>
            <Switch
              checked={s.frozen}
              onCheckedChange={(v) => {
                setCardSettings(card.id, { frozen: v });
                toast.success(v ? "Card frozen" : "Card unfrozen");
              }}
              disabled={s.blocked}
            />
          </Row>
          <Row label="Online transactions" hint="E-commerce and in-app payments" icon={<Wifi className="h-4 w-4" />}>
            <Switch
              checked={s.onlineEnabled}
              onCheckedChange={(v) => setCardSettings(card.id, { onlineEnabled: v })}
              disabled={s.frozen || s.blocked}
            />
          </Row>
          <Row label="International transactions" hint="Allow charges from outside Bangladesh" icon={<Globe className="h-4 w-4" />}>
            <Switch
              checked={s.internationalEnabled}
              onCheckedChange={(v) => setCardSettings(card.id, { internationalEnabled: v })}
              disabled={s.frozen || s.blocked}
            />
          </Row>
          <Row label="Contactless tap" hint="NFC payments at POS" icon={<Wifi className="h-4 w-4" />}>
            <Switch
              checked={s.contactlessEnabled}
              onCheckedChange={(v) => setCardSettings(card.id, { contactlessEnabled: v })}
              disabled={s.frozen || s.blocked}
            />
          </Row>
          <div>
            <div className="flex items-baseline justify-between">
              <Label>Daily spend limit</Label>
              <span className="font-display text-sm font-bold">{formatBDT(s.dailySpendLimit)}</span>
            </div>
            <Slider
              value={[s.dailySpendLimit]}
              min={10000}
              max={500000}
              step={5000}
              onValueChange={([v]) => setCardSettings(card.id, { dailySpendLimit: v })}
              className="mt-3"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>৳10,000</span>
              <span>৳5,00,000</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCardSettings(card.id, { replacementRequested: true });
                toast.success("Replacement card requested");
                log({ type: "card", message: `Requested replacement for ${card.name}` });
              }}
              disabled={s.replacementRequested}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              {s.replacementRequested ? "Replacement requested" : "Replace card"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCardSettings(card.id, { blocked: true, frozen: true });
                toast.success("Card permanently blocked");
                log({ type: "card", message: `Blocked card ${card.name}` });
                onClose();
              }}
              disabled={s.blocked}
            >
              <Ban className="mr-1 h-4 w-4" />Block permanently
            </Button>
          </div>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

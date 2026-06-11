import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { accounts, beneficiaries, formatBDT, formatDate } from "@/lib/banking-data";
import {
  createTransfer,
  transferUsage,
  useBankingStore,
  useHydrated,
  DAILY_LIMIT,
  MONTHLY_LIMIT,
  PER_TXN_LIMIT,
  type TransferRecord,
} from "@/lib/banking-store";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Printer, Download, History } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/transfer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Transfer — Pubali Bank" },
      { name: "description", content: "Send money instantly to your own accounts, saved beneficiaries, or any other bank in Bangladesh." },
      { property: "og:title", content: "Transfer — Pubali Bank" },
      { property: "og:description", content: "Send money instantly to your own accounts, saved beneficiaries, or any other bank in Bangladesh." },
      { property: "og:url", content: "/transfer" },
    ],
    links: [{ rel: "canonical", href: "/transfer" }],
  }),
  component: TransferPage,
});

const baseSchema = z.object({
  fromAccount: z.string().min(1),
  amount: z.coerce.number().positive("Enter an amount").max(PER_TXN_LIMIT, `Per-transfer limit is ৳${PER_TXN_LIMIT.toLocaleString()}`),
  note: z.string().max(120).optional(),
});

const ownSchema = baseSchema.extend({ toAccount: z.string().min(1, "Select destination account") });
const benSchema = baseSchema.extend({ beneficiaryId: z.string().min(1, "Select beneficiary") });
const extSchema = baseSchema.extend({
  toName: z.string().min(2, "Recipient name required"),
  toBank: z.string().min(2, "Bank required"),
  toAccount: z.string().min(6, "Account number required"),
});

function TransferPage() {
  const [kind, setKind] = useState<"own" | "beneficiary" | "external">("own");
  return (
    <>
      <Topbar title="Send Money" subtitle="Transfer funds securely with OTP confirmation and full receipts." />
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="surface-card p-6">
            <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="own">Own account</TabsTrigger>
                <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
                <TabsTrigger value="external">Other bank</TabsTrigger>
              </TabsList>
              <TabsContent value="own" className="pt-5"><OwnTransferForm /></TabsContent>
              <TabsContent value="beneficiary" className="pt-5"><BeneficiaryForm /></TabsContent>
              <TabsContent value="external" className="pt-5"><ExternalForm /></TabsContent>
            </Tabs>
          </section>
          <aside className="space-y-4">
            <LimitsCard />
            <HistoryCard />
          </aside>
        </div>
      </PageContainer>
    </>
  );
}

function LimitsCard() {
  const hydrated = useHydrated();
  const usage = useBankingStore(() => (hydrated ? transferUsage() : { daily: 0, monthly: 0 }));
  const dPct = Math.min(100, (usage.daily / DAILY_LIMIT) * 100);
  const mPct = Math.min(100, (usage.monthly / MONTHLY_LIMIT) * 100);
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" /> Transfer limits
      </div>
      <div className="mt-4 space-y-4 text-xs">
        <div>
          <div className="flex justify-between text-muted-foreground"><span>Per transfer</span><span className="font-medium text-foreground">{formatBDT(PER_TXN_LIMIT)}</span></div>
        </div>
        <div>
          <div className="flex justify-between text-muted-foreground"><span>Today</span><span className="font-medium text-foreground">{formatBDT(usage.daily)} / {formatBDT(DAILY_LIMIT)}</span></div>
          <Progress value={dPct} className="mt-2 h-1.5" />
        </div>
        <div>
          <div className="flex justify-between text-muted-foreground"><span>This month</span><span className="font-medium text-foreground">{formatBDT(usage.monthly)} / {formatBDT(MONTHLY_LIMIT)}</span></div>
          <Progress value={mPct} className="mt-2 h-1.5" />
        </div>
      </div>
    </div>
  );
}

function HistoryCard() {
  const transfers = useBankingStore((s) => s.transfers).slice(0, 6);
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4 text-primary" /> Recent transfers
      </div>
      {transfers.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">No transfers yet. Your activity will appear here.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {transfers.map((t) => (
            <li key={t.id} className="rounded-lg border border-border p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{t.toName}</span>
                <span className="font-semibold tabular-nums text-foreground">− {formatBDT(t.amount)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-muted-foreground">
                <span>{formatDate(t.createdAt)} · {t.kind}</span>
                <span className="rounded bg-success/10 px-1.5 py-0.5 text-success">{t.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Forms ----------

function OwnTransferForm() {
  const form = useForm<z.infer<typeof ownSchema>>({
    resolver: zodResolver(ownSchema),
    defaultValues: { fromAccount: accounts[0].id, toAccount: accounts[1].id, amount: 0, note: "" },
  });
  return (
    <ConfirmAndSend
      form={form}
      buildRecord={(v) => ({
        fromAccountId: v.fromAccount,
        toName: accounts.find((a) => a.id === v.toAccount)?.name ?? "Own account",
        toAccount: accounts.find((a) => a.id === v.toAccount)?.number ?? "",
        toBank: "Pubali Bank Limited",
        kind: "own" as const,
        amount: v.amount,
        note: v.note,
      })}
    >
      <FromAccountField form={form} />
      <div>
        <Label>To my account</Label>
        <Select value={form.watch("toAccount")} onValueChange={(v) => form.setValue("toAccount", v)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {accounts.filter((a) => a.id !== form.watch("fromAccount")).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name} · {a.number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <AmountField form={form} />
      <NoteField form={form} />
    </ConfirmAndSend>
  );
}

function BeneficiaryForm() {
  const form = useForm<z.infer<typeof benSchema>>({
    resolver: zodResolver(benSchema),
    defaultValues: { fromAccount: accounts[0].id, beneficiaryId: beneficiaries[0].id, amount: 0, note: "" },
  });
  return (
    <ConfirmAndSend
      form={form}
      buildRecord={(v) => {
        const b = beneficiaries.find((x) => x.id === v.beneficiaryId)!;
        return {
          fromAccountId: v.fromAccount,
          toName: b.name,
          toAccount: b.accountNumber,
          toBank: b.bank,
          kind: "beneficiary" as const,
          amount: v.amount,
          note: v.note,
        };
      }}
    >
      <FromAccountField form={form} />
      <div>
        <Label>Beneficiary</Label>
        <Select value={form.watch("beneficiaryId")} onValueChange={(v) => form.setValue("beneficiaryId", v)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {beneficiaries.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name} — {b.bank} · {b.accountNumber}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <AmountField form={form} />
      <NoteField form={form} />
    </ConfirmAndSend>
  );
}

function ExternalForm() {
  const form = useForm<z.infer<typeof extSchema>>({
    resolver: zodResolver(extSchema),
    defaultValues: { fromAccount: accounts[0].id, toName: "", toBank: "", toAccount: "", amount: 0, note: "" },
  });
  return (
    <ConfirmAndSend
      form={form}
      fee={10}
      buildRecord={(v) => ({
        fromAccountId: v.fromAccount,
        toName: v.toName,
        toAccount: v.toAccount,
        toBank: v.toBank,
        kind: "external" as const,
        amount: v.amount,
        note: v.note,
      })}
    >
      <FromAccountField form={form} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="toName">Recipient name</Label>
          <Input id="toName" {...form.register("toName")} className="mt-1.5" placeholder="As per bank record" />
          {form.formState.errors.toName ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.toName.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="toBank">Bank</Label>
          <Input id="toBank" {...form.register("toBank")} className="mt-1.5" placeholder="e.g. BRAC Bank" />
          {form.formState.errors.toBank ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.toBank.message}</p> : null}
        </div>
      </div>
      <div>
        <Label htmlFor="toAccount">Account number</Label>
        <Input id="toAccount" {...form.register("toAccount")} className="mt-1.5 font-mono" />
        {form.formState.errors.toAccount ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.toAccount.message}</p> : null}
      </div>
      <AmountField form={form} />
      <NoteField form={form} />
      <p className="text-xs text-muted-foreground">A flat fee of ৳10 applies for inter-bank transfers (BEFTN/RTGS).</p>
    </ConfirmAndSend>
  );
}

// ---------- Shared fields ----------
type AnyForm = ReturnType<typeof useForm<z.infer<typeof baseSchema> & Record<string, unknown>>>;

function FromAccountField({ form }: { form: any }) {
  return (
    <div>
      <Label>From account</Label>
      <Select value={form.watch("fromAccount")} onValueChange={(v: string) => form.setValue("fromAccount", v)}>
        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              <span className="flex w-full items-center justify-between gap-3">
                <span>{a.name} · {a.number}</span>
                <span className="text-muted-foreground">{formatBDT(a.balance)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AmountField({ form }: { form: any }) {
  return (
    <div>
      <Label htmlFor="amount">Amount (BDT)</Label>
      <Input id="amount" type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} className="mt-1.5 font-display text-lg" placeholder="0.00" />
      {form.formState.errors.amount ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.amount.message}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {[1000, 5000, 10000, 25000, 100000].map((v) => (
          <button key={v} type="button" onClick={() => form.setValue("amount", v, { shouldValidate: true })} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
            +{formatBDT(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoteField({ form }: { form: any }) {
  return (
    <div>
      <Label htmlFor="note">Note (optional)</Label>
      <Textarea id="note" {...form.register("note")} className="mt-1.5" rows={2} placeholder="Add a note for the recipient" />
    </div>
  );
}

// ---------- Confirm + OTP flow ----------

interface ConfirmAndSendProps<TValues extends z.infer<typeof baseSchema>> {
  form: any;
  fee?: number;
  // Forms extend the base schema with extra fields; accept any shape here.
  buildRecord: (v: any) => Omit<TransferRecord, "id" | "reference" | "status" | "createdAt" | "fee">;
  children: React.ReactNode;
}

function ConfirmAndSend<TValues extends z.infer<typeof baseSchema>>({ form, fee = 0, buildRecord, children }: ConfirmAndSendProps<TValues>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<TransferRecord | null>(null);
  const [pending, setPending] = useState<TValues | null>(null);
  const expectedOtp = useMemo(() => "123456", []);

  function onSubmit(values: TValues) {
    const from = accounts.find((a) => a.id === values.fromAccount);
    if (from && values.amount + fee > from.balance) {
      form.setError("amount", { message: "Insufficient funds" });
      toast.error("Insufficient funds in selected account");
      return;
    }
    const usage = transferUsage();
    if (usage.daily + values.amount > DAILY_LIMIT) {
      toast.error("This would exceed your daily transfer limit");
      return;
    }
    if (usage.monthly + values.amount > MONTHLY_LIMIT) {
      toast.error("This would exceed your monthly transfer limit");
      return;
    }
    setPending(values);
    setConfirmOpen(true);
  }

  async function confirmAndSend() {
    if (!pending) return;
    setConfirmOpen(false);
    setOtp("");
    setOtpOpen(true);
  }

  async function verifyOtp() {
    if (otp !== expectedOtp) {
      toast.error("Invalid OTP. Use 123456 for the demo.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const rec = createTransfer({ ...buildRecord(pending!), fee });
    setSubmitting(false);
    setOtpOpen(false);
    setReceipt(rec);
    toast.success("Transfer completed");
    form.reset({ ...pending, amount: 0, note: "" });
    setPending(null);
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {children}
        <Button type="submit" className="h-11 w-full gradient-brand text-primary-foreground">
          <ArrowRight className="mr-2 h-4 w-4" /> Review & send
        </Button>
      </form>

      {/* Confirm */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm transfer</DialogTitle>
            <DialogDescription>Please review the details below before continuing.</DialogDescription>
          </DialogHeader>
          {pending ? (
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">From</dt>
              <dd className="text-right font-medium">{accounts.find((a) => a.id === pending.fromAccount)?.name}</dd>
              <dt className="text-muted-foreground">To</dt>
              <dd className="text-right font-medium">{buildRecord(pending).toName}</dd>
              <dt className="text-muted-foreground">Bank · A/C</dt>
              <dd className="text-right font-mono text-xs">{buildRecord(pending).toBank} · {buildRecord(pending).toAccount}</dd>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="text-right font-semibold">{formatBDT(pending.amount)}</dd>
              {fee > 0 ? (<>
                <dt className="text-muted-foreground">Fee</dt>
                <dd className="text-right">{formatBDT(fee)}</dd>
              </>) : null}
              <dt className="text-muted-foreground">Total debit</dt>
              <dd className="text-right font-display text-lg font-bold text-primary">{formatBDT(pending.amount + fee)}</dd>
            </dl>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button className="gradient-brand text-primary-foreground" onClick={confirmAndSend}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OTP to authorize</DialogTitle>
            <DialogDescription>We sent a one-time code to your registered mobile. (Demo OTP: <span className="font-mono">123456</span>)</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtpOpen(false)}>Cancel</Button>
            <Button className="gradient-brand text-primary-foreground" onClick={verifyOtp} disabled={submitting || otp.length < 6}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Verify & send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent className="print:shadow-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" /> Transfer successful
            </DialogTitle>
            <DialogDescription>Reference: <span className="font-mono">{receipt?.reference}</span></DialogDescription>
          </DialogHeader>
          {receipt ? (
            <div id="receipt" className="rounded-lg border border-border p-4 text-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-base font-bold text-primary">Pubali Bank Limited</div>
                <div className="text-xs text-muted-foreground">{formatDate(receipt.createdAt)}</div>
              </div>
              <dl className="grid grid-cols-2 gap-y-1.5">
                <dt className="text-muted-foreground">From</dt>
                <dd className="text-right">{accounts.find((a) => a.id === receipt.fromAccountId)?.name}</dd>
                <dt className="text-muted-foreground">To</dt>
                <dd className="text-right">{receipt.toName}</dd>
                <dt className="text-muted-foreground">Bank · A/C</dt>
                <dd className="text-right font-mono text-xs">{receipt.toBank} · {receipt.toAccount}</dd>
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="text-right font-semibold">{formatBDT(receipt.amount)}</dd>
                {receipt.fee > 0 ? (<>
                  <dt className="text-muted-foreground">Fee</dt>
                  <dd className="text-right">{formatBDT(receipt.fee)}</dd>
                </>) : null}
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="text-right font-mono text-xs">{receipt.reference}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-right capitalize text-success">{receipt.status}</dd>
              </dl>
              {receipt.note ? <p className="mt-3 text-xs text-muted-foreground">Note: {receipt.note}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button onClick={() => downloadReceipt(receipt!)} className="gradient-brand text-primary-foreground">
              <Download className="mr-2 h-4 w-4" />Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function downloadReceipt(r: TransferRecord) {
  const lines = [
    "PUBALI BANK LIMITED",
    "Transfer Receipt",
    "================================",
    `Reference   : ${r.reference}`,
    `Date        : ${formatDate(r.createdAt)}`,
    `From A/C    : ${accounts.find((a) => a.id === r.fromAccountId)?.number ?? r.fromAccountId}`,
    `To          : ${r.toName}`,
    `Bank        : ${r.toBank}`,
    `A/C Number  : ${r.toAccount}`,
    `Amount      : BDT ${r.amount.toLocaleString()}`,
    `Fee         : BDT ${r.fee.toLocaleString()}`,
    `Status      : ${r.status.toUpperCase()}`,
    r.note ? `Note        : ${r.note}` : "",
    "================================",
    "Thank you for banking with Pubali Bank.",
  ].filter(Boolean).join("\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.reference}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

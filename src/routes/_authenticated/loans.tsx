import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { loanProducts, formatBDT, formatDate } from "@/lib/banking-data";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Landmark, Calculator, CheckCircle2, XCircle, FileText, Clock } from "lucide-react";
import { submitLoanApplication, useBankingStore, type LoanStage } from "@/lib/banking-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/loans")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Loans — Pubali Bank" },
      { name: "description", content: "Apply for personal, home, car, education and business loans. Calculate EMI and track your application." },
      { property: "og:title", content: "Loans — Pubali Bank" },
      { property: "og:description", content: "Apply for personal, home, car, education and business loans. Calculate EMI and track your application." },
      { property: "og:url", content: "/loans" },
    ],
    links: [{ rel: "canonical", href: "/loans" }],
  }),
  component: LoansPage,
});

function emi(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const STAGES: LoanStage[] = ["Submitted", "Under Review", "Approved", "Disbursed"];

function LoansPage() {
  return (
    <>
      <Topbar title="Loans" subtitle="Choose a loan, calculate your EMI, apply in minutes and track approval." />
      <PageContainer>
        <Tabs defaultValue="apply">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="apply">Apply</TabsTrigger>
            <TabsTrigger value="track">My applications</TabsTrigger>
          </TabsList>
          <TabsContent value="apply" className="pt-6"><ApplySection /></TabsContent>
          <TabsContent value="track" className="pt-6"><TrackSection /></TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
}

function ApplySection() {
  const [productId, setProductId] = useState(loanProducts[0].id);
  const product = loanProducts.find((p) => p.id === productId)!;
  const [amount, setAmount] = useState(Math.min(product.maxAmount, 500000));
  const [tenure, setTenure] = useState(Math.min(product.maxTenureMonths, 36));
  const [income, setIncome] = useState(80000);
  const [open, setOpen] = useState(false);

  const monthly = useMemo(() => emi(amount, product.rate, tenure), [amount, product.rate, tenure]);
  const totalPayable = monthly * tenure;
  const totalInterest = totalPayable - amount;
  const eligible = income > 0 && monthly < income * 0.5;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loanProducts.map((p) => (
          <button key={p.id} onClick={() => { setProductId(p.id); setAmount(Math.min(p.maxAmount, 500000)); setTenure(Math.min(p.maxTenureMonths, 36)); }}
            className={["surface-card group p-5 text-left transition hover:-translate-y-0.5", p.id === productId ? "ring-2 ring-primary" : ""].join(" ")}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:gradient-brand group-hover:text-primary-foreground">
              <Landmark className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-foreground">{p.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold text-primary">{p.rate}%</span>
              <span className="text-xs text-muted-foreground">p.a. from</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Up to {formatBDT(p.maxAmount)} · {Math.round(p.maxTenureMonths / 12)} yrs</p>
          </button>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /><h3 className="font-display text-lg font-semibold">{product.name} — EMI Calculator</h3></div>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-baseline justify-between">
                <Label>Loan amount</Label>
                <span className="font-display text-lg font-bold text-foreground">{formatBDT(amount)}</span>
              </div>
              <Slider value={[amount]} min={product.minAmount} max={product.maxAmount} step={10000} onValueChange={([v]) => setAmount(v)} className="mt-3" />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{formatBDT(product.minAmount)}</span><span>{formatBDT(product.maxAmount)}</span></div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <Label>Tenure</Label>
                <span className="font-display text-lg font-bold text-foreground">{tenure} months</span>
              </div>
              <Slider value={[tenure]} min={6} max={product.maxTenureMonths} step={6} onValueChange={([v]) => setTenure(v)} className="mt-3" />
            </div>
            <div>
              <Label htmlFor="income">Monthly income (BDT)</Label>
              <Input id="income" type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="mt-1.5" />
            </div>
          </div>
        </div>

        <div className="surface-card flex flex-col p-6">
          <h4 className="font-display text-base font-semibold text-foreground">Summary</h4>
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Monthly EMI</dt>
            <dd className="text-right font-display text-lg font-bold text-primary">{formatBDT(monthly)}</dd>
            <dt className="text-muted-foreground">Total interest</dt>
            <dd className="text-right font-medium">{formatBDT(totalInterest)}</dd>
            <dt className="text-muted-foreground">Total payable</dt>
            <dd className="text-right font-medium">{formatBDT(totalPayable)}</dd>
            <dt className="text-muted-foreground">Rate</dt>
            <dd className="text-right">{product.rate}% p.a.</dd>
          </dl>
          <div className={["mt-5 flex items-start gap-2 rounded-lg p-3 text-sm", eligible ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"].join(" ")}>
            {eligible ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
            <p className="text-xs">
              {eligible
                ? `You are eligible. EMI is ${Math.round((monthly / income) * 100)}% of monthly income (max 50% allowed).`
                : `EMI exceeds 50% of your income. Increase income, reduce amount or extend tenure.`}
            </p>
          </div>
          <Button className="mt-5 gradient-brand text-primary-foreground" disabled={!eligible} onClick={() => setOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />Apply for this loan
          </Button>
        </div>
      </section>

      <ApplyDialog
        open={open}
        onOpenChange={setOpen}
        product={product}
        amount={amount}
        tenure={tenure}
        income={income}
        monthly={monthly}
      />
    </>
  );
}

const appSchema = z.object({
  fullName: z.string().min(3, "Enter your full name"),
  nid: z.string().min(10, "Enter NID number"),
  employer: z.string().min(2, "Employer required"),
  purpose: z.string().min(5, "Tell us briefly").max(280),
});

function ApplyDialog({ open, onOpenChange, product, amount, tenure, income, monthly }: { open: boolean; onOpenChange: (o: boolean) => void; product: (typeof loanProducts)[number]; amount: number; tenure: number; income: number; monthly: number }) {
  const form = useForm<z.infer<typeof appSchema>>({ resolver: zodResolver(appSchema), defaultValues: { fullName: "", nid: "", employer: "", purpose: "" } });

  function onSubmit(v: z.infer<typeof appSchema>) {
    submitLoanApplication({
      productId: product.id,
      productName: product.name,
      amount,
      tenureMonths: tenure,
      monthlyIncome: income,
      purpose: v.purpose,
      emi: monthly,
    });
    toast.success("Application submitted — track status under My applications");
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for {product.name}</DialogTitle>
          <DialogDescription>{formatBDT(amount)} for {tenure} months · EMI {formatBDT(monthly)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...form.register("fullName")} className="mt-1.5" />
            {form.formState.errors.fullName ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="nid">National ID</Label>
              <Input id="nid" {...form.register("nid")} className="mt-1.5 font-mono" />
              {form.formState.errors.nid ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.nid.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="employer">Employer</Label>
              <Input id="employer" {...form.register("employer")} className="mt-1.5" />
              {form.formState.errors.employer ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.employer.message}</p> : null}
            </div>
          </div>
          <div>
            <Label htmlFor="purpose">Purpose of loan</Label>
            <Textarea id="purpose" rows={3} {...form.register("purpose")} className="mt-1.5" />
            {form.formState.errors.purpose ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.purpose.message}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-brand text-primary-foreground">Submit application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TrackSection() {
  const apps = useBankingStore((s) => s.loanApplications);
  if (apps.length === 0) {
    return <div className="surface-card p-10 text-center text-sm text-muted-foreground">No loan applications yet. Apply from the Apply tab.</div>;
  }
  return (
    <div className="space-y-4">
      {apps.map((a) => {
        const idx = STAGES.indexOf(a.status as LoanStage);
        const rejected = a.status === "Rejected";
        return (
          <div key={a.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" />
                  <h4 className="font-display text-base font-semibold text-foreground">{a.productName}</h4>
                  <Badge variant={rejected ? "destructive" : a.status === "Disbursed" ? "default" : "secondary"}>{a.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatBDT(a.amount)} · {a.tenureMonths} mo · EMI {formatBDT(a.emi)} · Applied {formatDate(a.createdAt)}</p>
              </div>
              <code className="text-xs text-muted-foreground">{a.id}</code>
            </div>

            {!rejected ? (
              <ol className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                {STAGES.map((stage, i) => {
                  const done = i <= idx;
                  return (
                    <li key={stage} className="flex flex-1 items-center gap-3">
                      <div className={["grid h-8 w-8 shrink-0 place-items-center rounded-full border", done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"].join(" ")}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className={["text-xs font-medium", done ? "text-foreground" : "text-muted-foreground"].join(" ")}>{stage}</p>
                      </div>
                      {i < STAGES.length - 1 ? <div className={["mx-2 hidden h-px flex-1 sm:block", done ? "bg-primary" : "bg-border"].join(" ")} /> : null}
                    </li>
                  );
                })}
              </ol>
            ) : null}

            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-muted-foreground">View timeline</summary>
              <ul className="mt-2 space-y-1 pl-4">
                {a.timeline.map((t, i) => (
                  <li key={i} className="text-muted-foreground"><span className="font-medium text-foreground">{t.stage}</span> · {formatDate(t.at)}{t.note ? ` — ${t.note}` : ""}</li>
                ))}
              </ul>
            </details>
          </div>
        );
      })}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LifeBuoy, MessageCircle, Send, Star, HelpCircle, Phone, Mail } from "lucide-react";
import {
  createTicket,
  replyTicket,
  setTicketStatus,
  useBankingStore,
  log,
  type SupportTicket,
  type TicketStatus,
} from "@/lib/banking-store";
import { formatDate } from "@/lib/banking-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/support")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Support — Pubali Bank" },
      { name: "description", content: "Get help with your account — open a support ticket, share feedback or browse FAQs." },
      { property: "og:title", content: "Support — Pubali Bank" },
      { property: "og:description", content: "Get help with your account — open a support ticket, share feedback or browse FAQs." },
      { property: "og:url", content: "/support" },
    ],
    links: [{ rel: "canonical", href: "/support" }],
  }),
  component: SupportPage,
});

const FAQS = [
  { q: "How do I reset my online banking password?", a: "Go to the sign-in screen and tap 'Forgot password'. You will receive a one-time code on your registered mobile to set a new password." },
  { q: "What are the daily transfer limits?", a: "Per transfer ৳5,00,000. Daily total ৳10,00,000. Monthly total ৳50,00,000. Limits can be raised by visiting a branch with valid ID." },
  { q: "How can I freeze a lost or stolen card?", a: "Open Cards, select the card and tap Freeze. To permanently disable use the Block option — a replacement can be requested from the same screen." },
  { q: "How long does a loan application take?", a: "Most personal loans are reviewed within 3 working days. Home and business loans take 7–14 days depending on documentation." },
  { q: "Is my data secure?", a: "All sessions are encrypted with TLS 1.3, OTP-based transaction authorization is enforced, and every login/transfer is recorded in your audit log." },
];

function SupportPage() {
  return (
    <>
      <Topbar title="Customer Support" subtitle="Open a ticket, track responses, share feedback or browse FAQs." />
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Tabs defaultValue="tickets">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tickets">My tickets</TabsTrigger>
              <TabsTrigger value="new">New ticket</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="pt-5"><TicketList /></TabsContent>
            <TabsContent value="new" className="pt-5"><NewTicketForm /></TabsContent>
            <TabsContent value="feedback" className="pt-5"><FeedbackForm /></TabsContent>
          </Tabs>
          <aside className="space-y-4">
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><HelpCircle className="h-4 w-4 text-primary" />FAQ</div>
              <Accordion type="single" collapsible className="mt-3">
                {FAQS.map((f, i) => (
                  <AccordionItem key={i} value={`f${i}`}>
                    <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="surface-card p-5 text-sm">
              <div className="flex items-center gap-2 font-semibold text-foreground"><LifeBuoy className="h-4 w-4 text-primary" />24/7 helpline</div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> 16216 (toll-free within Bangladesh)</li>
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +880 9666 716216 (overseas)</li>
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> support@pubalibangla.com</li>
              </ul>
            </div>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}

function TicketList() {
  const tickets = useBankingStore((s) => s.tickets);
  const [openId, setOpenId] = useState<string | null>(null);
  const current = tickets.find((t) => t.id === openId) ?? null;
  if (tickets.length === 0) {
    return <div className="surface-card p-10 text-center text-sm text-muted-foreground">No tickets yet. Open one from the “New ticket” tab.</div>;
  }
  return (
    <>
      <ul className="space-y-3">
        {tickets.map((t) => (
          <li key={t.id} className="surface-card p-4">
            <button onClick={() => setOpenId(t.id)} className="block w-full text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{t.subject}</p>
                <Badge variant={t.status === "Resolved" || t.status === "Closed" ? "secondary" : "default"}>{t.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.category} · {t.priority} priority · Updated {formatDate(t.updatedAt)}</p>
              <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{t.messages[t.messages.length - 1]?.body}</p>
            </button>
          </li>
        ))}
      </ul>
      <TicketDialog ticket={current} onClose={() => setOpenId(null)} />
    </>
  );
}

function TicketDialog({ ticket, onClose }: { ticket: SupportTicket | null; onClose: () => void }) {
  const [body, setBody] = useState("");
  if (!ticket) return null;
  return (
    <Dialog open={!!ticket} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{ticket.subject}<Badge>{ticket.status}</Badge></DialogTitle>
          <DialogDescription>Ticket {ticket.id} · {ticket.category} · {ticket.priority} priority</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-border p-3">
          {ticket.messages.map((m, i) => (
            <div key={i} className={["max-w-[85%] rounded-lg px-3 py-2 text-sm", m.from === "you" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"].join(" ")}>
              <p>{m.body}</p>
              <p className={["mt-1 text-[10px]", m.from === "you" ? "text-primary-foreground/70" : "text-muted-foreground"].join(" ")}>{formatDate(m.at)}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reply">Reply</Label>
          <Textarea id="reply" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message…" />
        </div>
        <DialogFooter className="justify-between gap-2 sm:justify-between">
          <Select value={ticket.status} onValueChange={(v) => setTicketStatus(ticket.id, v as TicketStatus)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["Open", "In Progress", "Resolved", "Closed"] as TicketStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="gradient-brand text-primary-foreground" onClick={() => { if (!body.trim()) return; replyTicket(ticket.id, "you", body.trim()); setBody(""); toast.success("Reply sent"); }}>
            <Send className="mr-2 h-4 w-4" />Send reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const newTicketSchema = z.object({
  subject: z.string().min(5, "Add a clear subject").max(120),
  category: z.enum(["Account", "Cards", "Transfers", "Loans", "App", "Other"]),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]),
  body: z.string().min(10, "Tell us a bit more (10+ characters)").max(1000),
});

function NewTicketForm() {
  const form = useForm<z.infer<typeof newTicketSchema>>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: { subject: "", category: "Account", priority: "Normal", body: "" },
  });
  function onSubmit(v: z.infer<typeof newTicketSchema>) {
    createTicket(v);
    toast.success("Ticket created — we'll respond shortly");
    form.reset({ subject: "", category: "Account", priority: "Normal", body: "" });
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="surface-card space-y-4 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><MessageCircle className="h-4 w-4 text-primary" />Open a new ticket</div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" {...form.register("subject")} className="mt-1.5" placeholder="Briefly describe the issue" />
        {form.formState.errors.subject ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.subject.message}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Category</Label>
          <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v as any)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Account", "Cards", "Transfers", "Loans", "App", "Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={form.watch("priority")} onValueChange={(v) => form.setValue("priority", v as any)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Low", "Normal", "High", "Urgent"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="body">Describe the issue</Label>
        <Textarea id="body" rows={5} {...form.register("body")} className="mt-1.5" />
        {form.formState.errors.body ? <p className="mt-1 text-xs text-destructive">{form.formState.errors.body.message}</p> : null}
      </div>
      <Button type="submit" className="gradient-brand text-primary-foreground">Submit ticket</Button>
    </form>
  );
}

function FeedbackForm() {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  function submit() {
    if (!body.trim()) {
      toast.error("Please share a few words");
      return;
    }
    log({ type: "ticket", message: `Submitted feedback (${rating}/5): ${body.slice(0, 60)}` });
    toast.success("Thanks for your feedback!");
    setBody("");
    setRating(5);
  }
  return (
    <div className="surface-card space-y-4 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Star className="h-4 w-4 text-primary" />Share your feedback</div>
      <div>
        <Label>Rate your experience</Label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`} className="text-3xl transition">
              <Star className={["h-7 w-7", n <= rating ? "fill-gold stroke-gold" : "stroke-muted-foreground"].join(" ")} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="fb">What can we improve?</Label>
        <Textarea id="fb" rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1.5" />
      </div>
      <Button onClick={submit} className="gradient-brand text-primary-foreground">Send feedback</Button>
    </div>
  );
}

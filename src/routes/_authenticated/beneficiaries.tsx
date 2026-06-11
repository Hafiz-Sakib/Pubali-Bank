import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/banking/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { beneficiaries as seed, type Beneficiary } from "@/lib/banking-data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/beneficiaries")({
  ssr: false,
  head: () => ({ meta: [{ title: "Beneficiaries — Pubali Bank" }] }),
  component: BeneficiariesPage,
});

const KEY = "pbl_beneficiaries_v1";

function load(): Beneficiary[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
}
function save(list: Beneficiary[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(list));
}

function BeneficiariesPage() {
  const [list, setList] = useState<Beneficiary[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", bank: "", accountNumber: "", nickname: "" });

  useEffect(() => { setList(load()); }, []);

  const add = () => {
    if (!form.name.trim() || !form.bank.trim() || !form.accountNumber.trim()) {
      return toast.error("Please fill in name, bank and account number");
    }
    const next: Beneficiary[] = [
      { id: "b-" + Date.now(), name: form.name.trim(), bank: form.bank.trim(), accountNumber: form.accountNumber.trim(), nickname: form.nickname.trim() || undefined },
      ...list,
    ];
    setList(next); save(next);
    toast.success("Beneficiary added");
    setForm({ name: "", bank: "", accountNumber: "", nickname: "" });
    setOpen(false);
  };

  const remove = (id: string) => {
    const next = list.filter((b) => b.id !== id);
    setList(next); save(next);
    toast("Beneficiary removed");
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Beneficiaries</h1>
          <p className="text-sm text-muted-foreground">Saved recipients for quick transfers.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> Add beneficiary</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New beneficiary</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Bank</Label><Input value={form.bank} onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))} placeholder="e.g. Pubali Bank Ltd" /></div>
              <div className="space-y-1.5"><Label>Account number</Label><Input value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Nickname (optional)</Label><Input value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={add} className="gradient-brand text-primary-foreground">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {list.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No beneficiaries yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <Card key={b.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{b.name}</CardTitle>
                    {b.nickname && <div className="text-xs text-muted-foreground">{b.nickname}</div>}
                  </div>
                </div>
                <button onClick={() => remove(b.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">{b.bank}</div>
                <div className="mt-0.5 font-mono text-sm">{b.accountNumber}</div>
                <Link to="/transfer" className="mt-3 inline-block">
                  <Button size="sm" variant="outline"><Send className="mr-1.5 h-3.5 w-3.5" /> Send money</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

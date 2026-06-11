import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PageContainer } from "@/components/banking/PageContainer";
import { branches } from "@/lib/banking-data";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Phone, Clock, Banknote } from "lucide-react";

export const Route = createFileRoute("/_authenticated/branches")({
  head: () => ({ meta: [{ title: "Branch Locator — Pubali Bank" }] }),
  component: BranchesPage,
});

function BranchesPage() {
  const [q, setQ] = useState("");
  const [division, setDivision] = useState("all");
  const [atm, setAtm] = useState("all");

  const divisions = useMemo(() => Array.from(new Set(branches.map(b => b.division))), []);
  const list = useMemo(() => branches.filter(b => {
    if (q && !`${b.name} ${b.address} ${b.city}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (division !== "all" && b.division !== division) return false;
    if (atm === "yes" && !b.hasATM) return false;
    if (atm === "no" && b.hasATM) return false;
    return true;
  }), [q, division, atm]);

  return (
    <>
      <Topbar title="Branch & ATM Locator" subtitle="Find a Pubali Bank branch or ATM near you." />
      <PageContainer>
        <section className="surface-card p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by city, area or branch name" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Division" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All divisions</SelectItem>
                {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={atm} onValueChange={setAtm}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="ATM" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ATM: Any</SelectItem>
                <SelectItem value="yes">Has ATM</SelectItem>
                <SelectItem value="no">No ATM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{list.length} branches found</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map(b => (
            <div key={b.id} className="surface-card p-5 transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{b.division}</p>
                  <h3 className="mt-1 font-display text-base font-semibold text-foreground">{b.name}</h3>
                </div>
                {b.hasATM ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success"><Banknote className="h-3 w-3" />ATM</span>
                ) : null}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{b.address}, {b.city}</span></li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-primary" /><span>{b.phone}</span></li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-primary" /><span>{b.hours}</span></li>
              </ul>
            </div>
          ))}
          {list.length === 0 ? <div className="col-span-full p-10 text-center text-sm text-muted-foreground">No branches match your search.</div> : null}
        </section>
      </PageContainer>
    </>
  );
}
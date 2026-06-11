import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Smartphone, Laptop, Monitor, Trash2, Star, StarOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSessions, revokeSession, trustSession, useBankingStore, useHydrated } from "@/lib/banking-store";

export const Route = createFileRoute("/_authenticated/security")({
  ssr: false,
  component: SecurityPage,
});

function deviceIcon(d: string) {
  if (d === "Mobile") return Smartphone;
  if (d === "Tablet") return Laptop;
  return Monitor;
}

function SecurityPage() {
  const hydrated = useHydrated();
  const sessions = useSessions();
  const audit = useBankingStore((s) => s.auditLog);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Security Center</h1>
          <p className="text-sm text-muted-foreground">Manage active sessions, trusted devices, and review account activity.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active sessions & devices</CardTitle>
            <CardDescription>Sign out devices you don't recognise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hydrated && sessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
            )}
            {hydrated &&
              sessions.map((s) => {
                const Icon = deviceIcon(s.device);
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{s.browser} on {s.os}</span>
                        {s.current && <Badge>This device</Badge>}
                        {s.trusted && <Badge variant="secondary">Trusted</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.device} • {s.ip} • {s.location} • Last seen {new Date(s.lastSeenAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => trustSession(s.id, !s.trusted)}>
                        {s.trusted ? <><StarOff className="mr-1 h-4 w-4" />Untrust</> : <><Star className="mr-1 h-4 w-4" />Trust</>}
                      </Button>
                      {!s.current && (
                        <Button size="sm" variant="destructive" onClick={() => revokeSession(s.id)}>
                          <Trash2 className="mr-1 h-4 w-4" />Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity log</CardTitle>
            <CardDescription>Recent account events.</CardDescription>
          </CardHeader>
          <CardContent>
            {hydrated && audit.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1 text-sm">
              {hydrated &&
                audit.map((a) => (
                  <li key={a.id} className="border-l-2 border-primary/40 pl-3">
                    <div className="text-foreground">{a.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.type} • {new Date(a.at).toLocaleString()}
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

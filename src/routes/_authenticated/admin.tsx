import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldAlert, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageContainer } from "@/components/banking/PageContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  component: AdminPage,
});

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: "customer" | "admin";
  created_at: string;
}

function AdminPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && user && user.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [ready, user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const rows: ProfileRow[] = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("pbl_auth_users_v1");
      const list = raw ? (JSON.parse(raw) as Array<{ id: string; name: string; email: string; role: "customer" | "admin" }>) : [];
      return list.map((u) => ({
        id: u.id,
        full_name: u.name,
        email: u.email,
        role: u.role,
        created_at: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }, [loading]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-[60dvh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <PageContainer>
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-semibold">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage users and roles across Pubali Bank.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total users", value: rows.length },
          { label: "Admins", value: rows.filter((r) => r.role === "admin").length },
          { label: "Customers", value: rows.filter((r) => r.role === "customer").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.full_name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Badge variant={r.role === "admin" ? "default" : "secondary"}>{r.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}

import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/lib/auth";
import { registerCurrentSession } from "@/lib/banking-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth", search: { redirect: path } });
  }, [ready, user, navigate, path]);

  useEffect(() => {
    if (ready && user) registerCurrentSession();
  }, [ready, user]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

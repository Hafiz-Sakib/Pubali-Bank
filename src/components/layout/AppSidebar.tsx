import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, ArrowLeftRight, Receipt, Landmark, CreditCard, MapPin, Banknote, LogOut, LifeBuoy, ShieldCheck, Users, Receipt as BillIcon, Bell, UserCircle, UsersRound } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { BrandMark } from "./BrandMark";
import { useAuth } from "@/lib/auth";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Accounts", url: "/accounts", icon: Wallet },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Transfer", url: "/transfer", icon: ArrowLeftRight },
  { title: "Beneficiaries", url: "/beneficiaries", icon: UsersRound },
  { title: "Bills & Recharge", url: "/bills", icon: BillIcon },
] as const;
const services = [
  { title: "Loans", url: "/loans", icon: Landmark },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Branch Locator", url: "/branches", icon: MapPin },
  { title: "Exchange Rates", url: "/fx", icon: Banknote },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Security", url: "/security", icon: ShieldCheck },
  { title: "Support", url: "/support", icon: LifeBuoy },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const isActive = (url: string) => path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/dashboard" className="block">
          <BrandMark variant="dark" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Banking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {services.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Admin">
                    <Link to="/admin">
                      <Users className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-gold text-sm font-bold text-gold-foreground">
            {(user?.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</div>
            <div className="truncate text-[11px] text-sidebar-foreground/60">{user?.email}</div>
          </div>
          <button onClick={logout} aria-label="Sign out" className="grid h-8 w-8 place-items-center rounded-md text-sidebar-foreground/70 transition hover:bg-sidebar-border hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

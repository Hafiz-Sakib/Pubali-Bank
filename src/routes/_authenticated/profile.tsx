import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/banking/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile — Pubali Bank" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updatePassword } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("+880 1XX XXX XXXX");
  const [address, setAddress] = useState("House 12, Road 7, Dhanmondi, Dhaka");
  const [dob, setDob] = useState("1992-04-21");
  const [nid, setNid] = useState("19921234567890");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated");
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw || newPw.length < 6) return toast.error("New password must be at least 6 characters");
    if (newPw !== confirmPw) return toast.error("Passwords do not match");
    setBusy(true);
    const res = await updatePassword(newPw);
    setBusy(false);
    if (!res.ok) return toast.error(res.error ?? "Could not change password");
    toast.success("Password changed");
    setOldPw(""); setNewPw(""); setConfirmPw("");
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information and security.</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-5">
          <Card>
            <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={email} readOnly />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of birth</Label>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>NID / Passport</Label>
                  <Input value={nid} onChange={(e) => setNid(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input value={user?.role ?? ""} readOnly />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="gradient-brand text-primary-foreground">Save changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePassword} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Current password</Label>
                    <Input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>New password</Label>
                    <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm new password</Label>
                    <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={busy} className="gradient-brand text-primary-foreground">
                    {busy ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Security settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ToggleRow label="Two-factor authentication" desc="Require an OTP on every sign-in." value={twoFA} onChange={(v) => { setTwoFA(v); toast(v ? "2FA enabled" : "2FA disabled"); }} />
                <ToggleRow label="Biometric login" desc="Use Face ID / fingerprint where available." value={biometric} onChange={(v) => { setBiometric(v); toast("Saved"); }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <Card>
            <CardHeader><CardTitle>Notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Email alerts" desc="Transactions, statements, and announcements." value={emailAlerts} onChange={(v) => { setEmailAlerts(v); toast("Saved"); }} />
              <ToggleRow label="SMS alerts" desc="Critical transactions and security events." value={smsAlerts} onChange={(v) => { setSmsAlerts(v); toast("Saved"); }} />
              <ToggleRow label="Push notifications" desc="Real-time alerts on the mobile app." value={pushAlerts} onChange={(v) => { setPushAlerts(v); toast("Saved"); }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

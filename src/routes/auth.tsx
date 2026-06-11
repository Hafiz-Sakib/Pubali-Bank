import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth, DEMO_ADMIN, DEMO_CUSTOMER } from "@/lib/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type SignInValues = z.infer<typeof signInSchema>;

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});
type SignUpValues = z.infer<typeof signUpSchema>;

const forgotSchema = z.object({ email: z.string().email("Enter a valid email") });
type ForgotValues = z.infer<typeof forgotSchema>;

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Pubali Bank" },
      { name: "description", content: "Sign in or create your Pubali Bank digital account." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.1-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6-5.1c-2 1.4-4.4 2.3-7.1 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.4 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6 5.1c-.4.4 6.4-4.7 6.4-14.5 0-1.2-.1-2.4-.3-3.5z"/>
    </svg>
  );
}

function AuthPage() {
  const { login, signUp, signInWithGoogle, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });
  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSignIn(values: SignInValues) {
    setSubmitting(true);
    const res = await login(values.email, values.password);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Login failed");
      signInForm.setError("password", { message: "Invalid credentials" });
      return;
    }
    toast.success("Welcome back to Pubali Bank");
    navigate({ to: redirect || "/dashboard" });
  }

  async function onSignUp(values: SignUpValues) {
    setSubmitting(true);
    const res = await signUp(values.fullName, values.email, values.password);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Sign up failed");
      return;
    }
    toast.success("Account created. You're signed in.");
    signUpForm.reset();
    setTab("signin");
  }

  async function onForgot(values: ForgotValues) {
    setSubmitting(true);
    const res = await forgotPassword(values.email);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not send reset email");
      return;
    }
    toast.success("Password reset link sent. (Demo: open /reset-password directly.)");
    setForgotOpen(false);
    forgotForm.reset();
  }

  async function onGoogle() {
    setSubmitting(true);
    const res = await signInWithGoogle();
    if (!res.ok) {
      setSubmitting(false);
      toast.error(res.error ?? "Google sign-in failed");
    }
    // On success the browser is redirected; no need to reset state.
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden gradient-brand text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
        <BrandMark variant="dark" />
        <div className="relative max-w-md">
          <h2 className="font-bangla text-4xl font-bold leading-tight">ঐতিহ্যের পথ বেয়ে অর্থনৈতিক অগ্রগতি</h2>
          <p className="mt-4 font-display text-2xl font-semibold">Modern banking, the way it should be.</p>
          <p className="mt-4 text-primary-foreground/80">
            Secure access to your accounts, transfers, cards and loans — all in one place.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-primary-foreground/80">
          <ShieldCheck className="h-5 w-5 text-gold" />
          256-bit encryption · 2FA · ISO 27001 certified
        </div>
      </div>

      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-5 sm:p-6">
          <Link to="/" className="lg:hidden"><BrandMark /></Link>
          <Link to="/" className="ml-auto inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-md">
            {!forgotOpen ? (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {tab === "signin" ? "Welcome back" : "Open your account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tab === "signin"
                    ? "Sign in to your Pubali Bank account."
                    : "Create a secure Pubali Bank digital account."}
                </p>

                <DemoCredsCard
                  onFill={(email, password) => {
                    signInForm.setValue("email", email);
                    signInForm.setValue("password", password);
                    setTab("signin");
                    toast("Demo credentials filled");
                  }}
                />

                <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign in</TabsTrigger>
                    <TabsTrigger value="signup">Sign up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="mt-6">
                    <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" autoComplete="email" {...signInForm.register("email")} className="mt-1.5" />
                        {signInForm.formState.errors.email && (
                          <p className="mt-1 text-xs text-destructive">{signInForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            onClick={() => setForgotOpen(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot?
                          </button>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          {...signInForm.register("password")}
                          className="mt-1.5"
                        />
                        {signInForm.formState.errors.password && (
                          <p className="mt-1 text-xs text-destructive">{signInForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={submitting} className="h-11 w-full gradient-brand text-primary-foreground">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign in
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full name</Label>
                        <Input id="fullName" autoComplete="name" {...signUpForm.register("fullName")} className="mt-1.5" />
                        {signUpForm.formState.errors.fullName && (
                          <p className="mt-1 text-xs text-destructive">{signUpForm.formState.errors.fullName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" autoComplete="email" {...signUpForm.register("email")} className="mt-1.5" />
                        {signUpForm.formState.errors.email && (
                          <p className="mt-1 text-xs text-destructive">{signUpForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          autoComplete="new-password"
                          {...signUpForm.register("password")}
                          className="mt-1.5"
                        />
                        {signUpForm.formState.errors.password ? (
                          <p className="mt-1 text-xs text-destructive">{signUpForm.formState.errors.password.message}</p>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">
                            8+ chars, upper, lower &amp; number.
                          </p>
                        )}
                      </div>
                      <Button type="submit" disabled={submitting} className="h-11 w-full gradient-brand text-primary-foreground">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  or continue with
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogle}
                  disabled={submitting}
                  className="h-11 w-full"
                >
                  <GoogleIcon />
                  <span className="ml-2">Continue with Google</span>
                </Button>
              </>
            ) : (
              <>
                <h1 className="font-display text-3xl font-bold text-foreground">Reset your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email and we'll send you a secure reset link.
                </p>
                <form onSubmit={forgotForm.handleSubmit(onForgot)} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input id="forgot-email" type="email" autoComplete="email" {...forgotForm.register("email")} className="mt-1.5" />
                    {forgotForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-destructive">{forgotForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={submitting} className="h-11 w-full gradient-brand text-primary-foreground">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send reset email
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotOpen(false)}>
                    Back to sign in
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoCredsCard({ onFill }: { onFill: (email: string, password: string) => void }) {
  const accounts = [
    { role: "Admin", ...DEMO_ADMIN, badge: "bg-primary/10 text-primary" },
    { role: "Customer", ...DEMO_CUSTOMER, badge: "bg-gold/15 text-gold" },
  ];
  return (
    <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo accounts</span>
        <span className="text-[10px] text-muted-foreground">Click to fill</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {accounts.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => onFill(a.email, a.password)}
            className="rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary hover:shadow-sm"
          >
            <div className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.badge}`}>{a.role}</div>
            <div className="mt-1.5 truncate font-mono text-xs text-foreground">{a.email}</div>
            <div className="font-mono text-xs text-muted-foreground">{a.password}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Pubali Bank" },
      { name: "description", content: "Set a new password for your Pubali Bank account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    // Demo mode: allow reset whenever this page is opened.
    setRecoveryReady(true);
  }, []);

  async function onSubmit(values: Values) {
    setSubmitting(true);
    const res = await updatePassword(values.password);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Could not update password");
      return;
    }
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden gradient-brand text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <BrandMark variant="dark" />
        <div className="relative max-w-md">
          <h2 className="font-display text-2xl font-semibold">Secure password reset</h2>
          <p className="mt-3 text-primary-foreground/80">
            Choose a strong new password to keep your Pubali Bank account safe.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-primary-foreground/80">
          <ShieldCheck className="h-5 w-5 text-gold" /> Encrypted in transit and at rest
        </div>
      </div>
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-5 sm:p-6">
          <Link to="/auth" className="ml-auto inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to sign in
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-bold text-foreground">Set new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {recoveryReady
                ? "Enter a new password for your account."
                : "Open the reset link from your email to continue."}
            </p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} className="mt-1.5" />
                {form.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} className="mt-1.5" />
                {form.formState.errors.confirm && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.confirm.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={submitting || !recoveryReady}
                className="h-11 w-full gradient-brand text-primary-foreground"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

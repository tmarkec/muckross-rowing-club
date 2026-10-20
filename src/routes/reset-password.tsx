import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password | Muckross RC" },
      { name: "description", content: "Set a new password for your Coaches Corner account." },
      { property: "og:title", content: "Reset password | Muckross RC" },
      { property: "og:description", content: "Set a new password for your Coaches Corner account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid";

function readLinkError(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const desc = params.get("error_description") ?? query.get("error_description");
  const code = params.get("error_code") ?? query.get("error_code");
  if (!desc && !code) return null;
  if (code === "otp_expired" || /expired/i.test(desc ?? "")) {
    return "This reset link has expired or has already been used. Please request a new one.";
  }
  return (desc ?? "This reset link is not valid.").replace(/\+/g, " ");
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const err = readLinkError();
    if (err) {
      setLinkError(err);
      setStatus("invalid");
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setStatus("ready");
      }
    });
    // Handle PKCE-style links (?code=...)
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setLinkError("This reset link has expired or is not valid. Please request a new one.");
          setStatus("invalid");
        }
      });
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });
    const timer = setTimeout(() => {
      setStatus((s) => {
        if (s === "checking") {
          setLinkError("We couldn't verify your reset link. It may have expired. Please request a new one.");
          return "invalid";
        }
        return s;
      });
    }, 6000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      const msg = /expired|invalid|session/i.test(error.message)
        ? "Your reset session has expired. Please request a new reset link."
        : error.message;
      return toast.error(msg);
    }
    toast.success("Password updated successfully!");
    window.history.replaceState(null, "", "/reset-password");
    void navigate({ to: "/coaches", replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-background text-foreground p-8 shadow-elegant">
        <div className="flex items-center gap-3 mb-6">
          <img src="/muckross-logo.png" alt="" className="h-10 w-auto" />
          <div>
            <h1 className="font-serif text-lg font-bold">Set a new password</h1>
            <div className="text-xs text-muted-foreground">Muckross Rowing Club</div>
          </div>
        </div>

        {status === "checking" && (
          <p className="text-sm text-muted-foreground">Checking your reset link…</p>
        )}

        {status === "invalid" && (
          <div className="space-y-4">
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {linkError}
            </p>
            <Button asChild className="w-full">
              <Link to="/coaches/login">Back to sign in</Link>
            </Button>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              {confirm && password !== confirm && (
                <p className="mt-1 text-xs text-destructive">Passwords don't match.</p>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving…" : "Save password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

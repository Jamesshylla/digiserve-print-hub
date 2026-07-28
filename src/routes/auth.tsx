import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { PageHero, Section } from "@/components/site/Section";

const title = "Sign in — Business Owner Access | DIGISERVE SOLUTION";
const description =
  "Secure sign-in for DIGISERVE SOLUTION staff and the business owner to manage services, prices, offers and coupons.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setStatus("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin/pricing" });
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setStatus(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setStatus("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin/pricing" });
  }

  return (
    <>
      <PageHero
        eyebrow="Owner access"
        title="Sign in"
        description="Manage every service, price, offer and coupon from the admin dashboard — no code changes needed."
      />
      <Section className="max-w-md">
        <form onSubmit={handleSubmit} className="glass grid gap-4 p-7">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
          <button type="submit" disabled={busy} className="btn-neon justify-center">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button type="button" onClick={handleGoogle} className="btn-ghost-neon justify-center">
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {mode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </Section>
    </>
  );
}

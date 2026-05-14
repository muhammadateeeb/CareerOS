import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSignUp } from "@clerk/clerk-react";
import { AuthShell } from "@/components/auth-shell";
import { analytics, errorTracking } from "@/lib/analytics";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — CareerOS" },
      { name: "description", content: "Start getting more interviews today with CareerOS." },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { userId } = context as { userId: string | null };
    if (userId) throw redirect({ to: "/dashboard" });
  },
  component: SignupPage,
});

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { isLoaded, signUp, setActive } = useSignUp();

  const score = useMemo(() => passwordScore(password), [password]);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const match = password.length > 0 && password === confirm;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('🔵 Signup submit started');
    if (!isLoaded) {
      console.log('🔴 Clerk not loaded');
      return;
    }
    
    setError(null);

    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!emailValid) return setError("Please enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    console.log('🔵 Attempting signup with:', { email, fullName });
    
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      
      console.log('🟢 Signup result:', {
        status: result.status,
        createdSessionId: result.createdSessionId,
        complete: result.status === "complete"
      });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Track signup success
        analytics.track('signup_success', {
          email: email,
          fullName: fullName,
          timestamp: new Date().toISOString(),
        });
        // Redirect to onboarding for new users
        navigate({ to: "/onboarding" });
        return;
      } else if (result.status === "missing_requirements") {
        // Handle email verification requirement
        if (result.unverifiedFields?.includes("email_address")) {
          // For development, try to proceed without email verification
          try {
            await setActive({ session: result.createdSessionId });
            navigate({ to: "/onboarding" });
            return;
          } catch (err) {
            setError("Please check your email to verify your account.");
          }
        } else {
          setError("Please complete all required fields.");
        }
      } else {
        // Handle other statuses - try to proceed with session
        try {
          if (result.createdSessionId) {
            await setActive({ session: result.createdSessionId });
            navigate({ to: "/onboarding" });
            return;
          } else {
            setError("Account created successfully. Please log in to continue.");
          }
        } catch (err) {
          setError("Please check your email to verify your account.");
        }
      }
    } catch (err: any) {
      console.log('🔴 Signup error:', err);
      const msg = err.errors?.[0]?.message?.toLowerCase() || "";
      console.log('🔴 Signup error message:', msg);
      if (msg.includes("already") || msg.includes("registered")) {
        console.log('🔴 Email already exists error');
        setError("An account with this email already exists. Try logging in.");
      } else {
        setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor =
    score <= 1 ? "bg-destructive" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-primary" : "bg-[var(--success)]";

  return (
    <AuthShell
      title="Create your CareerOS account"
      subtitle="Start getting more interviews today."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Ada Lovelace" required autoComplete="name" />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          required
          autoComplete="email"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${strengthColor}`}
                  style={{ width: `${(score / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right">{strengthLabel}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="Re-enter password"
            />
            {confirm && match && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--success)]" />
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isLoaded}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By creating an account you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </div>
  );
}

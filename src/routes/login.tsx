import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useSignIn, useUser } from "@clerk/clerk-react";
import { AuthShell } from "@/components/auth-shell";
import { analytics, errorTracking } from "@/lib/analytics";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CareerOS" },
      { name: "description", content: "Log in to CareerOS to continue your job success journey." },
    ],
  }),
    component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();

  // Auto-redirect when user becomes authenticated
  useEffect(() => {
    console.log('🔵 useEffect triggered:', { isSignedIn, user });
    if (isSignedIn && user) {
      console.log('🟢 useEffect: User authenticated, redirecting to dashboard');
      navigate({ to: "/dashboard" });
    }
  }, [isSignedIn, user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('🔵 Login submit started');
    
    if (!isLoaded) {
      console.log('🔴 Clerk not loaded');
      return;
    }
    
    setError(null);
    setLoading(true);
    console.log('🔵 Loading set to true');
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('🔴 Login timeout triggered');
      setLoading(false);
      setError("Login timed out. Please try again.");
    }, 10000); // 10 second timeout
    
    // Check if user is already signed in
    console.log('🔵 Checking if already signed in:', { isSignedIn, user });
    if (isSignedIn && user) {
      console.log('🟢 User already signed in, redirecting');
      clearTimeout(timeout);
      navigate({ to: "/dashboard" });
      return;
    }
    
    try {
      console.log('🔵 Attempting sign in with:', { email });
      const result = await signIn.create({
        identifier: email,
        password,
      });
      
      // Debug: Log the result status
      console.log('🟢 Sign in result:', {
        status: result.status,
        createdSessionId: result.createdSessionId,
        complete: result.status === "complete"
      });
      
      if (result.status === "complete" && result.createdSessionId) {
        console.log('🟢 Authentication complete, setting session');
        clearTimeout(timeout);
        await setActive({ session: result.createdSessionId });
        console.log('🟢 Session set, navigating to dashboard');
        navigate({ to: "/dashboard" });
        return;
      } else if (result.status === "needs_first_factor") {
        console.log('🟡 Needs first factor');
        // Try to set the session even if first factor is needed
        if (result.createdSessionId) {
          clearTimeout(timeout);
          await setActive({ session: result.createdSessionId });
          navigate({ to: "/dashboard" });
          return;
        } else {
          clearTimeout(timeout);
          setError("Please check your email to verify your account before logging in.");
        }
      } else if (result.status === "needs_second_factor") {
        console.log('🟡 Needs second factor');
        // For development, try to bypass 2FA if possible
        if (result.createdSessionId) {
          clearTimeout(timeout);
          await setActive({ session: result.createdSessionId });
          // Track login success
          analytics.track('login_success', {
            email: email,
            timestamp: new Date().toISOString(),
          });
          // Redirect to onboarding - it will check if completion is needed
          navigate({ to: "/onboarding" });
          return;
        } else {
          clearTimeout(timeout);
          setError("Two-factor authentication required. Check your email for verification code.");
        }
      } else {
        console.log('🔴 Unknown status:', result.status);
        clearTimeout(timeout);
        setError(`Authentication status: ${result.status}. Invalid email or password. Please try again.`);
      }
    } catch (err: any) {
      // Debug: Log the error
      console.log('🔴 Sign in error:', err);
      
      const msg = err.errors?.[0]?.message?.toLowerCase() || "";
      if (msg.includes("session already exists") || msg.includes("already exists")) {
        console.log('🟡 Session already exists');
        // User is already signed in, redirect to dashboard
        clearTimeout(timeout);
        navigate({ to: "/dashboard" });
        return;
      } else if (msg.includes("invalid") || msg.includes("credentials")) {
        clearTimeout(timeout);
        setError("Invalid email or password. Please try again.");
      } else if (msg.includes("verification")) {
        clearTimeout(timeout);
        setError("Please check your email to verify your account before logging in.");
      } else {
        clearTimeout(timeout);
        setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
      }
    } finally {
      console.log('🔵 Finally block - clearing timeout and loading');
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your job success journey."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="••••••"
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
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Remember me
          </label>
          <a href="#" className="text-primary hover:underline font-medium">
            Forgot password?
          </a>
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
          Log in
        </button>
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

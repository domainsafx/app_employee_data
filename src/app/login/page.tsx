"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Alert, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push(data.role === "superadmin" ? "/superadmin/dashboard" : "/admin/dashboard");
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-sand-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center">
              <span className="font-display text-emerald-400 font-bold text-sm">SP</span>
            </div>
            <span className="font-display font-semibold text-navy-800 text-lg">Sahayak Partners</span>
          </Link>
        </div>

        <Card className="p-7">
          <h1 className="font-display text-xl font-semibold text-navy-800">Sign in</h1>
          <p className="text-sm text-slate-500 mt-1">For admin and super admin accounts</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {error && <Alert tone="red">{error}</Alert>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 space-y-1">
            <p>Demo super admin: <span className="font-mono text-slate-500">superadmin / super@123</span></p>
            <p>Demo admin: <span className="font-mono text-slate-500">admin / admin@123</span></p>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Are you an employee?{" "}
          <Link href="/employee-login" className="text-navy-700 font-medium hover:underline">
            Log in with OTP
          </Link>
        </p>
      </div>
    </main>
  );
}

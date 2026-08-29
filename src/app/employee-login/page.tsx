"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Alert, Card } from "@/components/ui";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/employee-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDemoOtp(data.demoOtp);
      setEmployeeName(data.employeeName);
      setStep("otp");
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/employee-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code.");
        return;
      }
      router.push("/employee/dashboard");
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
          {step === "mobile" ? (
            <>
              <h1 className="font-display text-xl font-semibold text-navy-800">Employee login</h1>
              <p className="text-sm text-slate-500 mt-1">Enter the mobile number your admin has on file</p>
              <form onSubmit={requestOtp} className="mt-6 space-y-4">
                <Input
                  label="Mobile number"
                  required
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="9876543210"
                  maxLength={10}
                  autoFocus
                />
                {error && <Alert tone="red">{error}</Alert>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending code…" : "Send OTP"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold text-navy-800">
                Hi {employeeName}, verify it&apos;s you
              </h1>
              <p className="text-sm text-slate-500 mt-1">Enter the 6-digit code sent to {mobile}</p>
              <form onSubmit={verifyOtp} className="mt-6 space-y-4">
                <Input
                  label="OTP"
                  required
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  maxLength={6}
                  autoFocus
                />
                {error && <Alert tone="red">{error}</Alert>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying…" : "Verify & Sign in"}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-slate-500 hover:text-navy-700"
                  onClick={() => setStep("mobile")}
                >
                  Use a different number
                </button>
              </form>
            </>
          )}

          {demoOtp && step === "otp" && (
            <div className="mt-5 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-700">
              Demo mode: no SMS gateway is connected yet, so your code is{" "}
              <span className="font-mono font-semibold">{demoOtp}</span>
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Admin or super admin?{" "}
          <Link href="/login" className="text-navy-700 font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, Button, Alert, Badge, Spinner, EmptyState, Input } from "@/components/ui";

interface LookupData {
  name: string;
  amount: number;
  billingCycle: string;
  paymentStatus: string;
  employeeName: string;
  package: { id: string; name: string; tier: string };
}

const tierStyles: Record<string, string> = {
  bronze: "bg-bronze",
  silver: "bg-silver",
  gold: "bg-gold",
};

const methods = [
  { key: "upi", label: "UPI" },
  { key: "card", label: "Card" },
  { key: "netbanking", label: "Netbanking" },
];

export default function PayPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<LookupData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/pay-lookup?token=${params.token}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return;
        }
        setData(await r.json());
      })
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sand-50">
        <Spinner className="w-6 h-6 text-slate-400" />
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sand-50 px-6">
        <Card className="max-w-md w-full">
          <EmptyState title="Link not valid" description="This payment link may have expired or already been used. Ask for a fresh one." />
        </Card>
      </main>
    );
  }

  const alreadyPaid = data.paymentStatus === "paid" || success;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPaying(true);
    try {
      const res = await fetch("/api/pay-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Payment could not be completed.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50 px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center mx-auto">
            <span className="font-display text-emerald-400 font-bold text-sm">SP</span>
          </div>
          {data.employeeName && (
            <p className="text-xs text-slate-400 mt-2">
              Referred by <span className="font-medium text-slate-600">{data.employeeName}</span>
            </p>
          )}
        </div>

        <Card className="overflow-hidden mb-5">
          <div className={`h-1.5 ${tierStyles[data.package.tier]}`} />
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-navy-800">{data.package.name}</p>
              <p className="text-xs text-slate-400 capitalize">
                For {data.name} · {data.billingCycle} billing
              </p>
            </div>
            <p className="font-display text-2xl font-semibold text-navy-800">₹{data.amount}</p>
          </div>
        </Card>

        {alreadyPaid ? (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 text-2xl flex items-center justify-center mx-auto">
              ✓
            </div>
            <h1 className="font-display text-xl font-semibold text-navy-800 mt-4">
              {success ? "Payment successful!" : "Already paid"}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {data.package.name} is now active for {data.name}.
            </p>
            <div className="mt-5">
              <Badge tone="emerald">Payment confirmed</Badge>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h1 className="font-display text-xl font-semibold text-navy-800">Choose payment method</h1>
            <p className="text-sm text-slate-500 mt-1">This is a demo payment step — no real amount is charged.</p>

            <div className="flex items-center gap-2 mt-4 bg-sand-50 border border-slate-200 rounded-lg p-1">
              {methods.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    method === m.key ? "bg-white shadow-sm text-navy-800" : "text-slate-500"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePay} className="mt-5 space-y-4">
              {method === "upi" && (
                <Input
                  label="UPI ID"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              )}
              {method === "card" && (
                <>
                  <Input
                    label="Card number"
                    required
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 16)
                          .replace(/(.{4})/g, "$1 ")
                          .trim()
                      )
                    }
                    placeholder="4242 4242 4242 4242"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry" required placeholder="MM/YY" maxLength={5} />
                    <Input label="CVV" required placeholder="123" maxLength={3} inputMode="numeric" />
                  </div>
                </>
              )}
              {method === "netbanking" && (
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">Select your bank</span>
                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-100 focus:border-navy-400">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </label>
              )}

              <div className="flex items-center justify-between rounded-lg bg-sand-50 border border-slate-200 px-4 py-3">
                <span className="text-sm text-slate-500">Amount payable</span>
                <span className="font-display text-lg font-semibold text-navy-800">₹{data.amount}</span>
              </div>

              {error && <Alert tone="red">{error}</Alert>}
              <Button type="submit" className="w-full" disabled={paying}>
                {paying ? "Processing payment…" : `Pay ₹${data.amount}`}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </main>
  );
}

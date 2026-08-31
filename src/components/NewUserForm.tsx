"use client";

import { useEffect, useState } from "react";
import type { PackagePlan, BillingCycle, SubscriptionType } from "@/types";
import { Card, Input, Textarea, Button, Alert, Badge, Spinner } from "@/components/ui";

const shareTargets = [
  { key: "whatsapp", label: "WhatsApp", urlFn: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}` },
  { key: "sms", label: "SMS", urlFn: (text: string) => `sms:?&body=${encodeURIComponent(text)}` },
];

const typeOptions: { value: SubscriptionType; title: string; description: string }[] = [
  {
    value: "existing",
    title: "Existing customer",
    description: "Already subscribed / paid outside the platform — mark them active right away.",
  },
  {
    value: "payment_link",
    title: "Send a payment link",
    description: "Generate a link you'll share yourself. They pay through it to activate.",
  },
  {
    value: "notify_confirm",
    title: "Notify to confirm & pay",
    description: "The user is sent a notification asking them to confirm and complete payment.",
  },
];

interface Result {
  type: SubscriptionType;
  name: string;
  link: string;
  contact: string;
  email?: string;
}

export default function NewUserForm({ onAdded }: { onAdded?: () => void }) {
  const [packages, setPackages] = useState<PackagePlan[] | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "" });
  const [packageId, setPackageId] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("payment_link");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((d) => {
        setPackages(d.packages || []);
        if (d.packages?.[0]) setPackageId(d.packages[0].id);
      });
  }, []);

  const selectedPackage = packages?.find((p) => p.id === packageId) || null;
  const price = selectedPackage
    ? billingCycle === "monthly"
      ? selectedPackage.price
      : Math.round(selectedPackage.price * 12 * (1 - selectedPackage.annualDiscountPercent / 100))
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.contact.trim()) {
      setError("Please fill in the user's name and mobile number.");
      return;
    }
    if (!consent) {
      setError("Please confirm the user has accepted all the terms before subscribing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          packageId,
          billingCycle,
          subscriptionType,
          consentAccepted: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/pay/${data.user.payToken}`;
      setResult({ type: subscriptionType, name: data.user.name, link, contact: data.user.contact, email: data.user.email });
      setForm({ name: "", contact: "", email: "", address: "" });
      setConsent(false);
      onAdded?.();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  }

  if (packages === null) {
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (result) {
    const shareText = `Hi ${result.name}, here's your subscription link — click here to subscribe: ${result.link}`;
    return (
      <Card className="p-4 sm:p-7 w-full max-w-xl">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 text-2xl flex items-center justify-center">
          ✓
        </div>
        <h2 className="font-display text-xl font-semibold text-navy-800 mt-4">
          {result.type === "existing" ? "User added" : "User created"}
        </h2>

        {result.type === "existing" && (
          <p className="text-sm text-slate-500 mt-1.5">
            {result.name} has been added as an existing, active subscriber. No payment link needed.
          </p>
        )}

        {result.type === "payment_link" && (
          <>
            <p className="text-sm text-slate-500 mt-1.5">
              Share this unique payment link with {result.name}. It's theirs alone and will activate their
              subscription once paid.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                readOnly
                value={result.link}
                className="flex-1 rounded-lg border border-slate-300 bg-sand-50 px-3.5 py-2.5 text-sm text-slate-600 font-mono truncate"
              />
              <Button variant="outline" onClick={copyLink}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
              {shareTargets.map((t) => (
                <a
                  key={t.key}
                  href={t.urlFn(shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center min-h-11 px-4 py-2 rounded-lg text-sm font-medium bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors"
                >
                  Share via {t.label}
                </a>
              ))}
            </div>
          </>
        )}

        {result.type === "notify_confirm" && (
          <>
            <Alert tone="emerald">
              A notification has been sent to {result.name} ({result.contact}
              {result.email ? `, ${result.email}` : ""}) asking them to confirm and pay.
            </Alert>
            <p className="text-sm text-slate-500 mt-3">You can still share the link directly if needed:</p>
            <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                readOnly
                value={result.link}
                className="flex-1 rounded-lg border border-slate-300 bg-sand-50 px-3.5 py-2.5 text-sm text-slate-600 font-mono truncate"
              />
              <Button variant="outline" onClick={copyLink}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </>
        )}

        <Button className="mt-6" variant="ghost" onClick={() => setResult(null)}>
          + Add another user
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-7 w-full max-w-xl">
      <h2 className="font-display text-xl font-semibold text-navy-800">New user</h2>
      <p className="text-sm text-slate-500 mt-1">Add a user's details and choose how they'll subscribe.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="User's full name"
          />
          <Input
            label="Mobile number"
            required
            type="tel"
            inputMode="numeric"
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value.replace(/[^0-9]/g, "") }))}
            placeholder="9876543210"
            maxLength={10}
          />
          <Input
            label="Email ID"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="user@example.com"
          />
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Package</span>
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-100 focus:border-navy-400"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price}/mo
                </option>
              ))}
            </select>
          </label>
        </div>

        <Textarea
          label="Address"
          rows={2}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Street, city, state, PIN code"
        />

        <div className="flex flex-wrap items-center gap-1 bg-sand-50 border border-slate-200 rounded-lg p-1 w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly" ? "bg-white shadow-sm text-navy-800" : "text-slate-500"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annually")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "annually" ? "bg-white shadow-sm text-navy-800" : "text-slate-500"
            }`}
          >
            Annually
            {selectedPackage && (
              <span className="ml-1.5 text-emerald-600 text-xs">Save {selectedPackage.annualDiscountPercent}%</span>
            )}
          </button>
          <span className="w-full sm:w-auto px-3 py-2 sm:py-1.5 text-sm text-slate-500 text-center sm:text-left border-t sm:border-t-0 border-slate-200">₹{price}</span>
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700 mb-2">How should this subscribe?</span>
          <div className="space-y-2">
            {typeOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  subscriptionType === opt.value ? "border-navy-700 bg-navy-50" : "border-slate-200 hover:bg-sand-50"
                }`}
              >
                <input
                  type="radio"
                  name="subscriptionType"
                  className="mt-1"
                  checked={subscriptionType === opt.value}
                  onChange={() => setSubscriptionType(opt.value)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">{opt.title}</p>
                  <p className="text-xs text-slate-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">You can change this later from the Existing Users tab.</p>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          I confirm the user has been informed of and accepted all terms &amp; conditions.
        </label>

        {error && <Alert tone="red">{error}</Alert>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Working…" : "Subscribe"}
        </Button>
      </form>
    </Card>
  );
}

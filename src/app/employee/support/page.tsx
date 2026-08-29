"use client";

import { useEffect, useState } from "react";
import type { SupportTicket } from "@/types";
import { Card, Textarea, Button, Alert, Badge, EmptyState, Spinner } from "@/components/ui";

const WHATSAPP_SUPPORT_NUMBER = "911234567890"; // demo number — replace with real support line

export default function EmployeeSupportPage() {
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/support");
    const data = await res.json();
    setTickets(data.tickets || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!message.trim()) {
      setError("Please describe the issue before sending.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setMessage("");
      setSuccess(true);
      load();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-navy-800">Support &amp; help</h1>
      <p className="text-sm text-slate-500 mt-1">
        Facing an issue? Send it to your admin, or reach out directly on WhatsApp.
      </p>

      <Card className="p-6 mt-6">
        <h2 className="font-display font-semibold text-navy-800 mb-4">Raise a ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            rows={4}
            placeholder="Describe the issue or trouble you're facing…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <Alert tone="red">{error}</Alert>}
          {success && (
            <Alert tone="emerald">
              Your message has been registered as a new issue and will be resolved in 2–3 working days.
            </Alert>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send to admin"}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-2">Prefer to chat? Message us on WhatsApp.</p>
          <a
            href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent("Hi, I need help with my Sahayak Partners account.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">Chat on WhatsApp</Button>
          </a>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="font-display font-semibold text-navy-800 mb-3">Your tickets</h2>
        {tickets === null ? (
          <Spinner className="w-5 h-5 text-slate-300" />
        ) : tickets.length === 0 ? (
          <Card>
            <EmptyState title="No tickets yet" description="Anything you send to your admin will show up here." />
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={t.status === "open" ? "amber" : "emerald"}>
                    {t.status === "open" ? "In progress" : "Resolved"}
                  </Badge>
                  <span className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-700 mt-2">{t.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { SubscribedUser, SubscriptionType } from "@/types";
import { Card, Badge, Spinner, EmptyState, Button } from "@/components/ui";

const typeLabels: Record<SubscriptionType, string> = {
  existing: "Existing customer",
  payment_link: "Payment link",
  notify_confirm: "Notify to confirm",
};

export default function ExistingUsersTab({ refreshKey }: { refreshKey: number }) {
  const [users, setUsers] = useState<SubscribedUser[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function updateUser(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
    setBusyId(null);
  }

  function linkFor(user: SubscribedUser) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/pay/${user.payToken}`;
  }

  async function copyLink(user: SubscribedUser) {
    try {
      await navigator.clipboard.writeText(linkFor(user));
      setCopiedId(user.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // no-op
    }
  }

  if (users === null) {
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No users yet"
          description="Add your first user from the New User tab to see them here."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium">Package</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-50 last:border-0 align-top">
              <td className="px-5 py-3.5">
                <p className="font-medium text-slate-800">{u.name}</p>
                <p className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</p>
              </td>
              <td className="px-5 py-3.5 text-slate-600">
                {u.contact}
                {u.email && <p className="text-xs text-slate-400">{u.email}</p>}
              </td>
              <td className="px-5 py-3.5 text-slate-600 capitalize">{u.billingCycle}</td>
              <td className="px-5 py-3.5 text-slate-600">₹{u.amount}</td>
              <td className="px-5 py-3.5">
                <select
                  value={u.subscriptionType}
                  disabled={busyId === u.id}
                  onChange={(e) => updateUser(u.id, { subscriptionType: e.target.value })}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-navy-100"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-5 py-3.5">
                <Badge tone={u.paymentStatus === "paid" ? "emerald" : u.paymentStatus === "failed" ? "red" : "amber"}>
                  {u.paymentStatus}
                </Badge>
                {u.subscriptionType === "notify_confirm" && u.notifiedAt && u.paymentStatus !== "paid" && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Notified {new Date(u.notifiedAt).toLocaleDateString()}
                  </p>
                )}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {u.paymentStatus !== "paid" && u.subscriptionType !== "existing" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => copyLink(u)}>
                        {copiedId === u.id ? "Copied!" : "Copy link"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === u.id}
                        onClick={() => updateUser(u.id, { action: "resend" })}
                      >
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === u.id}
                        onClick={() => updateUser(u.id, { action: "mark-paid" })}
                      >
                        Mark paid
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

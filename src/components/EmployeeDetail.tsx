"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Employee, SubscribedUser } from "@/types";
import { Card, Badge, RefChip, Button, Spinner, EmptyState, Alert, ReasonConfirmModal } from "@/components/ui";

export default function EmployeeDetail({ basePath, id }: { basePath: string; id: string }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [users, setUsers] = useState<SubscribedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [statusError, setStatusError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/employees/${id}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setEmployee(data.employee);
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(newStatus: "active" | "inactive", reason?: string) {
    setToggling(true);
    setStatusError("");
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmployee(data.employee);
      setShowDeactivateModal(false);
    } else {
      setStatusError(data.error || "Something went wrong.");
    }
    setToggling(false);
  }

  function handleStatusButtonClick() {
    if (!employee) return;
    if (employee.status === "active") {
      setStatusError("");
      setShowDeactivateModal(true);
    } else {
      setStatus("active");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-slate-400">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (notFound || !employee) {
    return (
      <Card>
        <EmptyState title="Employee not found" description="This employee may have been removed." />
      </Card>
    );
  }

  const paidUsers = users.filter((u) => u.paymentStatus === "paid");
  const totalCommission = Math.round(
    paidUsers.reduce((sum, u) => sum + (u.amount * employee.commissionRate) / 100, 0)
  );

  return (
    <div>
      <Link href={`${basePath}/employees`} className="text-sm text-slate-500 hover:text-navy-700">
        ← Back to employees
      </Link>

      <div className="flex items-start justify-between mt-4 mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-navy-800">
              {employee.firstName} {employee.lastName}
            </h1>
            <Badge tone={employee.status === "active" ? "emerald" : "slate"}>
              {employee.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <RefChip refId={employee.refId} />
            <span className="text-xs text-slate-400">Permanent reference ID</span>
          </div>
        </div>
        <Button
          variant={employee.status === "active" ? "danger" : "secondary"}
          onClick={handleStatusButtonClick}
          disabled={toggling}
        >
          {toggling ? "Updating…" : employee.status === "active" ? "Deactivate employee" : "Activate employee"}
        </Button>
      </div>

      {employee.status === "inactive" && employee.deactivationReason && (
        <Alert tone="amber">
          <span className="font-medium">Deactivated:</span> {employee.deactivationReason}
        </Alert>
      )}

      {showDeactivateModal && (
        <ReasonConfirmModal
          title={`Deactivate ${employee.firstName} ${employee.lastName}?`}
          description="They won't be able to log in or share referral links until reactivated. This is logged for the record."
          confirmLabel="Deactivate employee"
          placeholder="Why is this employee being deactivated?"
          loading={toggling}
          onCancel={() => setShowDeactivateModal(false)}
          onConfirm={(reason) => setStatus("inactive", reason)}
        />
      )}
      {statusError && (
        <div className="mb-4">
          <Alert tone="red">{statusError}</Alert>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Users referred</p>
          <p className="font-display text-2xl font-semibold text-navy-700 mt-1">{paidUsers.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Current commission rate</p>
          <p className="font-display text-2xl font-semibold text-navy-700 mt-1">{employee.commissionRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Rises to 12% after 100 paid users</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Commission earned</p>
          <p className="font-display text-2xl font-semibold text-emerald-600 mt-1">₹{totalCommission}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-navy-800 mb-4">Contact details</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Mobile" value={employee.mobile} />
            <Row label="Email" value={employee.email} />
            <Row label="Address" value={employee.address || "—"} />
            <Row label="Added on" value={new Date(employee.createdAt).toLocaleDateString()} />
            <Row label="Added by" value={employee.createdBy} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-navy-800 mb-4">Identity documents</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1.5">Aadhar: {employee.aadharNumber}</p>
              <DocPreview src={employee.aadharImage} label="Aadhar" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1.5">PAN: {employee.panNumber}</p>
              <DocPreview src={employee.panImage} label="PAN" />
            </div>
          </div>
          {employee.extraDetails.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">Other details</p>
              <dl className="space-y-2 text-sm">
                {employee.extraDetails.map((d, i) => (
                  <Row key={i} label={d.label} value={d.value} />
                ))}
              </dl>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-navy-800 mb-1">Users added</h2>
        <p className="text-sm text-slate-500 mb-4">Everyone who subscribed through this employee&apos;s referral link.</p>
        {users.length === 0 ? (
          <EmptyState
            title="No users yet"
            description="Once someone subscribes through this employee's referral link, they'll show up here."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">
                <th className="py-2.5 font-medium">Name</th>
                <th className="py-2.5 font-medium">Contact</th>
                <th className="py-2.5 font-medium">Package</th>
                <th className="py-2.5 font-medium">Billing</th>
                <th className="py-2.5 font-medium">Amount</th>
                <th className="py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 font-medium text-slate-800">{u.name}</td>
                  <td className="py-2.5 text-slate-600">{u.contact}</td>
                  <td className="py-2.5 text-slate-600">{u.packageId.replace("pkg-", "₹")}</td>
                  <td className="py-2.5 text-slate-600 capitalize">{u.billingCycle}</td>
                  <td className="py-2.5 text-slate-600">₹{u.amount}</td>
                  <td className="py-2.5">
                    <Badge tone={u.paymentStatus === "paid" ? "emerald" : "amber"}>{u.paymentStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-700 font-medium text-right">{value}</dd>
    </div>
  );
}

function DocPreview({ src, label }: { src: string; label: string }) {
  if (!src) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
        No {label} image
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`${label} document`} className="aspect-[4/3] object-cover rounded-lg border border-slate-200 w-full" />
  );
}

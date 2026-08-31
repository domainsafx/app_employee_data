"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Employee } from "@/types";
import { Card, Badge, RefChip, EmptyState, Button, Spinner, Input } from "@/components/ui";

export default function EmployeeList({ basePath }: { basePath: string }) {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [limit, setLimit] = useState(25);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((d) => {
        setEmployees(d.employees || []);
        setLimit(d.limit || 25);
      });
  }, []);

  if (employees === null) {
    return (
      <div className="flex justify-center py-24 text-slate-400">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase();
    return (
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.refId.toLowerCase().includes(q) ||
      e.mobile.includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {employees.length} of {limit} employee slots used
          </p>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${Math.min(100, (employees.length / limit) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search by name, mobile or reference ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-72"
          />
          <Link href={`${basePath}/employees/add`}>
            <Button disabled={employees.length >= limit}>+ Add employee</Button>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={employees.length === 0 ? "No employees yet" : "No matches"}
            description={
              employees.length === 0
                ? "Add your first employee to generate their permanent reference ID and get them onto the platform."
                : "Try a different name, mobile number, or reference ID."
            }
            action={
              employees.length === 0 && (
                <Link href={`${basePath}/employees/add`}>
                  <Button>+ Add employee</Button>
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <>
          <Card className="md:hidden overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <Link key={emp.id} href={`${basePath}/employees/${emp.id}`} className="block p-4 active:bg-sand-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{emp.email}</p>
                    </div>
                    <Badge tone={emp.status === "active" ? "emerald" : "slate"}>
                      {emp.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div><p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Reference</p><RefChip refId={emp.refId} /></div>
                    <div><p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Commission</p><p className="text-slate-700">{emp.commissionRate}%</p></div>
                    <div className="col-span-2"><p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Mobile</p><p className="text-slate-700">{emp.mobile}</p></div>
                  </div>
                  <p className="text-xs font-medium text-navy-700 mt-4">View employee →</p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="hidden md:block overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Reference ID</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Commission</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-50 last:border-0 hover:bg-sand-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{emp.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <RefChip refId={emp.refId} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{emp.mobile}</td>
                  <td className="px-5 py-3.5 text-slate-600">{emp.commissionRate}%</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={emp.status === "active" ? "emerald" : "slate"}>
                      {emp.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`${basePath}/employees/${emp.id}`} className="text-navy-700 font-medium hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </Card>
        </>
      )}
    </div>
  );
}

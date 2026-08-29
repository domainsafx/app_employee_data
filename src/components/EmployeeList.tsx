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
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
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
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name, mobile or reference ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72"
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
        <Card className="overflow-hidden">
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
      )}
    </div>
  );
}

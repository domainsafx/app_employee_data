"use client";

import { useState } from "react";
import NewUserForm from "@/components/NewUserForm";
import ExistingUsersTab from "@/components/ExistingUsersTab";

export default function EmployeeDashboard() {
  const [tab, setTab] = useState<"new" | "existing">("new");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800">Home</h1>
      <p className="text-sm text-slate-500 mt-1">Add new users and keep track of everyone you've referred.</p>

      <div className="flex items-center gap-1 mt-6 bg-white border border-slate-200 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("new")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "new" ? "bg-navy-700 text-white" : "text-slate-500 hover:text-navy-700"
          }`}
        >
          New user
        </button>
        <button
          onClick={() => setTab("existing")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "existing" ? "bg-navy-700 text-white" : "text-slate-500 hover:text-navy-700"
          }`}
        >
          Existing users
        </button>
      </div>

      <div className="mt-6">
        {tab === "new" ? (
          <NewUserForm onAdded={() => setRefreshKey((k) => k + 1)} />
        ) : (
          <ExistingUsersTab refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
}

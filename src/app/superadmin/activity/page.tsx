"use client";

import { useEffect, useState } from "react";
import type { ActivityLogEntry } from "@/types";
import { Card, EmptyState, Spinner } from "@/components/ui";

export default function ActivityLogPage() {
  const [activity, setActivity] = useState<ActivityLogEntry[] | null>(null);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => setActivity(d.activity || []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-800 mb-1">Activity log</h1>
      <p className="text-sm text-slate-500 mb-6">
        Every login, employee change, and subscription across the whole platform.
      </p>

      {activity === null ? (
        <div className="flex justify-center py-24 text-slate-400">
          <Spinner className="w-6 h-6" />
        </div>
      ) : activity.length === 0 ? (
        <Card>
          <EmptyState title="Nothing logged yet" description="Actions taken by admins and employees will appear here." />
        </Card>
      ) : (
        <Card className="divide-y divide-slate-50">
          {activity.map((a) => (
            <div key={a.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-800">
                  <span className="font-medium">{a.actor}</span> — {a.action}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{a.details}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {new Date(a.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

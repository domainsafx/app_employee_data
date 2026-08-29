"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefChip } from "@/components/ui";

const navItems = [
  { href: "/employee/dashboard", label: "Home" },
  { href: "/employee/support", label: "Support" },
];

export default function EmployeeNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; refId: string } | null>(null);

  useEffect(() => {
    fetch("/api/employee-profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.employee) {
          setProfile({ name: `${d.employee.firstName} ${d.employee.lastName}`, refId: d.employee.refId });
        }
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/employee-login");
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/employee/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
              <span className="font-display text-emerald-400 font-bold text-xs">SP</span>
            </div>
            <span className="font-display font-semibold text-navy-800 hidden sm:block">Sahayak Partners</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-navy-50 text-navy-700" : "text-slate-500 hover:text-navy-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {profile && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800 leading-tight">{profile.name}</p>
              <div className="mt-0.5">
                <RefChip refId={profile.refId} />
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-600 font-medium">
            Log out
          </button>
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-navy-50 text-navy-700" : "text-slate-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

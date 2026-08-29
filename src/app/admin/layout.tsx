import { getSession } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";
import { Icon, icons } from "@/components/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  const name = session && session.type === "admin" ? session.name : "Admin";

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <Icon path={icons.grid} /> },
    { href: "/admin/employees", label: "Employees", icon: <Icon path={icons.people} /> },
    { href: "/admin/employees/add", label: "Add employee", icon: <Icon path={icons.plus} /> },
    { href: "/admin/support", label: "Support tickets", icon: <Icon path={icons.ticket} /> },
  ];

  return (
    <DashboardShell roleLabel="Admin" name={name} navItems={navItems}>
      {children}
    </DashboardShell>
  );
}

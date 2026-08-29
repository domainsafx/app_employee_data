import { getSession } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";
import { Icon, icons } from "@/components/icons";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  const name = session && session.type === "admin" ? session.name : "Super Admin";

  const navItems = [
    { href: "/superadmin/dashboard", label: "Overview", icon: <Icon path={icons.grid} /> },
    { href: "/superadmin/employees", label: "Employees", icon: <Icon path={icons.people} /> },
    { href: "/superadmin/employees/add", label: "Add employee", icon: <Icon path={icons.plus} /> },
    { href: "/superadmin/activity", label: "Activity log", icon: <Icon path={icons.activity} /> },
    { href: "/superadmin/support", label: "Support tickets", icon: <Icon path={icons.ticket} /> },
  ];

  return (
    <DashboardShell roleLabel="Super Admin" name={name} navItems={navItems}>
      {children}
    </DashboardShell>
  );
}

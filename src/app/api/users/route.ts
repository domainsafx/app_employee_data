import { NextRequest, NextResponse } from "next/server";
import {
  getUsersByEmployeeRefId,
  getAllUsers,
  getEmployeeByRefId,
  getPackageById,
  insertUser,
  logActivity,
} from "@/lib/repo";
import { getSession } from "@/lib/session";
import type { SubscriptionType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.type === "admin") {
    const refId = req.nextUrl.searchParams.get("refId");
    const users = refId ? await getUsersByEmployeeRefId(refId) : await getAllUsers();
    return NextResponse.json({ users });
  }

  const users = await getUsersByEmployeeRefId(session.refId);
  return NextResponse.json({ users });
}

const VALID_TYPES: SubscriptionType[] = ["existing", "payment_link", "notify_confirm"];

// Employee-authenticated: adds a user against the employee's own reference ID.
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.type !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, contact, email, address, packageId, billingCycle, subscriptionType, consentAccepted } = body;

  if (!name || !String(name).trim() || !contact || !String(contact).trim()) {
    return NextResponse.json({ error: "Name and contact number are required." }, { status: 400 });
  }
  if (!packageId || !billingCycle) {
    return NextResponse.json({ error: "Please choose a package and billing cycle." }, { status: 400 });
  }
  if (!VALID_TYPES.includes(subscriptionType)) {
    return NextResponse.json({ error: "Please choose how this subscription should be handled." }, { status: 400 });
  }
  if (!consentAccepted) {
    return NextResponse.json({ error: "Please confirm the user has accepted the terms before continuing." }, { status: 400 });
  }

  const employee = await getEmployeeByRefId(session.refId);
  if (!employee || employee.status !== "active") {
    return NextResponse.json({ error: "Your account isn't active. Contact your admin." }, { status: 403 });
  }
  const pkg = await getPackageById(packageId);
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });

  const amount =
    billingCycle === "annually"
      ? Math.round(pkg.price * 12 * (1 - pkg.annualDiscountPercent / 100))
      : pkg.price;

  const user = await insertUser({
    name: String(name).trim(),
    contact: String(contact).trim(),
    email: email ? String(email).trim() : undefined,
    address: address ? String(address).trim() : undefined,
    employeeRefId: session.refId,
    packageId,
    billingCycle,
    amount,
    subscriptionType,
  });

  await logActivity({
    actor: `${employee.firstName} ${employee.lastName}`,
    action:
      subscriptionType === "existing"
        ? "Added existing user"
        : subscriptionType === "payment_link"
        ? "Generated payment link for new user"
        : "Sent payment confirmation notification",
    details: `${user.name} — ${pkg.name} (${billingCycle}) via ${employee.refId}`,
  });

  return NextResponse.json({ user, package: pkg });
}

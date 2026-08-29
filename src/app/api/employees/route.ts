import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  getAllEmployees,
  countEmployees,
  getEmployeeByMobile,
  insertEmployee,
  logActivity,
  EMPLOYEE_LIMIT,
} from "@/lib/repo";
import { getSession } from "@/lib/session";
import type { ExtraDetail } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSession();
  if (!session || session.type !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const employees = await getAllEmployees();
  return NextResponse.json({ employees, limit: EMPLOYEE_LIMIT });
}

async function saveImage(file: File | null): Promise<string> {
  if (!file || file.size === 0) return "";
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), bytes);
  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.type !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const mobile = String(form.get("mobile") || "").trim();
  const email = String(form.get("email") || "").trim();
  const address = String(form.get("address") || "").trim();
  const aadharNumber = String(form.get("aadharNumber") || "").trim();
  const panNumber = String(form.get("panNumber") || "").trim();
  const extraDetailsRaw = String(form.get("extraDetails") || "[]");
  let extraDetails: ExtraDetail[] = [];
  try {
    extraDetails = JSON.parse(extraDetailsRaw);
  } catch {
    extraDetails = [];
  }

  if (!firstName || !lastName || !mobile || !email || !aadharNumber || !panNumber) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const currentCount = await countEmployees();
  if (currentCount >= EMPLOYEE_LIMIT) {
    return NextResponse.json(
      {
        error: `You've reached the current limit of ${EMPLOYEE_LIMIT} employees. Contact support to raise this limit.`,
      },
      { status: 400 }
    );
  }

  const existingByMobile = await getEmployeeByMobile(mobile);
  if (existingByMobile) {
    return NextResponse.json({ error: "An employee with this mobile number already exists." }, { status: 400 });
  }

  const aadharImage = await saveImage(form.get("aadharImage") as File | null);
  const panImage = await saveImage(form.get("panImage") as File | null);

  const employee = await insertEmployee({
    firstName,
    lastName,
    mobile,
    email,
    address,
    aadharNumber,
    aadharImage,
    panNumber,
    panImage,
    extraDetails,
    createdBy: session.name,
  });

  await logActivity({
    actor: session.name,
    action: "Added employee",
    details: `${employee.firstName} ${employee.lastName} (${employee.refId})`,
  });

  return NextResponse.json({ employee });
}

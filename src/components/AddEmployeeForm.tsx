"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Alert, Card } from "@/components/ui";

interface ExtraDetail {
  label: string;
  value: string;
}

export default function AddEmployeeForm({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    address: "",
    aadharNumber: "",
    panNumber: "",
  });
  const [aadharImage, setAadharImage] = useState<File | null>(null);
  const [panImage, setPanImage] = useState<File | null>(null);
  const [extraDetails, setExtraDetails] = useState<ExtraDetail[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addExtraDetail() {
    setExtraDetails((d) => [...d, { label: "", value: "" }]);
  }
  function updateExtraDetail(i: number, field: "label" | "value", value: string) {
    setExtraDetails((d) => d.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removeExtraDetail(i: number) {
    setExtraDetails((d) => d.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("extraDetails", JSON.stringify(extraDetails.filter((d) => d.label.trim())));
      if (aadharImage) fd.append("aadharImage", aadharImage);
      if (panImage) fd.append("panImage", panImage);

      const res = await fetch("/api/employees", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push(`${basePath}/employees/${data.employee.id}?added=1`);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h2 className="font-display font-semibold text-navy-800 mb-4">Personal details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            required
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            placeholder="Ravi"
          />
          <Input
            label="Second name"
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            placeholder="Kumar"
          />
          <Input
            label="Mobile number"
            required
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="9876543210"
            maxLength={10}
            hint="Used for the employee's OTP login"
          />
          <Input
            label="Email ID"
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="ravi@example.com"
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Address"
            rows={3}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street, city, state, PIN code"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-navy-800 mb-4">Identity documents</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Aadhar number"
            required
            value={form.aadharNumber}
            onChange={(e) => update("aadharNumber", e.target.value)}
            placeholder="XXXX XXXX XXXX"
          />
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Aadhar picture</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAadharImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:text-sm file:font-medium hover:file:bg-navy-100"
            />
          </div>
          <Input
            label="PAN number"
            required
            value={form.panNumber}
            onChange={(e) => update("panNumber", e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
          />
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">PAN picture</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPanImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:text-sm file:font-medium hover:file:bg-navy-100"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy-800">Other details</h2>
          <Button type="button" variant="outline" size="sm" onClick={addExtraDetail}>
            + Add field
          </Button>
        </div>
        {extraDetails.length === 0 && (
          <p className="text-sm text-slate-400">
            Add anything else worth keeping on file — bank account, emergency contact, joining date, and so on.
          </p>
        )}
        <div className="space-y-3">
          {extraDetails.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
              <Input
                placeholder="Field name (e.g. Bank account)"
                value={row.label}
                onChange={(e) => updateExtraDetail(i, "label", e.target.value)}
              />
              <Input
                placeholder="Value"
                value={row.value}
                onChange={(e) => updateExtraDetail(i, "value", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeExtraDetail(i)}
                className="h-[42px] px-3 text-sm text-slate-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Card>

      {error && <Alert tone="red">{error}</Alert>}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}

import AddEmployeeForm from "@/components/AddEmployeeForm";

export default function AddEmployeePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-navy-800 mb-1">Add an employee</h1>
      <p className="text-sm text-slate-500 mb-6">
        We&apos;ll generate a permanent 8-character reference ID for them automatically.
      </p>
      <AddEmployeeForm basePath="/admin" />
    </div>
  );
}

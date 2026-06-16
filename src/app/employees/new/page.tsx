import { EmployeeForm } from "@/components/forms/employee-form";

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuen Mitarbeiter anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">
          Erfasse Stammdaten fuer einen neuen Mitarbeiter.
        </p>
      </div>
      <EmployeeForm />
    </div>
  );
}

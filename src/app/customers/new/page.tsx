import { CustomerForm } from "@/components/forms/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-black">Neuen Kunden anlegen</h1>
        <p className="font-sans text-sm font-light text-grey">
          Erfasse Stammdaten fuer einen neuen Kunden.
        </p>
      </div>
      <CustomerForm />
    </div>
  );
}

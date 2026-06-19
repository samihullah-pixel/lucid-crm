import { login } from "@/actions/auth";

export default async function LoginPage(
  props: {
    searchParams: Promise<{ error?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm border border-gold/20 bg-white p-8">
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl font-light tracking-wide text-black">
            Lucid<span className="align-super text-sm text-gold">*</span>
          </span>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-[3px] text-grey">
            Interner Bereich
          </p>
        </div>
        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
              Passwort
            </label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
            />
          </div>
          {searchParams.error && (
            <p className="font-sans text-xs text-red-600">Falsches Passwort.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPuzzlesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-5 py-5 sm:gap-6 sm:py-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-neutral-500">
          Admin
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
          Puzzles
        </h1>
      </div>

      <section
        className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
        aria-live="polite"
      >
        <p className="text-sm font-semibold uppercase text-neutral-500">
          Loading
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-700">
          Fetching puzzles from the admin API.
        </p>
      </section>
    </div>
  );
}

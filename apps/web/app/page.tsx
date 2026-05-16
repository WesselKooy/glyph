import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col justify-between gap-10 py-6">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Daily Link Grid
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-neutral-950">
            Glyph
          </h1>
          <p className="max-w-md text-base leading-7 text-neutral-700">
            Find the hidden links, reveal each group, and decide whether the
            puzzle felt fair.
          </p>
        </div>

        <Link
          href="/play"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          Play puzzle
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-2" aria-label="Puzzle preview">
        {["Basil", "Mercury", "Ruby", "Thyme"].map((item) => (
          <div
            key={item}
            className="flex aspect-[4/3] items-center justify-center rounded-md border border-neutral-200 bg-white/85 px-3 text-center text-sm font-semibold text-neutral-800 shadow-sm"
          >
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}

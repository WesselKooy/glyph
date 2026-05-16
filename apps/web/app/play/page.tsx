import Link from "next/link";

import { dailyLinkGridPuzzle } from "@/features/puzzle/fixtures/link-grid-puzzles";
import { createRenderableLinkGridItems } from "@/features/puzzle/lib/link-grid";

export default function PlayPage() {
  const puzzle = dailyLinkGridPuzzle;
  const puzzleItems = createRenderableLinkGridItems(puzzle);

  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      <header className="space-y-2">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
        >
          Back home
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {puzzle.theme}
          </p>
          <h1 className="text-3xl font-semibold tracking-normal text-neutral-950">
            {puzzle.title}
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            Find {puzzle.groups.length} hidden groups of {puzzle.groupSize}.
          </p>
        </div>
      </header>

      <section
        className="grid grid-cols-3 gap-2 rounded-md border border-dashed border-neutral-300 bg-white/70 p-3"
        aria-label="Placeholder puzzle grid"
      >
        {puzzleItems.map((item) => (
          <div
            key={item.id}
            className="flex aspect-square items-center justify-center rounded-md bg-emerald-50 text-sm font-semibold text-neutral-500"
          >
            {item.text}
          </div>
        ))}
      </section>
    </div>
  );
}

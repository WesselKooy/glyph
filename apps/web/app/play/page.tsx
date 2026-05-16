import Link from "next/link";

import { dailyLinkGridPuzzle } from "@/features/puzzle/fixtures/link-grid-puzzles";
import { PuzzleBoard } from "@/features/puzzle/components/PuzzleBoard";

export default function PlayPage() {
  const puzzle = dailyLinkGridPuzzle;

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
          <div className="flex flex-wrap gap-2">
            <span className="rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase text-emerald-900">
              {puzzle.theme}
            </span>
            <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs font-semibold uppercase text-neutral-700">
              {puzzle.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-neutral-950">
            {puzzle.title}
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            Find {puzzle.groups.length} hidden groups of {puzzle.groupSize}.
          </p>
        </div>
      </header>

      <PuzzleBoard puzzle={puzzle} />
    </div>
  );
}

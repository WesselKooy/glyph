"use client";

import Link from "next/link";
import { useState } from "react";

import { linkGridPuzzles } from "../fixtures/link-grid-puzzles";
import { PuzzleBoard } from "./PuzzleBoard";

export function PuzzlePlay() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = linkGridPuzzles[puzzleIndex];

  if (!puzzle || !isPlayablePuzzle(puzzle)) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4 py-10">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
        >
          Back home
        </Link>
        <section className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-950">
            No puzzle available
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            The hardcoded puzzle fixture could not be loaded. Try again after a
            complete puzzle has been added.
          </p>
        </section>
      </div>
    );
  }

  function playAnotherPuzzle() {
    setPuzzleIndex((currentPuzzleIndex) =>
      (currentPuzzleIndex + 1) % linkGridPuzzles.length,
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-5 sm:gap-6 sm:py-6">
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
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
            {puzzle.title}
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            Find {puzzle.groups.length} hidden groups of {puzzle.groupSize}.
          </p>
        </div>
      </header>

      <PuzzleBoard
        key={puzzle.id}
        puzzle={puzzle}
        onPlayAnother={playAnotherPuzzle}
      />
    </div>
  );
}

function isPlayablePuzzle(puzzle: (typeof linkGridPuzzles)[number]): boolean {
  return (
    puzzle.groupSize > 0 &&
    puzzle.groups.length > 0 &&
    puzzle.groups.every((group) => group.items.length === puzzle.groupSize)
  );
}

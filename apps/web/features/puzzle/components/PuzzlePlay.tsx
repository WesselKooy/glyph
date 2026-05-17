"use client";

import Link from "next/link";
import { useState } from "react";

import { linkGridPuzzles } from "../fixtures/link-grid-puzzles";
import { PuzzleBoard } from "./PuzzleBoard";

export function PuzzlePlay() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = linkGridPuzzles[puzzleIndex];

  function playAnotherPuzzle() {
    setPuzzleIndex((currentPuzzleIndex) =>
      (currentPuzzleIndex + 1) % linkGridPuzzles.length,
    );
  }

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

      <PuzzleBoard
        key={puzzle.id}
        puzzle={puzzle}
        onPlayAnother={playAnotherPuzzle}
      />
    </div>
  );
}

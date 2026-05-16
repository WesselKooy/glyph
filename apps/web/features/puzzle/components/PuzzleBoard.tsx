"use client";

import { useMemo, useState } from "react";

import {
  createRenderableLinkGridItems,
  type LinkGridPuzzle,
} from "../lib/link-grid";
import { PuzzleTile } from "./PuzzleTile";

type PuzzleBoardProps = {
  puzzle: LinkGridPuzzle;
};

export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  const [shuffleCount, setShuffleCount] = useState(0);
  const puzzleItems = useMemo(
    () => createRenderableLinkGridItems(puzzle, `${puzzle.id}:${shuffleCount}`),
    [puzzle, shuffleCount],
  );
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const itemCount = puzzleItems.length;
  const selectedCount = selectedItemIds.size;
  const gridColumns = itemCount === 12 ? "grid-cols-3" : "grid-cols-4";
  const isSubmitReady = selectedCount === puzzle.groupSize;

  function toggleItem(itemId: string) {
    setSelectedItemIds((currentSelectedItemIds) => {
      const nextSelectedItemIds = new Set(currentSelectedItemIds);

      if (nextSelectedItemIds.has(itemId)) {
        nextSelectedItemIds.delete(itemId);
        return nextSelectedItemIds;
      }

      if (nextSelectedItemIds.size >= puzzle.groupSize) {
        return nextSelectedItemIds;
      }

      nextSelectedItemIds.add(itemId);
      return nextSelectedItemIds;
    });
  }

  function deselectAll() {
    setSelectedItemIds(new Set());
  }

  function shuffleTiles() {
    setShuffleCount((currentShuffleCount) => currentShuffleCount + 1);
  }

  return (
    <section className="space-y-4" aria-labelledby="puzzle-board-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="puzzle-board-title"
            className="text-sm font-semibold text-neutral-950"
          >
            Puzzle grid
          </h2>
          <p className="text-sm text-neutral-600">
            Select {puzzle.groupSize} tiles that belong together.
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-emerald-800">
          {selectedCount}/{puzzle.groupSize}
        </p>
      </div>

      <div
        className={`grid ${gridColumns} gap-2 rounded-md border border-neutral-200 bg-white/55 p-2 shadow-sm sm:gap-3 sm:p-3`}
        aria-label={`${itemCount} tile puzzle grid`}
      >
        {puzzleItems.map((item) => (
          <PuzzleTile
            key={item.id}
            item={item}
            selected={selectedItemIds.has(item.id)}
            disabled={
              selectedCount >= puzzle.groupSize && !selectedItemIds.has(item.id)
            }
            onToggle={toggleItem}
          />
        ))}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={!isSubmitReady}
          className={[
            "min-h-12 w-full rounded-md px-4 text-sm font-semibold shadow-sm transition",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
            isSubmitReady
              ? "bg-emerald-800 text-white hover:bg-emerald-700"
              : "cursor-not-allowed bg-neutral-200 text-neutral-500",
          ].join(" ")}
        >
          Submit
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={deselectAll}
            className={[
              "min-h-11 rounded-md border px-3 text-sm font-semibold transition",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
              selectedCount > 0
                ? "border-neutral-300 bg-white/90 text-neutral-800 hover:border-emerald-700 hover:bg-emerald-50"
                : "cursor-not-allowed border-neutral-200 bg-white/55 text-neutral-400",
            ].join(" ")}
          >
            Deselect all
          </button>
          <button
            type="button"
            onClick={shuffleTiles}
            className="min-h-11 rounded-md border border-neutral-300 bg-white/90 px-3 text-sm font-semibold text-neutral-800 transition hover:border-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          >
            Shuffle
          </button>
        </div>
      </div>
    </section>
  );
}

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
  const puzzleItems = useMemo(() => createRenderableLinkGridItems(puzzle), [puzzle]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const itemCount = puzzleItems.length;
  const selectedCount = selectedItemIds.size;
  const gridColumns = itemCount === 12 ? "grid-cols-3" : "grid-cols-4";

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

  return (
    <section className="space-y-3" aria-labelledby="puzzle-board-title">
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
    </section>
  );
}

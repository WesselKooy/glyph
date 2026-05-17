"use client";

import { useMemo, useState } from "react";

import {
  createRenderableLinkGridItems,
  flattenLinkGridPuzzleGroups,
  type LinkGridGroup,
  type LinkGridPuzzle,
} from "../lib/link-grid";
import { PuzzleTile } from "./PuzzleTile";

type PuzzleBoardProps = {
  puzzle: LinkGridPuzzle;
};

export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  const [shuffleCount, setShuffleCount] = useState(0);
  const [solvedGroupIds, setSolvedGroupIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<GuessFeedback>({
    tone: "idle",
    message: "Find a hidden group to begin.",
  });
  const allPuzzleItems = useMemo(
    () => flattenLinkGridPuzzleGroups(puzzle),
    [puzzle],
  );
  const puzzleItems = useMemo(
    () =>
      createRenderableLinkGridItems(puzzle, `${puzzle.id}:${shuffleCount}`).filter(
        (item) => !solvedGroupIds.has(item.groupId),
      ),
    [puzzle, shuffleCount, solvedGroupIds],
  );
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const solvedGroups = puzzle.groups.filter((group) => solvedGroupIds.has(group.id));
  const unsolvedGroups = puzzle.groups.filter(
    (group) => !solvedGroupIds.has(group.id),
  );
  const itemCount = puzzleItems.length;
  const totalItemCount = allPuzzleItems.length;
  const selectedCount = selectedItemIds.size;
  const mistakesRemaining = puzzle.mistakesAllowed - mistakes;
  const puzzleSolved = solvedGroupIds.size === puzzle.groups.length;
  const gameFailed = mistakesRemaining <= 0;
  const gameOver = puzzleSolved || gameFailed;
  const gridColumns = totalItemCount === 12 ? "grid-cols-3" : "grid-cols-4";
  const isSubmitReady = selectedCount === puzzle.groupSize && !gameOver;

  function toggleItem(itemId: string) {
    if (gameOver) {
      return;
    }

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
    if (!gameOver) {
      setFeedback({
        tone: "idle",
        message: "Selection cleared.",
      });
    }
  }

  function shuffleTiles() {
    setShuffleCount((currentShuffleCount) => currentShuffleCount + 1);
  }

  function submitGuess() {
    if (!isSubmitReady) {
      return;
    }

    const selectedIds = [...selectedItemIds];
    const solvedGroup = findSolvedGroup(unsolvedGroups, allPuzzleItems, selectedIds);

    if (solvedGroup) {
      const nextSolvedGroupIds = new Set(solvedGroupIds);
      nextSolvedGroupIds.add(solvedGroup.id);

      setSolvedGroupIds(nextSolvedGroupIds);
      setSelectedItemIds(new Set());
      setFeedback({
        tone: "correct",
        message:
          nextSolvedGroupIds.size === puzzle.groups.length
            ? `Solved: ${solvedGroup.label}. Puzzle complete.`
            : `Correct: ${solvedGroup.label}.`,
      });
      return;
    }

    const nextMistakes = mistakes + 1;
    const nearMiss = hasOneAwayGroup(unsolvedGroups, allPuzzleItems, selectedIds);

    setMistakes(nextMistakes);
    setSelectedItemIds(new Set());
    setFeedback({
      tone: "incorrect",
      message:
        nextMistakes >= puzzle.mistakesAllowed
          ? "No mistakes remaining. Puzzle failed."
          : nearMiss
            ? "One away."
            : "Not quite.",
    });
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

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-neutral-200 bg-white/70 px-3 py-2">
          <span className="block text-xs font-semibold uppercase text-neutral-500">
            Mistakes left
          </span>
          <span className="font-semibold text-neutral-950">
            {Math.max(mistakesRemaining, 0)}/{puzzle.mistakesAllowed}
          </span>
        </div>
        <div className="rounded-md border border-neutral-200 bg-white/70 px-3 py-2">
          <span className="block text-xs font-semibold uppercase text-neutral-500">
            Solved
          </span>
          <span className="font-semibold text-neutral-950">
            {solvedGroupIds.size}/{puzzle.groups.length}
          </span>
        </div>
      </div>

      {solvedGroups.length > 0 ? (
        <div className="space-y-2" aria-label="Solved groups">
          {solvedGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3"
            >
              <h3 className="text-sm font-semibold text-emerald-950">
                {group.label}
              </h3>
              <p className="mt-1 text-sm text-emerald-900">
                {group.items.join(", ")}
              </p>
            </div>
          ))}
        </div>
      ) : null}

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
              gameOver ||
              (selectedCount >= puzzle.groupSize && !selectedItemIds.has(item.id))
            }
            onToggle={toggleItem}
          />
        ))}
      </div>

      <p
        className={[
          "rounded-md border px-3 py-2 text-sm font-medium",
          feedback.tone === "correct"
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : feedback.tone === "incorrect"
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-neutral-200 bg-white/70 text-neutral-700",
        ].join(" ")}
        role={feedback.tone === "idle" ? undefined : "status"}
      >
        {feedback.message}
      </p>

      <div className="space-y-2">
        <button
          type="button"
          disabled={!isSubmitReady}
          onClick={submitGuess}
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
            disabled={selectedCount === 0 || gameOver}
            onClick={deselectAll}
            className={[
              "min-h-11 rounded-md border px-3 text-sm font-semibold transition",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
              selectedCount > 0 && !gameOver
                ? "border-neutral-300 bg-white/90 text-neutral-800 hover:border-emerald-700 hover:bg-emerald-50"
                : "cursor-not-allowed border-neutral-200 bg-white/55 text-neutral-400",
            ].join(" ")}
          >
            Deselect all
          </button>
          <button
            type="button"
            disabled={gameOver}
            onClick={shuffleTiles}
            className={[
              "min-h-11 rounded-md border px-3 text-sm font-semibold transition",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
              gameOver
                ? "cursor-not-allowed border-neutral-200 bg-white/55 text-neutral-400"
                : "border-neutral-300 bg-white/90 text-neutral-800 hover:border-emerald-700 hover:bg-emerald-50",
            ].join(" ")}
          >
            Shuffle
          </button>
        </div>
      </div>
    </section>
  );
}

type GuessFeedback = {
  tone: "idle" | "correct" | "incorrect";
  message: string;
};

function findSolvedGroup(
  groups: readonly LinkGridGroup[],
  items: ReturnType<typeof flattenLinkGridPuzzleGroups>,
  selectedItemIds: readonly string[],
): LinkGridGroup | undefined {
  const selectedIdSet = new Set(selectedItemIds);

  return groups.find((group) => {
    const groupItemIds = getGroupItemIds(items, group.id);

    return (
      groupItemIds.length === selectedItemIds.length &&
      groupItemIds.every((itemId) => selectedIdSet.has(itemId))
    );
  });
}

function hasOneAwayGroup(
  groups: readonly LinkGridGroup[],
  items: ReturnType<typeof flattenLinkGridPuzzleGroups>,
  selectedItemIds: readonly string[],
): boolean {
  const selectedIdSet = new Set(selectedItemIds);

  return groups.some((group) => {
    const groupItemIds = getGroupItemIds(items, group.id);
    const matchingItemCount = groupItemIds.filter((itemId) =>
      selectedIdSet.has(itemId),
    ).length;

    return matchingItemCount === groupItemIds.length - 1;
  });
}

function getGroupItemIds(
  items: ReturnType<typeof flattenLinkGridPuzzleGroups>,
  groupId: string,
): string[] {
  return items
    .filter((item) => item.groupId === groupId)
    .map((item) => item.id);
}

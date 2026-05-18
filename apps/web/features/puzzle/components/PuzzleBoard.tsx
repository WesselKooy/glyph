"use client";

import { useMemo, useState } from "react";

import { shuffleLinkGridPuzzleItems } from "../lib/link-grid";
import {
  submitPuzzleGuess,
  type PlayablePuzzle,
  type SolvedGroupDto,
} from "../lib/puzzle-api";
import { PuzzleTile } from "./PuzzleTile";

type PuzzleBoardProps = {
  puzzle: PlayablePuzzle;
};

export function PuzzleBoard({ puzzle }: PuzzleBoardProps) {
  const [shuffleCount, setShuffleCount] = useState(0);
  const [solvedGroups, setSolvedGroups] = useState<SolvedGroupDto[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [mistakesRemaining, setMistakesRemaining] = useState(
    puzzle.mistakesAllowed,
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GuessFeedback>({
    tone: "idle",
    message: "Find a hidden group to begin.",
  });
  const solvedItemIds = useMemo(
    () =>
      new Set(
        solvedGroups.flatMap((group) => group.items.map((item) => item.id)),
      ),
    [solvedGroups],
  );
  const puzzleItems = useMemo(
    () =>
      shuffleLinkGridPuzzleItems(
        puzzle.items,
        `${puzzle.playSessionId}:${shuffleCount}`,
      ).filter((item) => !solvedItemIds.has(item.id)),
    [puzzle.items, puzzle.playSessionId, shuffleCount, solvedItemIds],
  );
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const itemCount = puzzleItems.length;
  const totalItemCount = puzzle.items.length;
  const selectedCount = selectedItemIds.size;
  const totalGroupCount = Math.floor(totalItemCount / puzzle.groupSize);
  const puzzleSolved = solvedGroups.length === totalGroupCount;
  const gameFailed = mistakesRemaining <= 0;
  const gameOver = puzzleSolved || gameFailed;
  const gridColumns = totalItemCount === 12 ? "grid-cols-3" : "grid-cols-4";
  const isSubmitReady =
    selectedCount === puzzle.groupSize && !gameOver && !submitting;

  function toggleItem(itemId: string) {
    if (gameOver || submitting) {
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

  async function submitGuess() {
    if (!isSubmitReady) {
      return;
    }

    const selectedIds = [...selectedItemIds];
    setSubmitting(true);

    try {
      const result = await submitPuzzleGuess(puzzle.playSessionId, selectedIds);

      setMistakes(result.mistakes);
      setMistakesRemaining(result.mistakesRemaining);
      setSelectedItemIds(new Set());

      if (result.correct && result.group) {
        const solvedGroup = result.group;

        setSolvedGroups((currentSolvedGroups) => [
          ...currentSolvedGroups,
          solvedGroup,
        ]);
        setFeedback({
          tone: "correct",
          message: result.solved
            ? `Solved: ${solvedGroup.label}. Puzzle complete.`
            : `Correct: ${solvedGroup.label}.`,
        });
        return;
      }

      setFeedback({
        tone: "incorrect",
        message: result.message,
      });
    } catch (error) {
      setFeedback({
        tone: "incorrect",
        message:
          error instanceof Error
            ? error.message
            : "The guess could not be submitted.",
      });
    } finally {
      setSubmitting(false);
    }
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
            Select {puzzle.groupSize} tiles, then submit your group.
          </p>
        </div>
        <p
          className="shrink-0 text-sm font-semibold text-emerald-800"
          aria-label={`${selectedCount} of ${puzzle.groupSize} tiles selected`}
        >
          {selectedCount}/{puzzle.groupSize}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-neutral-200 bg-white/70 px-3 py-2">
          <span className="block text-xs font-semibold uppercase text-neutral-500">
            Mistakes remaining
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
            {solvedGroups.length}/{totalGroupCount}
          </span>
        </div>
      </div>

      {solvedGroups.length > 0 ? (
        <div className="space-y-2" aria-label="Solved groups">
          {solvedGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 shadow-sm motion-safe:animate-[solvedReveal_180ms_ease-out]"
            >
              <h3 className="text-sm font-semibold text-emerald-950">
                {group.label}
              </h3>
              <p className="mt-1 text-sm text-emerald-900">
                {group.items.map((item) => item.text).join(", ")}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={`grid ${gridColumns} gap-2 rounded-md border border-neutral-200 bg-white/55 p-2 shadow-sm sm:gap-3 sm:p-3`}
        aria-label={`${itemCount} tile puzzle grid`}
        aria-describedby="puzzle-feedback"
      >
        {puzzleItems.map((item) => (
          <PuzzleTile
            key={item.id}
            item={item}
            selected={selectedItemIds.has(item.id)}
            disabled={
              gameOver ||
              submitting ||
              (selectedCount >= puzzle.groupSize && !selectedItemIds.has(item.id))
            }
            onToggle={toggleItem}
          />
        ))}
      </div>

      <p
        id="puzzle-feedback"
        className={[
          "rounded-md border px-3 py-2 text-sm font-medium",
          feedback.tone === "correct"
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : feedback.tone === "incorrect"
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-neutral-200 bg-white/70 text-neutral-700",
        ].join(" ")}
        role="status"
        aria-live="polite"
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
          {submitting ? "Checking..." : "Submit group"}
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
            Clear selection
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

      {gameOver ? (
        <PuzzleResult
          completeGroupCount={totalGroupCount}
          hintsUsed={0}
          mistakes={mistakes}
          solved={puzzleSolved}
          solvedGroups={solvedGroups}
        />
      ) : null}
    </section>
  );
}

type GuessFeedback = {
  tone: "idle" | "correct" | "incorrect";
  message: string;
};

type PuzzleResultProps = {
  completeGroupCount: number;
  hintsUsed: number;
  mistakes: number;
  solved: boolean;
  solvedGroups: readonly SolvedGroupDto[];
};

function PuzzleResult({
  completeGroupCount,
  hintsUsed,
  mistakes,
  solved,
  solvedGroups,
}: PuzzleResultProps) {
  return (
    <section
      aria-labelledby="result-title"
      className="space-y-4 rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase text-neutral-500">
          Result
        </p>
        <h2 id="result-title" className="text-2xl font-semibold text-neutral-950">
          {solved ? "Puzzle solved" : "Puzzle failed"}
        </h2>
        <p className="text-sm leading-6 text-neutral-700">
          {solved
            ? "Nice solve. Here is why each group works."
            : `No mistakes remaining. You found ${solvedGroups.length} of ${completeGroupCount} groups.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-neutral-100 px-3 py-2">
          <span className="block text-xs font-semibold uppercase text-neutral-500">
            Mistakes used
          </span>
          <span className="font-semibold text-neutral-950">{mistakes}</span>
        </div>
        <div className="rounded-md bg-neutral-100 px-3 py-2">
          <span className="block text-xs font-semibold uppercase text-neutral-500">
            Hints used
          </span>
          <span className="font-semibold text-neutral-950">{hintsUsed}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-950">
          {solved ? "Group explanations" : "Solved groups"}
        </h3>
        {solvedGroups.map((group) => (
          <article
            key={group.id}
            className="rounded-md border border-neutral-200 bg-white px-3 py-3"
          >
            <h4 className="text-sm font-semibold text-neutral-950">
              {group.label}
            </h4>
            <p className="mt-1 text-sm font-medium text-neutral-700">
              {group.items.map((item) => item.text).join(", ")}
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              {group.explanation}
            </p>
          </article>
        ))}
        {solvedGroups.length < completeGroupCount ? (
          <p className="rounded-md border border-neutral-200 bg-white px-3 py-3 text-sm leading-6 text-neutral-700">
            Full explanations appear after every group has been found.
          </p>
        ) : null}
      </div>
    </section>
  );
}

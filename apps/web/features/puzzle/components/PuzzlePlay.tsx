"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { startDailyPuzzle, type PlayablePuzzle } from "../lib/puzzle-api";
import { PuzzleBoard } from "./PuzzleBoard";

export function PuzzlePlay() {
  const [reloadCount, setReloadCount] = useState(0);
  const [loadState, setLoadState] = useState<PuzzleLoadState>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;

    async function loadPuzzle() {
      setLoadState({ status: "loading" });

      try {
        const puzzle = await startDailyPuzzle();

        if (active) {
          setLoadState({ status: "ready", puzzle });
        }
      } catch (error) {
        if (active) {
          setLoadState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The puzzle could not be loaded.",
          });
        }
      }
    }

    void loadPuzzle();

    return () => {
      active = false;
    };
  }, [reloadCount]);

  if (loadState.status === "loading") {
    return (
      <PuzzlePageShell>
        <section
          className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
          aria-live="polite"
        >
          <p className="text-sm font-semibold uppercase text-neutral-500">
            Loading
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-950">
            Preparing today&apos;s puzzle
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Fetching the latest published Link Grid from the puzzle API.
          </p>
        </section>
      </PuzzlePageShell>
    );
  }

  if (loadState.status === "error") {
    return (
      <PuzzlePageShell>
        <section className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-950">
            Puzzle unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            {loadState.message}
          </p>
          <button
            type="button"
            onClick={() =>
              setReloadCount((currentReloadCount) => currentReloadCount + 1)
            }
            className="mt-4 min-h-11 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          >
            Try again
          </button>
        </section>
      </PuzzlePageShell>
    );
  }

  const puzzle = loadState.puzzle;

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
              {puzzle.theme ?? "Daily"}
            </span>
            <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs font-semibold uppercase text-neutral-700">
              {puzzle.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
            {puzzle.title}
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            Find the hidden groups of {puzzle.groupSize}.
          </p>
        </div>
      </header>

      <PuzzleBoard key={puzzle.playSessionId} puzzle={puzzle} />
    </div>
  );
}

type PuzzleLoadState =
  | {
      status: "loading";
    }
  | {
      status: "ready";
      puzzle: PlayablePuzzle;
    }
  | {
      status: "error";
      message: string;
    };

function PuzzlePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4 py-10">
      <Link
        href="/"
        className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
      >
        Back home
      </Link>
      {children}
    </div>
  );
}

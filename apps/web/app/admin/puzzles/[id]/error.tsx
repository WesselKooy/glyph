"use client";

import Link from "next/link";

export default function AdminPuzzleDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-5 py-5 sm:gap-6 sm:py-6">
      <div className="space-y-2">
        <Link
          href="/admin/puzzles"
          className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
        >
          Back to puzzles
        </Link>
        <p className="text-sm font-semibold uppercase text-neutral-500">
          Admin
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
          Puzzle detail
        </h1>
      </div>

      <section className="rounded-md border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-950">
          Puzzle detail unavailable
        </h2>
        <p className="mt-2 text-sm leading-6 text-rose-900">
          {error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 min-h-11 rounded-md bg-rose-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-900"
        >
          Try again
        </button>
      </section>
    </div>
  );
}

import Link from "next/link";

import { ManualPuzzleForm } from "@/features/admin/components/ManualPuzzleForm";

export default function NewAdminPuzzlePage() {
  return (
    <div className="flex flex-1 flex-col gap-5 py-5 sm:gap-6 sm:py-6">
      <header className="space-y-3">
        <Link
          href="/admin/puzzles"
          className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900"
        >
          Back to puzzles
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase text-neutral-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
            Create puzzle
          </h1>
          <p className="text-sm leading-6 text-neutral-700">
            Manually create a Link Grid puzzle for review.
          </p>
        </div>
      </header>

      <ManualPuzzleForm />
    </div>
  );
}

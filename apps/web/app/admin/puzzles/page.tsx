import Link from "next/link";

import {
  fetchAdminPuzzles,
  type AdminPuzzleListItem,
} from "@/features/admin/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function AdminPuzzlesPage() {
  const { puzzles } = await fetchAdminPuzzles();

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
          <p className="text-sm font-semibold uppercase text-neutral-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
            Puzzles
          </h1>
          <p className="text-sm leading-6 text-neutral-700">
            Internal review queue for Link Grid puzzle candidates.
          </p>
        </div>
      </header>

      {puzzles.length > 0 ? (
        <section className="space-y-2" aria-label="Admin puzzle list">
          {puzzles.map((puzzle) => (
            <PuzzleListRow key={puzzle.id} puzzle={puzzle} />
          ))}
        </section>
      ) : (
        <section className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            No puzzles yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Created puzzles will appear here for review.
          </p>
        </section>
      )}
    </div>
  );
}

function PuzzleListRow({ puzzle }: { puzzle: AdminPuzzleListItem }) {
  return (
    <Link
      href={`/admin/puzzles/${puzzle.id}`}
      className="block rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm transition hover:border-emerald-700 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
    >
      <article className="space-y-3">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs font-semibold uppercase text-neutral-700">
              {formatStatus(puzzle.status)}
            </span>
            <span className="rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase text-emerald-900">
              {formatDifficulty(puzzle.difficulty)}
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-snug text-neutral-950">
            {puzzle.title}
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            {puzzle.theme ?? "No theme"}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-neutral-100 px-3 py-2">
            <dt className="text-xs font-semibold uppercase text-neutral-500">
              Quality score
            </dt>
            <dd className="font-semibold text-neutral-950">
              {formatQualityScore(puzzle.qualityScore)}
            </dd>
          </div>
          <div className="rounded-md bg-neutral-100 px-3 py-2">
            <dt className="text-xs font-semibold uppercase text-neutral-500">
              Created
            </dt>
            <dd className="font-semibold text-neutral-950">
              {formatDate(puzzle.createdAt)}
            </dd>
          </div>
        </dl>
      </article>
    </Link>
  );
}

function formatDifficulty(difficulty: string): string {
  return formatEnumLabel(difficulty);
}

function formatStatus(status: string): string {
  return formatEnumLabel(status);
}

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatQualityScore(qualityScore: number | null): string {
  return qualityScore === null ? "N/A" : qualityScore.toFixed(1);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

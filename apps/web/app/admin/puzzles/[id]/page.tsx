import Link from "next/link";

import {
  fetchAdminPuzzle,
  type AdminPuzzleDetail,
  type AdminPuzzleDetailGroup,
  type AdminPuzzleRatingSummary,
} from "@/features/admin/lib/admin-api";

export const dynamic = "force-dynamic";

type AdminPuzzleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminPuzzleDetailPage({
  params,
}: AdminPuzzleDetailPageProps) {
  const { id } = await params;
  const puzzle = await fetchAdminPuzzle(id);

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
          <div className="flex flex-wrap gap-2">
            <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs font-semibold uppercase text-neutral-700">
              {formatEnumLabel(puzzle.status)}
            </span>
            <span className="rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase text-emerald-900">
              {formatEnumLabel(puzzle.difficulty)}
            </span>
            <span className="rounded-sm bg-sky-100 px-2 py-1 text-xs font-semibold uppercase text-sky-900">
              {formatEnumLabel(puzzle.source)}
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-neutral-950">
            {puzzle.title}
          </h1>
          <p className="text-sm leading-6 text-neutral-700">
            {puzzle.theme ?? "No theme"}
          </p>
        </div>
        <Link
          href="/play"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          Play preview
        </Link>
      </header>

      <PuzzleMetadata puzzle={puzzle} />
      <PuzzleGroups groups={puzzle.groups} />
      <ValidationRuns />
      <RatingsSummary ratings={puzzle.ratings} />
    </div>
  );
}

function PuzzleMetadata({ puzzle }: { puzzle: AdminPuzzleDetail }) {
  return (
    <section
      aria-labelledby="metadata-title"
      className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
    >
      <h2 id="metadata-title" className="text-lg font-semibold text-neutral-950">
        Review metadata
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <MetadataItem label="Groups" value={String(puzzle.groups.length)} />
        <MetadataItem label="Group size" value={String(puzzle.groupSize)} />
        <MetadataItem label="Mistake limit" value={String(puzzle.mistakeLimit)} />
        <MetadataItem
          label="Quality score"
          value={formatQualityScore(puzzle.qualityScore)}
        />
        <MetadataItem label="Created" value={formatDate(puzzle.createdAt)} />
        <MetadataItem
          label="Published"
          value={puzzle.publishedAt ? formatDate(puzzle.publishedAt) : "Not published"}
        />
      </dl>
    </section>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-neutral-100 px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </dt>
      <dd className="font-semibold text-neutral-950">{value}</dd>
    </div>
  );
}

function PuzzleGroups({ groups }: { groups: AdminPuzzleDetailGroup[] }) {
  return (
    <section aria-labelledby="groups-title" className="space-y-3">
      <h2 id="groups-title" className="text-lg font-semibold text-neutral-950">
        Groups
      </h2>
      {groups.map((group) => (
        <article
          key={group.id}
          className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-500">
                Group {group.sortOrder + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-neutral-950">
                {group.label}
              </h3>
            </div>
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.items.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-center text-sm font-semibold text-neutral-800"
              >
                {item.text}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
            <div>
              <h4 className="text-xs font-semibold uppercase text-neutral-500">
                Explanation
              </h4>
              <p className="mt-1">{group.explanation}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <HintBlock label="Gentle hint" value={group.gentleHint} />
              <HintBlock label="Strong hint" value={group.strongHint} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function HintBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-md bg-neutral-100 px-3 py-2">
      <h4 className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </h4>
      <p className="mt-1 text-sm leading-6 text-neutral-700">
        {value ?? "No hint provided"}
      </p>
    </div>
  );
}

function ValidationRuns() {
  return (
    <section
      aria-labelledby="validation-title"
      className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
    >
      <h2 id="validation-title" className="text-lg font-semibold text-neutral-950">
        Validation runs
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-700">
        Validation pipeline is not configured yet. Runs will appear here once
        deterministic checks are added.
      </p>
    </section>
  );
}

function RatingsSummary({ ratings }: { ratings: AdminPuzzleRatingSummary }) {
  return (
    <section
      aria-labelledby="ratings-title"
      className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
    >
      <div className="space-y-1">
        <h2 id="ratings-title" className="text-lg font-semibold text-neutral-950">
          Ratings
        </h2>
        <p className="text-sm leading-6 text-neutral-700">
          {ratings.total === 0
            ? "No player ratings have been recorded yet."
            : `${ratings.total} player rating${ratings.total === 1 ? "" : "s"} recorded.`}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <MetadataItem label="Fair" value={String(ratings.fairness.fair)} />
        <MetadataItem
          label="Ambiguous"
          value={String(ratings.fairness.ambiguous)}
        />
        <MetadataItem label="Wrong" value={String(ratings.fairness.wrong)} />
        <MetadataItem
          label="Too easy"
          value={String(ratings.difficulty.tooEasy)}
        />
        <MetadataItem label="Right" value={String(ratings.difficulty.right)} />
        <MetadataItem
          label="Too hard"
          value={String(ratings.difficulty.tooHard)}
        />
      </dl>

      {ratings.recent.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-neutral-950">
            Recent ratings
          </h3>
          {ratings.recent.map((rating) => (
            <article
              key={rating.id}
              className="rounded-md border border-neutral-200 bg-white px-3 py-3"
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs font-semibold uppercase text-neutral-700">
                  {formatEnumLabel(rating.fairness)}
                </span>
                <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs font-semibold uppercase text-neutral-700">
                  {formatEnumLabel(rating.difficulty)}
                </span>
                <span className="text-xs font-medium text-neutral-500">
                  {formatDate(rating.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {rating.comment ?? "No comment"}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
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

import type { LinkGridRenderableItem } from "../lib/link-grid";

type PuzzleTileProps = {
  item: LinkGridRenderableItem;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: (itemId: string) => void;
};

export function PuzzleTile({
  item,
  selected = false,
  disabled = false,
  onToggle,
}: PuzzleTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle?.(item.id)}
      className={[
        "flex min-h-20 w-full items-center justify-center rounded-md border px-2 py-3 text-center text-sm font-semibold leading-tight shadow-sm transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
        "sm:min-h-24 sm:px-3 sm:text-base",
        selected
          ? "border-emerald-900 bg-emerald-800 text-white shadow-md"
          : "border-neutral-200 bg-white/90 text-neutral-900 hover:border-emerald-700 hover:bg-emerald-50 active:bg-emerald-100",
        disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer",
      ].join(" ")}
    >
      <span className="max-w-full overflow-hidden text-ellipsis break-words">
        {item.text}
      </span>
    </button>
  );
}

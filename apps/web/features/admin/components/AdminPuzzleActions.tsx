"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  approveAdminPuzzle,
  publishAdminPuzzle,
  rejectAdminPuzzle,
} from "../lib/admin-api";

type AdminPuzzleAction = "approve" | "reject" | "publish";

type ActionState =
  | {
      status: "idle";
    }
  | {
      status: "submitting";
      action: AdminPuzzleAction;
    }
  | {
      status: "error";
      message: string;
    };

type AdminPuzzleActionsProps = {
  puzzleId: string;
  status: string;
};

export function AdminPuzzleActions({
  puzzleId,
  status,
}: AdminPuzzleActionsProps) {
  const router = useRouter();
  const [actionState, setActionState] = useState<ActionState>({
    status: "idle",
  });
  const actions = getAvailableActions(status);

  async function runAction(action: AdminPuzzleAction) {
    if (actionState.status === "submitting") {
      return;
    }

    setActionState({ status: "submitting", action });

    try {
      await actionByName[action](puzzleId);
      setActionState({ status: "idle" });
      router.refresh();
    } catch (error) {
      setActionState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The puzzle status could not be updated.",
      });
    }
  }

  return (
    <section
      aria-labelledby="actions-title"
      className="rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="actions-title" className="text-lg font-semibold text-neutral-950">
            Review actions
          </h2>
          <p className="mt-1 text-sm leading-6 text-neutral-700">
            Current status: {formatEnumLabel(status)}
          </p>
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={action}
                type="button"
                disabled={actionState.status === "submitting"}
                onClick={() => void runAction(action)}
                className={getActionButtonClassName(action, actionState)}
              >
                {getActionLabel(action, actionState)}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-neutral-500">
            No status actions are available.
          </p>
        )}
      </div>

      {actionState.status === "error" ? (
        <p
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-950"
          role="status"
        >
          {actionState.message}
        </p>
      ) : null}
    </section>
  );
}

const actionByName = {
  approve: approveAdminPuzzle,
  reject: rejectAdminPuzzle,
  publish: publishAdminPuzzle,
} satisfies Record<AdminPuzzleAction, (puzzleId: string) => Promise<unknown>>;

function getAvailableActions(status: string): AdminPuzzleAction[] {
  switch (status) {
    case "draft":
    case "ready_for_review":
      return ["approve", "reject"];
    case "approved":
      return ["publish", "reject"];
    case "rejected":
      return ["approve"];
    case "published":
      return ["reject"];
    default:
      return [];
  }
}

function getActionLabel(
  action: AdminPuzzleAction,
  actionState: ActionState,
): string {
  if (actionState.status === "submitting" && actionState.action === action) {
    return `${formatEnumLabel(action)}...`;
  }

  return formatEnumLabel(action);
}

function getActionButtonClassName(
  action: AdminPuzzleAction,
  actionState: ActionState,
): string {
  const disabled = actionState.status === "submitting";
  const baseClassName =
    "min-h-11 rounded-md px-4 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  if (disabled) {
    return `${baseClassName} cursor-not-allowed bg-neutral-200 text-neutral-500 focus-visible:outline-neutral-500`;
  }

  if (action === "reject") {
    return `${baseClassName} bg-white text-rose-800 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 focus-visible:outline-rose-700`;
  }

  if (action === "publish") {
    return `${baseClassName} bg-emerald-800 text-white hover:bg-emerald-700 focus-visible:outline-emerald-800`;
  }

  return `${baseClassName} bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:outline-neutral-900`;
}

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

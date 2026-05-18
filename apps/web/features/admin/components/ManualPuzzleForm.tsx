"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createAdminPuzzle,
  type CreateAdminPuzzleInput,
} from "../lib/admin-api";

type Difficulty = CreateAdminPuzzleInput["difficulty"];

type ManualPuzzleFormState = {
  title: string;
  theme: string;
  difficulty: Difficulty;
  groupCount: 3 | 4;
  mistakeLimit: number;
  groups: ManualPuzzleGroupState[];
};

type ManualPuzzleGroupState = {
  label: string;
  explanation: string;
  gentleHint: string;
  strongHint: string;
  items: string[];
};

type SubmitState =
  | {
      status: "idle";
    }
  | {
      status: "submitting";
    }
  | {
      status: "error";
      message: string;
    };

const groupSize = 4;
const difficulties = ["easy", "medium", "hard", "evil"] as const;

export function ManualPuzzleForm() {
  const router = useRouter();
  const [form, setForm] = useState<ManualPuzzleFormState>(() =>
    createInitialForm(3),
  );
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const submitting = submitState.status === "submitting";

  function updateField<Key extends keyof ManualPuzzleFormState>(
    key: Key,
    value: ManualPuzzleFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function updateGroup(
    groupIndex: number,
    patch: Partial<ManualPuzzleGroupState>,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      groups: currentForm.groups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              ...patch,
            }
          : group,
      ),
    }));
  }

  function updateItem(groupIndex: number, itemIndex: number, text: string) {
    setForm((currentForm) => ({
      ...currentForm,
      groups: currentForm.groups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              items: group.items.map((item, currentItemIndex) =>
                currentItemIndex === itemIndex ? text : item,
              ),
            }
          : group,
      ),
    }));
  }

  function changeGroupCount(groupCount: 3 | 4) {
    setForm((currentForm) => ({
      ...currentForm,
      groupCount,
      groups: resizeGroups(currentForm.groups, groupCount),
    }));
  }

  async function submitPuzzle() {
    if (submitting) {
      return;
    }

    const validationError = validateForm(form);

    if (validationError) {
      setSubmitState({
        status: "error",
        message: validationError,
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const createdPuzzle = await createAdminPuzzle(toCreatePuzzleInput(form));
      router.push(`/admin/puzzles/${createdPuzzle.id}`);
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The puzzle could not be created.",
      });
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submitPuzzle();
      }}
    >
      <section className="space-y-4 rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-950">
          Puzzle details
        </h2>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Title
          </span>
          <TextInput
            value={form.title}
            disabled={submitting}
            onChange={(value) => updateField("title", value)}
            placeholder="Kitchen Shelf"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Theme
          </span>
          <TextInput
            value={form.theme}
            disabled={submitting}
            onChange={(value) => updateField("theme", value)}
            placeholder="Everyday food"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase text-neutral-500">
              Difficulty
            </span>
            <select
              value={form.difficulty}
              disabled={submitting}
              onChange={(event) =>
                updateField("difficulty", event.target.value as Difficulty)
              }
              className={fieldClassName}
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {formatEnumLabel(difficulty)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase text-neutral-500">
              Format
            </span>
            <select
              value={String(form.groupCount)}
              disabled={submitting}
              onChange={(event) =>
                changeGroupCount(Number(event.target.value) === 4 ? 4 : 3)
              }
              className={fieldClassName}
            >
              <option value="3">3 groups of 4</option>
              <option value="4">4 groups of 4</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase text-neutral-500">
              Mistake limit
            </span>
            <input
              type="number"
              min={1}
              max={10}
              value={form.mistakeLimit}
              disabled={submitting}
              onChange={(event) =>
                updateField("mistakeLimit", Number(event.target.value))
              }
              className={fieldClassName}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="groups-title">
        <h2 id="groups-title" className="text-lg font-semibold text-neutral-950">
          Groups
        </h2>
        {form.groups.map((group, groupIndex) => (
          <article
            key={groupIndex}
            className="space-y-4 rounded-md border border-neutral-200 bg-white/85 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-950">
                Group {groupIndex + 1}
              </h3>
              <span className="text-xs font-semibold uppercase text-neutral-500">
                {groupSize} items
              </span>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Label
              </span>
              <TextInput
                value={group.label}
                disabled={submitting}
                onChange={(value) => updateGroup(groupIndex, { label: value })}
                placeholder="Leafy herbs"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Items
              </span>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item, itemIndex) => (
                  <TextInput
                    key={itemIndex}
                    value={item}
                    disabled={submitting}
                    onChange={(value) =>
                      updateItem(groupIndex, itemIndex, value)
                    }
                    placeholder={`Item ${itemIndex + 1}`}
                  />
                ))}
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase text-neutral-500">
                Explanation
              </span>
              <textarea
                value={group.explanation}
                disabled={submitting}
                onChange={(event) =>
                  updateGroup(groupIndex, {
                    explanation: event.target.value,
                  })
                }
                rows={3}
                placeholder="Explain why these four items belong together."
                className={fieldClassName}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Gentle hint
                </span>
                <TextInput
                  value={group.gentleHint}
                  disabled={submitting}
                  onChange={(value) =>
                    updateGroup(groupIndex, { gentleHint: value })
                  }
                  placeholder="A light nudge"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase text-neutral-500">
                  Strong hint
                </span>
                <TextInput
                  value={group.strongHint}
                  disabled={submitting}
                  onChange={(value) =>
                    updateGroup(groupIndex, { strongHint: value })
                  }
                  placeholder="A clearer hint"
                />
              </label>
            </div>
          </article>
        ))}
      </section>

      {submitState.status === "error" ? (
        <p
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-950"
          role="status"
        >
          {submitState.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={[
          "min-h-12 w-full rounded-md px-4 text-sm font-semibold shadow-sm transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
          submitting
            ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
            : "bg-emerald-800 text-white hover:bg-emerald-700",
        ].join(" ")}
      >
        {submitting ? "Creating puzzle..." : "Create puzzle"}
      </button>
    </form>
  );
}

function TextInput({
  value,
  disabled,
  onChange,
  placeholder,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={fieldClassName}
    />
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition placeholder:text-neutral-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500";

function createInitialForm(groupCount: 3 | 4): ManualPuzzleFormState {
  return {
    title: "",
    theme: "",
    difficulty: "easy",
    groupCount,
    mistakeLimit: 4,
    groups: createEmptyGroups(groupCount),
  };
}

function createEmptyGroups(groupCount: 3 | 4): ManualPuzzleGroupState[] {
  return Array.from({ length: groupCount }, () => createEmptyGroup());
}

function createEmptyGroup(): ManualPuzzleGroupState {
  return {
    label: "",
    explanation: "",
    gentleHint: "",
    strongHint: "",
    items: Array.from({ length: groupSize }, () => ""),
  };
}

function resizeGroups(
  groups: ManualPuzzleGroupState[],
  groupCount: 3 | 4,
): ManualPuzzleGroupState[] {
  if (groups.length === groupCount) {
    return groups;
  }

  if (groups.length > groupCount) {
    return groups.slice(0, groupCount);
  }

  return [
    ...groups,
    ...Array.from({ length: groupCount - groups.length }, () =>
      createEmptyGroup(),
    ),
  ];
}

function validateForm(form: ManualPuzzleFormState): string | null {
  if (form.title.trim().length === 0) {
    return "Title is required.";
  }

  if (form.groupCount !== 3 && form.groupCount !== 4) {
    return "Choose either 3 or 4 groups.";
  }

  if (!Number.isInteger(form.mistakeLimit) || form.mistakeLimit < 1) {
    return "Mistake limit must be at least 1.";
  }

  if (form.mistakeLimit > 10) {
    return "Mistake limit must be 10 or less.";
  }

  const itemTexts = new Set<string>();

  for (const [groupIndex, group] of form.groups.entries()) {
    if (group.label.trim().length === 0) {
      return `Group ${groupIndex + 1} needs a label.`;
    }

    if (group.explanation.trim().length === 0) {
      return `Group ${groupIndex + 1} needs an explanation.`;
    }

    if (group.items.length !== groupSize) {
      return `Group ${groupIndex + 1} must have exactly ${groupSize} items.`;
    }

    for (const [itemIndex, item] of group.items.entries()) {
      const text = item.trim();

      if (text.length === 0) {
        return `Group ${groupIndex + 1}, item ${itemIndex + 1} is required.`;
      }

      const normalizedText = text.toLocaleLowerCase();

      if (itemTexts.has(normalizedText)) {
        return `Item text must be unique: ${text}.`;
      }

      itemTexts.add(normalizedText);
    }
  }

  return null;
}

function toCreatePuzzleInput(
  form: ManualPuzzleFormState,
): CreateAdminPuzzleInput {
  return {
    title: form.title.trim(),
    theme: form.theme.trim(),
    difficulty: form.difficulty,
    groupSize,
    mistakeLimit: form.mistakeLimit,
    groups: form.groups.map((group) => ({
      label: group.label.trim(),
      explanation: group.explanation.trim(),
      gentleHint: group.gentleHint.trim(),
      strongHint: group.strongHint.trim(),
      items: group.items.map((item) => ({
        text: item.trim(),
      })),
    })),
  };
}

function formatEnumLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

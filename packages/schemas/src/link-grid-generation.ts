import { z } from "zod";

const GROUP_SIZE = 4;
const MIN_GROUP_COUNT = 3;
const MAX_GROUP_COUNT = 4;

const nonEmptyString = (fieldName: string, maxLength: number) =>
  z
    .string({
      required_error: `${fieldName} is required.`,
      invalid_type_error: `${fieldName} must be a string.`,
    })
    .trim()
    .min(1, `${fieldName} cannot be empty.`)
    .max(maxLength, `${fieldName} must be ${maxLength} characters or less.`);

const optionalText = (fieldName: string, maxLength: number) =>
  z
    .string({
      invalid_type_error: `${fieldName} must be a string.`,
    })
    .trim()
    .max(maxLength, `${fieldName} must be ${maxLength} characters or less.`)
    .optional();

export const PuzzleCandidateDifficultySchema = z.enum([
  "easy",
  "medium",
  "hard",
  "evil",
]);

export const PuzzleItemCandidateSchema = z.object({
  text: nonEmptyString("item text", 32),
});

export const PuzzleGroupCandidateSchema = z.object({
  label: nonEmptyString("group label", 48),
  explanation: nonEmptyString("group explanation", 240),
  gentleHint: optionalText("gentle hint", 120),
  strongHint: optionalText("strong hint", 120),
  items: z
    .array(PuzzleItemCandidateSchema)
    .length(GROUP_SIZE, `groups must contain exactly ${GROUP_SIZE} items.`),
});

export const ValidationIssueSeveritySchema = z.enum(["info", "warning", "error"]);

export const ValidationIssueSchema = z.object({
  code: nonEmptyString("validation issue code", 80),
  severity: ValidationIssueSeveritySchema,
  message: nonEmptyString("validation issue message", 240),
  path: z.array(z.union([z.string(), z.number()])).default([]),
});

export const LinkGridPuzzleCandidateSchema = z
  .object({
    title: nonEmptyString("title", 80),
    topic: nonEmptyString("topic", 80),
    difficulty: PuzzleCandidateDifficultySchema,
    groups: z
      .array(PuzzleGroupCandidateSchema)
      .min(MIN_GROUP_COUNT, "candidate must contain either 3 or 4 groups.")
      .max(MAX_GROUP_COUNT, "candidate must contain either 3 or 4 groups."),
  })
  .superRefine((candidate, context) => {
    addDuplicateGroupLabelIssues(candidate.groups, context);
    addDuplicateItemTextIssues(candidate.groups, context);
  });

export type PuzzleCandidateDifficulty = z.infer<
  typeof PuzzleCandidateDifficultySchema
>;
export type PuzzleItemCandidate = z.infer<typeof PuzzleItemCandidateSchema>;
export type PuzzleGroupCandidate = z.infer<typeof PuzzleGroupCandidateSchema>;
export type ValidationIssueSeverity = z.infer<
  typeof ValidationIssueSeveritySchema
>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type LinkGridPuzzleCandidate = z.infer<
  typeof LinkGridPuzzleCandidateSchema
>;

function addDuplicateGroupLabelIssues(
  groups: PuzzleGroupCandidate[],
  context: z.RefinementCtx,
): void {
  const seenLabels = new Map<string, number>();

  for (const [groupIndex, group] of groups.entries()) {
    const labelKey = normalizeComparisonText(group.label);
    const firstGroupIndex = seenLabels.get(labelKey);

    if (firstGroupIndex !== undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `group label duplicates groups[${firstGroupIndex}].label.`,
        path: ["groups", groupIndex, "label"],
      });
      continue;
    }

    seenLabels.set(labelKey, groupIndex);
  }
}

function addDuplicateItemTextIssues(
  groups: PuzzleGroupCandidate[],
  context: z.RefinementCtx,
): void {
  const seenItems = new Map<string, { groupIndex: number; itemIndex: number }>();

  for (const [groupIndex, group] of groups.entries()) {
    for (const [itemIndex, item] of group.items.entries()) {
      const itemKey = normalizeComparisonText(item.text);
      const firstItem = seenItems.get(itemKey);

      if (firstItem) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `item text duplicates groups[${firstItem.groupIndex}].items[${firstItem.itemIndex}].text.`,
          path: ["groups", groupIndex, "items", itemIndex, "text"],
        });
        continue;
      }

      seenItems.set(itemKey, { groupIndex, itemIndex });
    }
  }
}

function normalizeComparisonText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

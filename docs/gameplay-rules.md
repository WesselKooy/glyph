# Gameplay Rules

## Game mode: Link Grid

Link Grid is a hidden-category puzzle.

The player sees a shuffled set of tiles. Each tile belongs to exactly one hidden group. The player must identify all hidden groups by selecting the correct items.

## Supported puzzle sizes

Early MVP supports:

```txt
12 tiles = 3 groups of 4
16 tiles = 4 groups of 4
```

Future formats may include:

```txt
15 tiles = 5 groups of 3
20 tiles = 5 groups of 4
```

Do not implement future formats until the core 12-tile and 16-tile formats work well.

## Puzzle structure

A puzzle has:

- `id`
- `title`
- `theme`
- `difficulty`
- `status`
- `groups`

Each group has:

- `id`
- `label`
- `items`
- `explanation`
- `gentleHint`
- `strongHint`

Each item has:

- `id`
- `text`
- `groupId`

Example:

```json
{
  "title": "Italian Food Links",
  "theme": "Food",
  "difficulty": "medium",
  "groups": [
    {
      "label": "Roman pasta dishes",
      "items": ["Carbonara", "Amatriciana", "Gricia", "Cacio e Pepe"],
      "explanation": "These are classic pasta dishes associated with Rome and Lazio.",
      "gentleHint": "Think regionally.",
      "strongHint": "These are strongly associated with Rome."
    }
  ]
}
```

## Game setup

When a user starts a puzzle:

1. Backend creates a `PlaySession`.
2. Puzzle items are returned in shuffled order.
3. No solved groups are revealed yet.
4. Mistake count starts at 0.
5. Hint count starts at 0.
6. Session state is persisted.

## Selection rules

The player may select and deselect tiles.

Rules:
- A selected tile can be deselected.
- A solved tile cannot be selected again.
- The maximum number of selected tiles equals the puzzle group size.
- Submit is enabled only when exactly `groupSize` unsolved tiles are selected.

For MVP:
- group size is 4.

## Guess validation

When the player submits a guess:

1. Frontend sends selected item IDs to backend.
2. Backend validates:
   - play session exists
   - puzzle exists
   - session belongs to that puzzle
   - session is not already completed
   - selected item IDs are unique
   - selected item IDs belong to the puzzle
   - selected items are not already solved
   - selected item count equals group size
3. Backend checks whether selected items exactly match one unsolved group.
4. Backend stores the guess.
5. Backend returns result.

## Correct guess

A guess is correct if the selected item IDs exactly match all items in one unsolved group.

Order does not matter.

Response should include:

```json
{
  "correct": true,
  "group": {
    "id": "group-id",
    "label": "Roman pasta dishes",
    "items": ["Carbonara", "Amatriciana", "Gricia", "Cacio e Pepe"],
    "explanation": "These are classic pasta dishes associated with Rome and Lazio."
  },
  "mistakes": 1,
  "mistakesRemaining": 3,
  "solved": false
}
```

Frontend behavior:
- reveal the solved group
- clear current selection
- remove or lock solved tiles
- show satisfying feedback
- continue unless all groups are solved

## Incorrect guess

A guess is incorrect if the selected item IDs do not exactly match an unsolved group.

Response should include:

```json
{
  "correct": false,
  "mistakes": 2,
  "mistakesRemaining": 2,
  "solved": false,
  "message": "Not quite."
}
```

Frontend behavior:
- show brief wrong-guess feedback
- clear current selection or let the user adjust it
- increment visible mistake count

## One-away behavior

Optional but recommended.

If a submitted guess contains all but one item from a correct group, backend may return:

```json
{
  "correct": false,
  "nearMiss": true,
  "message": "One away."
}
```

Rules:
- Do not reveal which tile is wrong.
- Do not overuse extra hints.
- Store the guess normally.

## Mistake limit

For MVP:

```txt
mistakeLimit = 4
```

The game ends when:

```txt
mistakes >= mistakeLimit
```

If the player loses:
- reveal all groups
- show explanations
- still allow rating
- do not count as solved

## Completion

The puzzle is solved when all groups are found before the mistake limit is reached.

On completion:
- set `PlaySession.solved = true`
- set `PlaySession.completedAt`
- show result screen
- show all explanations
- ask for rating

## Hints

Hints are attached to groups.

Each group may have:
- gentle hint
- strong hint

MVP hint behavior may be simple:
- Hint button gives a general hint for one unsolved group.
- Using a hint increments `hintsUsed`.
- Hints should not directly reveal the answer unless the player requests a stronger hint.

Do not build complex hint logic before the basic game works.

## Result screen

Result screen should show:

- solved or failed
- time elapsed
- mistakes used
- hints used
- group labels
- group items
- explanations
- fairness rating controls
- share result button

Spoiler-free share format example:

```txt
Daily Link #42
Solved in 3:12
Mistakes: 1
Hints: 0

🟩🟩🟩🟩
🟦🟦🟦🟦
🟨🟨🟨🟨
🟪🟪🟪🟪
```

## Puzzle rating

After completion or failure, user can rate:

Fairness:
- fair
- ambiguous
- wrong

Difficulty:
- too_easy
- right
- too_hard

Optional comment:
- free text

Ratings are important product data and should be persisted.

## Admin review rules

Admin users should be able to:
- preview puzzle as player
- inspect groups and explanations
- inspect validation runs
- approve puzzle
- reject puzzle
- publish puzzle
- edit manually created or generated candidates

Public daily puzzles should be approved before publication.

## Puzzle quality rules

A good Link Grid puzzle should have:
- one intended solution
- clear categories
- satisfying explanations
- no accidental alternate groupings
- no duplicate items
- no overly broad groups
- no unfair obscure trivia for the selected difficulty
- a mix of accessible and interesting associations
- item text short enough for mobile tiles

## Bad puzzle examples

### Too obvious

```txt
Apple, Banana, Pear, Mango
Carrot, Broccoli, Spinach, Lettuce
Dog, Cat, Horse, Cow
Red, Blue, Green, Yellow
```

This is too generic and likely boring.

### Too ambiguous

```txt
Tomato, Cucumber, Pepper, Avocado
Apple, Orange, Banana, Peach
Carrot, Lettuce, Spinach, Broccoli
Strawberry, Blueberry, Raspberry, Blackberry
```

This risks botanical fruit/vegetable ambiguity.

### Too obscure

```txt
Four barely known regional 1970s experimental records
```

This may be acceptable only for a niche hard puzzle explicitly requested by a user.

## Difficulty dimensions

Difficulty is controlled by:

- obviousness of category
- obscurity of items
- similarity between groups
- number of decoys
- amount of domain knowledge required
- whether wordplay is involved
- whether category is concrete or lateral
- hint availability
- group count

Examples:

Easy:
- Apple, Banana, Pear, Mango → Fruits

Medium:
- Carbonara, Amatriciana, Gricia, Cacio e Pepe → Roman pasta dishes

Hard:
- Autechre, Boards of Canada, Plaid, Squarepusher → Warp Records/electronic-adjacent artists, depending on exact category

Evil:
- acceptable only if still fair, not merely ambiguous

## Core rule

Tricky is good.

Ambiguous is bad.

A player should be able to say:

> “I see it now. That was fair.”

They should not feel:

> “I guess your answer works, but mine was also valid.”

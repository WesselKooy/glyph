# MVP Scope

## One-line product

A mobile-friendly web/PWA puzzle app where users solve hidden-link/category puzzles and rate whether each puzzle felt fair.

## Product positioning

The MVP is not “infinite AI puzzles.”

The MVP is:

> A quality-controlled hidden-link puzzle app where AI can later generate candidate puzzles, validators attack those candidates, and only good puzzles are published.

The first goal is to prove the core puzzle loop:
- Can a player understand the game quickly?
- Is it satisfying to solve?
- Does the player want another puzzle?
- Do explanations make the app feel clever and premium?
- Can we collect useful feedback about puzzle fairness?

## Core game mode: Link Grid

The first supported game mode is **Link Grid**.

A player sees a shuffled grid of items and must find hidden groups.

Supported MVP formats:
- 12-tile beginner puzzle: 3 groups of 4
- 16-tile standard puzzle: 4 groups of 4

Example:

```txt
Basil, Sage, Thyme, Rosemary
Mercury, Venus, Mars, Jupiter
Ruby, Emerald, Sapphire, Opal
Carbonara, Amatriciana, Gricia, Cacio e Pepe
```

Solutions:
- Herbs
- Planets
- Gemstones
- Roman pasta dishes

## MVP user experience

A user should be able to:

1. Open the app.
2. Play today’s puzzle.
3. Select tiles.
4. Submit guesses.
5. See correct groups revealed.
6. Use hints if needed.
7. Finish the puzzle.
8. Read explanations.
9. Rate the puzzle as fair, too easy, too hard, ambiguous, or wrong.
10. Share a spoiler-free result.

## MVP features

### Must have

- Link Grid puzzle screen
- Responsive mobile-first tile grid
- Tile selection/deselection
- Submit guess
- Correct group reveal
- Wrong guess feedback
- Mistake counter
- Shuffle button
- Completion/result screen
- Group explanations
- Puzzle fairness rating
- Manual seed puzzles
- Database-backed puzzles
- Anonymous play sessions
- Backend guess validation
- Basic admin puzzle list
- Admin puzzle detail page
- Admin approve/reject/publish status
- Manual puzzle creation form
- AI candidate generation after core gameplay works
- Deterministic puzzle validation
- Validation results visible in admin

### Should have

- 12-tile onboarding puzzles
- 16-tile standard puzzles
- Hints per group
- Puzzle difficulty labels
- Basic puzzle analytics:
  - completion rate
  - average mistakes
  - hint usage
  - fairness ratings
  - ambiguous/wrong reports
- Generation job status screen
- AI ambiguity critic
- AI solver simulation
- Quality score for generated puzzles

### Could have later

- Personalized puzzle generation by topic
- Custom puzzle gifts
- User accounts
- Streaks
- Saved puzzle history
- Paid puzzle packs
- Community packs
- Public creator profiles
- More game modes:
  - Odd One Out
  - Guess the Link
  - Hidden Rule
  - Mini lateral mysteries

## Explicitly out of scope for the first MVP

Do not build these in the first version:

- Native iOS app
- Native Android app
- Payments
- Subscriptions
- Full personalization engine
- User profiles
- Public community marketplace
- Multiplayer
- Crosswords
- Wordle-like games
- Full lateral mystery engine
- Social feed
- Comments
- Push notifications
- Advanced recommendation system
- Fine-tuned model
- Complex vector search
- Complex moderation console
- Enterprise admin features

## MVP success criteria

The MVP is successful if:

- A new player can understand the game without explanation.
- At least a few test users complete a puzzle and ask for another.
- The play screen feels good on mobile.
- The backend reliably validates guesses.
- Puzzle ratings reveal whether puzzles are fair or ambiguous.
- Admin review can publish a daily puzzle without manual database edits.
- AI-generated candidates can be created, reviewed, and either approved or rejected.

## First development milestone

Before building backend or AI features, create a hardcoded playable prototype.

Success criterion:

> Someone can play a complete Link Grid puzzle on their phone and say, “That was fun. Give me another one.”

## Second development milestone

Make the prototype database-backed.

Success criterion:

> A puzzle loads from the API, a play session is created, guesses are validated by the backend, and the result is persisted.

## Third development milestone

Add admin review.

Success criterion:

> A puzzle can be created, previewed, approved, rejected, and published from the admin interface.

## Fourth development milestone

Add AI candidate generation.

Success criterion:

> An admin can request a puzzle about a topic, receive a structured AI-generated candidate, inspect it, and approve/reject it.

## Fifth development milestone

Add validation pipeline.

Success criterion:

> The system catches obvious bad puzzles before they reach admin review.

## Product philosophy

The app should optimize for:
- fairness
- satisfying “aha” moments
- concise explanations
- mobile polish
- replayability
- trustworthy quality control

The app should avoid:
- dumping raw AI output onto users
- broad unfocused puzzle types
- obscure trivia without payoff
- unfair ambiguity
- overbuilt infrastructure before the core loop is fun

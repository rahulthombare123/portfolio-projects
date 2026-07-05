# IronLog — Gym Workout Tracker

A gym workout tracker built with plain **HTML, CSS and JavaScript**.
Full CRUD (Create, Read, Update, Delete) on your workout log, saved in the
browser with `localStorage` — no backend, no framework, no build step.

Live demo: open `index.html` in any browser.

---

## Features

- **Create** — log a new set: exercise, category, sets, reps, weight, date, notes
- **Read** — see all entries as a log book, filter by category, live stats bar
  (total entries, total kg lifted, entries this week)
- **Update** — click the pencil icon to edit any entry in the same form
- **Delete** — click the × icon to remove an entry (with a confirm step)
- Fully responsive (form stacks under the log on mobile)
- Data persists after refresh/closing the tab (`localStorage`)

## Tech

| Layer | What / Why |
|---|---|
| HTML | Semantic structure (`<header>`, `<main>`, `<form>`, `<article>`) |
| CSS  | Custom design system, no framework — see "Design decisions" below |
| JS   | Vanilla JS, no libraries — array methods + `localStorage` |
| Fonts | Anton (headings), Work Sans (body), IBM Plex Mono (numbers) via Google Fonts |

## File structure

```
ironlog/
├── index.html   → structure only (the "skeleton")
├── style.css    → all visual design (the "skin")
├── script.js    → all behaviour / CRUD logic (the "brain")
└── README.md    → this file
```

Keeping HTML/CSS/JS in three separate files (instead of one messy file) is a
basic best practice — it's the first thing an interviewer's eye will check.

---

## How the CRUD actually works (for you to explain)

The whole app is built around **one JavaScript array** called `workouts`.
Think of it as an in-memory "database":

```js
let workouts = [
  { id: "...", exercise: "Bench Press", category: "Chest",
    sets: 3, reps: 10, weight: 60, date: "2026-07-01", notes: "" },
  ...
];
```

Every action follows the same loop:

```
change the workouts array  →  save it to localStorage  →  re-draw the screen
```

- **Create** → `workouts.unshift(newEntry)` adds to the front of the array
- **Read**   → `render()` loops over the array with `.forEach()` and builds
  one card per entry. Filtering is just `.filter()` before drawing.
- **Update** → find the entry by `id` with `.findIndex()`, replace it in
  place, then re-draw
- **Delete** → `.filter()` out the one entry whose `id` doesn't match, then
  re-draw

`localStorage.setItem()` can only store **strings**, so the array is
converted with `JSON.stringify()` on save and `JSON.parse()` on load. That's
the entire "database layer" of this app.

**If an interviewer asks "why no database?"** — the honest answer: this is a
client-side demo of CRUD logic. The same four operations (create/read/update/delete)
are exactly what you'd do against a real backend API — you'd just swap
`localStorage.setItem` for a `fetch()` POST/PUT/DELETE call. The array-in,
array-out pattern doesn't change.

---

## Design decisions (so you can explain "why does it look like this")

- **Theme**: a physical gym logbook — index cards on a clipboard, not a
  generic dashboard. Each entry card has a "punch hole" on the left edge
  like a real logbook page, and a stamped number (`#01`, `#02`...).
- **Colors**: chalk-dust beige background, barbell-plate red as the one loud
  accent color, gym-tape blue for secondary actions/focus states, medal gold
  for the stat numbers. Picked to reference gym equipment, not a generic
  SaaS palette.
- **Fonts**: Anton (bold condensed, like gym signage/plates) for headings,
  Work Sans for body text, IBM Plex Mono for numbers — mono font makes sets/
  reps/weight look like recorded data, not paragraph text.
- **Navbar height**: not a random fixed pixel value — it's `padding: 1rem`
  above and below the title text. Padding-driven sizing (instead of a fixed
  `height: 70px`) means it never clips content if the font renders slightly
  taller on another device/OS.
- **Sticky navbar + sticky form card**: `position: sticky; top: 0` on the
  navbar, `top: 96px` (navbar height + gap) on the form card, so both stay
  visible while the log list scrolls — like a real clipboard, the "write new
  entry" card doesn't disappear while you're reading old pages.

---

## How to explain this project in an interview

1. **What it is**: "A gym workout tracker with full CRUD, vanilla JS,
   localStorage instead of a backend, built to practice DOM manipulation and
   state management from scratch before using React."
2. **What you'd highlight**: separation of concerns (HTML/CSS/JS in separate
   files), the single-source-of-truth array + render loop pattern, form
   reuse for both create and edit, input escaping to avoid breaking the page.
3. **What you'd say if asked "what would you add next"**: connect it to a
   real backend (Node/Express + MongoDB) — swap the storage functions only,
   the rest of the app doesn't need to change. That's the MERN-stack next step.
4. **Own it**: you wrote every line and can walk through `script.js`
   top to bottom without hesitation — that's what actually convinces an
   interviewer, not the visual polish.

---

## Running it

No build tools needed.

```
1. Unzip the folder
2. Double-click index.html  (or use a "Live Server" extension in VS Code)
```

---

&copy; RT Dev — built as part of the 100 Code Blueprints series.

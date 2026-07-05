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


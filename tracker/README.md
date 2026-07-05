# 🟢 TrackFlow — Habit Tracker

A **responsive, dark-theme habit tracker** built with pure HTML, CSS & JavaScript.  
No frameworks. No build tools. Just open `index.html` and go.
 
----

## ✨ Features

| Feature | Details |
|---|---|
| ➕ Add habits | Name, goal, category, accent colour |
| ✅ Daily check-off | Toggle completion with one tap |
| 🔥 Streak counter | Auto-calculated current streak |
| 📊 Progress arc | Live percentage arc for today |
| 📅 Weekly heatmap | 7-day colour-coded grid |
| 🎯 Stats bar | Total habits · Done today · Best streak · Completion % |
| 🔍 Filter tabs | All · Pending · Completed |
| 🗑️ Delete confirm | Safe two-step deletion |
| 💾 LocalStorage | Data persists across sessions |
| 📱 Fully responsive | Mobile-first, works down to 320px |
| ♿ Accessible | ARIA labels, keyboard nav, focus styles |
| 🌑 Reduced motion | Respects `prefers-reduced-motion` |

---

## 📁 Project Structure

```
trackflow/
├── index.html          ← Main app shell
├── css/
│   └── style.css       ← All styles (CSS custom properties, responsive)
├── js/
│   └── app.js          ← Full app logic (data, render, events)
└── README.md
```

---

## 🚀 Getting Started

### Option A — Open directly
Just open `index.html` in any modern browser.  
No server required, no npm install, no build step.

### Option B — Local server (optional, for development)
```bash
# Python
python -m http.server 3000

# Node.js (npx)
npx serve .
```
Then visit `http://localhost:3000`

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0D0D0F` |
| Surface | `#18181C` |
| Accent | `#6EE7B7` (mint green) |
| Text | `#F0EFEE` |
| Display font | DM Serif Display |
| Body font | Inter |
| Mono font | JetBrains Mono |

---

## 🗂 Data Format (localStorage)

Key: `trackflow_habits`

```json
[
  {
    "id": "abc123",
    "name": "Morning Run",
    "goal": "30 minutes",
    "category": "health",
    "color": "#6EE7B7",
    "createdAt": "2025-06-01",
    "completions": {
      "2025-06-01": true,
      "2025-06-02": true
    },
    "streak": 2
  }
]
```

---

## ⚡ Customisation Tips

- **Change accent colour** → Edit `--accent` in `:root` inside `style.css`
- **Add new categories** → Add a `.cat-btn` in the modal HTML and handle in `app.js`
- **Disable demo data** → Remove the `seedDemo()` call at the bottom of `app.js`
- **Multiple days tracking** → `completions` object already stores arbitrary date keys

---

## 🧱 Tech Stack

- **HTML5** — Semantic markup, ARIA roles
- **CSS3** — Custom properties, Grid, Flexbox, backdrop-filter, animations
- **Vanilla JS** — ES6+, localStorage, DOM manipulation
- **Google Fonts** — DM Serif Display + Inter + JetBrains Mono

---



## 🛠 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ |
| Firefox 88+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built by [Rahul](https://github.com/rahulthombare123) .

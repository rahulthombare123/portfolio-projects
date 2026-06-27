/* ============================================
   TrackFlow — Habit Tracker  |  app.js
   ============================================ */

// ── DATA LAYER ────────────────────────────────
const DB = {
  load() {
    try {
      return JSON.parse(localStorage.getItem('trackflow_habits') || '[]');
    } catch { return []; }
  },
  save(habits) {
    localStorage.setItem('trackflow_habits', JSON.stringify(habits));
  }
};

let habits = DB.load();
let pendingDeleteId = null;
let activeFilter   = 'all';
let selectedColor  = '#6EE7B7';
let selectedCat    = 'health';

// ── UTILITIES ────────────────────────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10);  // "YYYY-MM-DD"
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// ── DATE DISPLAY ──────────────────────────────
function renderDate() {
  const el  = document.getElementById('currentDate');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
}

// ── ARC PROGRESS ─────────────────────────────
function renderArc(pct) {
  const ARC_LEN = 251.3;   // half-circle circumference for r=80
  const fill    = document.getElementById('arcFill');
  const label   = document.getElementById('arcPercent');
  const offset  = ARC_LEN - (ARC_LEN * pct / 100);
  fill.style.strokeDashoffset = offset;
  label.textContent = Math.round(pct) + '%';
}

// ── WEEK GRID ─────────────────────────────────
function renderWeekGrid() {
  const grid  = document.getElementById('weekGrid');
  const today = new Date();
  const todayStr = dayKey(today);
  // Find Monday of current week
  const day   = today.getDay();                         // 0=Sun
  const diff  = (day === 0 ? -6 : 1 - day);            // offset to Monday
  const mon   = new Date(today);
  mon.setDate(today.getDate() + diff);

  const days  = ['M','T','W','T','F','S','S'];
  grid.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d    = new Date(mon);
    d.setDate(mon.getDate() + i);
    const key  = dayKey(d);
    const isTd = key === todayStr;
    const isFt = key > todayStr;

    // Count completions that day
    let done = 0, total = 0;
    habits.forEach(h => {
      if (!h.createdAt || h.createdAt <= key) {
        total++;
        if (h.completions && h.completions[key]) done++;
      }
    });

    let dotClass = 'week-dot';
    if (isTd) dotClass += ' today';
    else if (!isFt && total > 0) {
      if (done === total) dotClass += ' full';
      else if (done > 0)  dotClass += ' partial';
    }

    const cell = document.createElement('div');
    cell.className = 'week-cell';
    cell.innerHTML = `
      <span class="week-day">${days[i]}</span>
      <div class="${dotClass}" title="${isFt ? '' : done + '/' + total}">${isFt ? '' : (total > 0 ? done : '')}</div>
    `;
    grid.appendChild(cell);
  }
}

// ── STATS BAR ─────────────────────────────────
function renderStats() {
  const key = todayKey();
  const total     = habits.length;
  const doneToday = habits.filter(h => h.completions && h.completions[key]).length;

  // Overall completion rate (last 7 days)
  let totalSlots = 0, doneSlots = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = dayKey(d);
    habits.forEach(h => {
      if (!h.createdAt || h.createdAt <= k) {
        totalSlots++;
        if (h.completions && h.completions[k]) doneSlots++;
      }
    });
  }
  const rate = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;

  // Best streak across all habits
  const best = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);

  document.getElementById('totalHabits').textContent   = total;
  document.getElementById('completedToday').textContent = doneToday;
  document.getElementById('longestStreak').textContent  = best;
  document.getElementById('overallRate').textContent    = rate + '%';

  const pct = total > 0 ? (doneToday / total) * 100 : 0;
  renderArc(pct);
}

// ── STREAK CALC ───────────────────────────────
function calcStreak(habit) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = dayKey(d);
    if (habit.completions && habit.completions[k]) { streak++; }
    else { break; }
  }
  return streak;
}

// ── RENDER HABITS ─────────────────────────────
function renderHabits() {
  const list  = document.getElementById('habitsList');
  const empty = document.getElementById('emptyState');
  const key   = todayKey();

  let filtered = habits.slice();
  if (activeFilter === 'done')    filtered = filtered.filter(h => h.completions && h.completions[key]);
  if (activeFilter === 'pending') filtered = filtered.filter(h => !(h.completions && h.completions[key]));

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.add('visible');
  } else {
    empty.classList.remove('visible');
    filtered.forEach(h => {
      const isDone = !!(h.completions && h.completions[key]);
      const streak = calcStreak(h);
      const card   = document.createElement('div');
      card.className = 'habit-card' + (isDone ? ' done' : '');
      card.style.setProperty('--habit-color', h.color || 'var(--accent)');
      card.dataset.id = h.id;

      card.innerHTML = `
        <button class="check-btn ${isDone ? 'checked' : ''}" data-id="${h.id}" aria-label="${isDone ? 'Unmark' : 'Mark complete'}">
          ${isDone ? '✓' : ''}
        </button>
        <div class="habit-info">
          <div class="habit-name">${escHtml(h.name)}</div>
          <div class="habit-meta">
            <span class="habit-category">${escHtml(h.category || '')}</span>
            ${h.goal ? `<span class="habit-goal">${escHtml(h.goal)}</span>` : ''}
            ${streak > 0 ? `<span class="habit-streak">🔥 ${streak}d</span>` : ''}
          </div>
        </div>
        <div class="habit-actions">
          <button class="action-btn delete" data-id="${h.id}" aria-label="Delete habit">✕</button>
        </div>
      `;
      list.appendChild(card);
    });
  }

  renderStats();
  renderWeekGrid();
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── TOGGLE COMPLETION ─────────────────────────
function toggleHabit(id) {
  const key = todayKey();
  const h   = habits.find(x => x.id === id);
  if (!h) return;
  if (!h.completions) h.completions = {};
  if (h.completions[key]) {
    delete h.completions[key];
    showToast('Marked as pending');
  } else {
    h.completions[key] = true;
    h.streak = calcStreak(h);
    showToast('Great work! ✓');
  }
  DB.save(habits);
  renderHabits();
}

// ── ADD HABIT ─────────────────────────────────
function addHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) {
    document.getElementById('habitName').focus();
    showToast('Please enter a habit name');
    return;
  }
  const habit = {
    id:          uid(),
    name,
    goal:        document.getElementById('habitGoal').value.trim(),
    category:    selectedCat,
    color:       selectedColor,
    createdAt:   todayKey(),
    completions: {},
    streak:      0
  };
  habits.unshift(habit);
  DB.save(habits);
  closeModal();
  renderHabits();
  showToast('Habit added!');
}

// ── DELETE ────────────────────────────────────
function openDeleteModal(id) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  pendingDeleteId = id;
  document.getElementById('deleteHabitName').textContent = h.name;
  document.getElementById('deleteOverlay').classList.add('open');
}

function confirmDelete() {
  habits = habits.filter(x => x.id !== pendingDeleteId);
  DB.save(habits);
  document.getElementById('deleteOverlay').classList.remove('open');
  pendingDeleteId = null;
  renderHabits();
  showToast('Habit deleted');
}

// ── MODAL CONTROLS ────────────────────────────
function openModal() {
  document.getElementById('habitName').value  = '';
  document.getElementById('habitGoal').value  = '';
  selectedColor = '#6EE7B7';
  selectedCat   = 'health';
  // Reset UI
  document.querySelectorAll('.color-btn').forEach(b => b.classList.toggle('active', b.dataset.color === selectedColor));
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === selectedCat));
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('habitName').focus(), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ── EVENT DELEGATION ──────────────────────────
document.getElementById('habitsList').addEventListener('click', e => {
  const checkBtn = e.target.closest('.check-btn');
  const delBtn   = e.target.closest('.action-btn.delete');
  if (checkBtn) toggleHabit(checkBtn.dataset.id);
  if (delBtn)   openDeleteModal(delBtn.dataset.id);
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderHabits();
  });
});

// Modal triggers
document.getElementById('openModal').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);
document.getElementById('saveHabit').addEventListener('click', addHabit);

// Enter key in modal
document.getElementById('habitName').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// Delete modal
document.getElementById('cancelDelete').addEventListener('click', () => {
  document.getElementById('deleteOverlay').classList.remove('open');
  pendingDeleteId = null;
});
document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

document.getElementById('deleteOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('deleteOverlay')) {
    document.getElementById('deleteOverlay').classList.remove('open');
    pendingDeleteId = null;
  }
});

// Category & colour pickers
document.getElementById('categoryGrid').addEventListener('click', e => {
  const btn = e.target.closest('.cat-btn');
  if (!btn) return;
  selectedCat = btn.dataset.cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b === btn));
});

document.getElementById('colorGrid').addEventListener('click', e => {
  const btn = e.target.closest('.color-btn');
  if (!btn) return;
  selectedColor = btn.dataset.color;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.toggle('active', b === btn));
});

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    document.getElementById('deleteOverlay').classList.remove('open');
  }
});

// ── SEED DEMO DATA ────────────────────────────
function seedDemo() {
  if (habits.length > 0) return;   // don't overwrite existing data
  const demos = [
    { name: 'Morning Run',      goal: '30 minutes', category: 'health',     color: '#6EE7B7' },
    { name: 'Read 20 pages',    goal: '20 pages',   category: 'mind',       color: '#93C5FD' },
    { name: 'Drink 2L water',   goal: '2 litres',   category: 'health',     color: '#FCA5A5' },
    { name: 'Meditate',         goal: '10 minutes', category: 'mind',       color: '#C4B5FD' },
  ];
  const today = new Date();
  habits = demos.map((d, i) => {
    const completions = {};
    // Seed some past completions for realism
    const days = [0,1,2,3,4,6,7,8,9,10];
    days.forEach(offset => {
      if (Math.random() > 0.3) {
        const dd = new Date(today);
        dd.setDate(today.getDate() - offset);
        completions[dayKey(dd)] = true;
      }
    });
    return {
      id:          uid(),
      name:        d.name,
      goal:        d.goal,
      category:    d.category,
      color:       d.color,
      createdAt:   dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14)),
      completions,
      streak:      0
    };
  });
  DB.save(habits);
}

// ── INIT ──────────────────────────────────────
seedDemo();
renderDate();
renderHabits();

/* ===================================================================
   IronLog — script.js
   Plain JavaScript CRUD (Create, Read, Update, Delete)
   Storage: browser localStorage (no backend / database needed)
   ===================================================================

   MENTAL MODEL (read this before the code):
   1. workouts   -> one JS array that lives in memory, this is our "database"
   2. localStorage -> a text-only key/value box in the browser that saves
                       that array as a STRING so it survives page refresh
   3. render()   -> the ONLY function allowed to touch the DOM to draw the
                       list. Every CRUD action just changes the `workouts`
                       array, saves it, then calls render() again.
   This "change data -> save -> re-draw" loop is the same idea used by
   React/Vue under the hood, just done by hand.
*/

const STORAGE_KEY = 'ironlog_workouts';

/** @type {Array<{id:string, exercise:string, category:string, sets:number, reps:number, weight:number, date:string, notes:string}>} */
let workouts = [];

let editingId = null; // null = "add mode", otherwise = "edit mode" for that id

/* ---------- DOM references (grabbed once, reused everywhere) ---------- */
const form           = document.getElementById('workoutForm');
const formHeading     = document.getElementById('formHeading');
const idField         = document.getElementById('workoutId');
const exerciseField   = document.getElementById('exercise');
const categoryField   = document.getElementById('category');
const setsField       = document.getElementById('sets');
const repsField       = document.getElementById('reps');
const weightField     = document.getElementById('weight');
const dateField       = document.getElementById('date');
const notesField      = document.getElementById('notes');
const submitBtn       = document.getElementById('submitBtn');
const cancelEditBtn   = document.getElementById('cancelEditBtn');

const entryListEl     = document.getElementById('entryList');
const emptyStateEl    = document.getElementById('emptyState');
const filterCategoryEl = document.getElementById('filterCategory');

const statCountEl  = document.getElementById('statCount');
const statVolumeEl = document.getElementById('statVolume');
const statWeekEl   = document.getElementById('statWeek');

/* =====================================================================
   STORAGE HELPERS  (talk to localStorage, nothing else)
   ===================================================================== */

function loadWorkouts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  workouts = raw ? JSON.parse(raw) : [];
}

function saveWorkouts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

/* =====================================================================
   CREATE  +  UPDATE   (same form handles both — that's why we check editingId)
   ===================================================================== */

form.addEventListener('submit', function (e) {
  e.preventDefault(); // stop the browser's default full-page-reload submit

  const entry = {
    id: editingId || crypto.randomUUID(),
    exercise: exerciseField.value.trim(),
    category: categoryField.value,
    sets: Number(setsField.value),
    reps: Number(repsField.value),
    weight: Number(weightField.value),
    date: dateField.value,
    notes: notesField.value.trim(),
  };

  if (!entry.exercise || !entry.category || !entry.date) return; // required fields

  if (editingId) {
    // UPDATE: find the old entry by id and replace it
    const index = workouts.findIndex(w => w.id === editingId);
    workouts[index] = entry;
  } else {
    // CREATE: add the new entry to the front of the list (newest first)
    workouts.unshift(entry);
  }

  saveWorkouts();
  exitEditMode();
  render();
});

cancelEditBtn.addEventListener('click', exitEditMode);

function enterEditMode(id) {
  const entry = workouts.find(w => w.id === id);
  if (!entry) return;

  editingId = id;
  idField.value = entry.id;
  exerciseField.value = entry.exercise;
  categoryField.value = entry.category;
  setsField.value = entry.sets;
  repsField.value = entry.reps;
  weightField.value = entry.weight;
  dateField.value = entry.date;
  notesField.value = entry.notes;

  formHeading.textContent = 'Edit entry';
  submitBtn.textContent = 'Save changes';
  cancelEditBtn.hidden = false;

  // scroll the form into view on mobile, where it isn't sticky
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function exitEditMode() {
  editingId = null;
  form.reset();
  idField.value = '';
  formHeading.textContent = 'New entry';
  submitBtn.textContent = 'Log it';
  cancelEditBtn.hidden = true;
}

/* =====================================================================
   DELETE
   ===================================================================== */

function deleteWorkout(id) {
  const entry = workouts.find(w => w.id === id);
  if (!entry) return;

  const ok = confirm(`Delete "${entry.exercise}" from ${entry.date}?`);
  if (!ok) return;

  workouts = workouts.filter(w => w.id !== id);
  saveWorkouts();

  // if you delete the entry you were editing, drop out of edit mode too
  if (editingId === id) exitEditMode();

  render();
}

/* =====================================================================
   READ  (render the list — filter + sort live here)
   ===================================================================== */

filterCategoryEl.addEventListener('change', render);

function getVisibleWorkouts() {
  const filter = filterCategoryEl.value;
  const list = filter === 'all'
    ? workouts
    : workouts.filter(w => w.category === filter);

  // newest date first
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function render() {
  const visible = getVisibleWorkouts();

  entryListEl.innerHTML = ''; // clear old cards before redrawing
  emptyStateEl.hidden = visible.length !== 0;

  visible.forEach((w, i) => {
    entryListEl.appendChild(buildEntryCard(w, i + 1));
  });

  updateStats();
}

function buildEntryCard(w, displayNumber) {
  const card = document.createElement('article');
  card.className = 'entry';

  const number = String(displayNumber).padStart(2, '0');

  card.innerHTML = `
    <span class="entry__number">#${number}</span>
    <div class="entry__body">
      <div class="entry__title-row">
        <span class="entry__exercise">${escapeHtml(w.exercise)}</span>
        <span class="entry__category">${escapeHtml(w.category)}</span>
      </div>
      <div class="entry__meta">
        <b>${w.sets}</b> sets &times; <b>${w.reps}</b> reps @ <b>${w.weight}</b> kg
      </div>
      ${w.notes ? `<div class="entry__notes">"${escapeHtml(w.notes)}"</div>` : ''}
    </div>
    <div class="entry__actions">
      <span class="entry__date">${formatDate(w.date)}</span>
      <div style="display:flex; gap:0.4rem;">
        <button class="icon-btn" title="Edit" data-action="edit">&#9998;</button>
        <button class="icon-btn icon-btn--delete" title="Delete" data-action="delete">&times;</button>
      </div>
    </div>
  `;

  card.querySelector('[data-action="edit"]').addEventListener('click', () => enterEditMode(w.id));
  card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteWorkout(w.id));

  return card;
}

/* =====================================================================
   STATS  (small derived numbers — pure functions over the array)
   ===================================================================== */

function updateStats() {
  statCountEl.textContent = workouts.length;

  const totalVolume = workouts.reduce((sum, w) => sum + w.sets * w.reps * w.weight, 0);
  statVolumeEl.textContent = Math.round(totalVolume).toLocaleString();

  const startOfWeek = getStartOfWeek(new Date());
  const thisWeekCount = workouts.filter(w => new Date(w.date) >= startOfWeek).length;
  statWeekEl.textContent = thisWeekCount;
}

function getStartOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/* =====================================================================
   SMALL UTILITIES
   ===================================================================== */

function formatDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

// prevent someone typing "<script>" in exercise/notes from breaking the page
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* =====================================================================
   INIT
   ===================================================================== */

document.getElementById('year').textContent = new Date().getFullYear();
dateField.valueAsDate = new Date(); // default new entries to today

loadWorkouts();
render();

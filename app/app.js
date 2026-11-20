// Leonida Ledger v3 — app.js
// Boot, saved progress, search, filters, sort, export/import, screenshot
// parameters. Rendering lives in render.js (tracker) and roadmap.js.

import { renderDashboard, renderFilterChips, renderTrophyList, renderTrophyDetail, gradeRank, escapeHtml } from './render.js';
import { renderRoadmap, ROADMAP_STAGES } from './roadmap.js';

const SAVE_KEY = 'leonida-ledger-save-v1';
const DEFAULT_SELECTED_ID = 28; // Positive Mental Attitude: the one missable trophy.

const state = {
  trophies: [],
  selectedId: DEFAULT_SELECTED_ID,
  earnedIds: new Set(),
  spoilers: true,
  activeFilter: 'all',
  sortMode: 'roadmap',
  searchTerm: '',
  view: 'tracker',
};

const SORT_COMPARATORS = {
  roadmap: (a, b) => (a.stage || 99) - (b.stage || 99) || a.id - b.id,
  grade: (a, b) => gradeRank(a.grade) - gradeRank(b.grade) || a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  difficulty: (a, b) => (b.difficulty || 0) - (a.difficulty || 0) || a.id - b.id,
};

function isEarned(trophy) {
  return state.earnedIds.has(trophy.id);
}

// A trophy is spoiler-masked only when the reader keeps spoilers hidden, the
// trophy is a story trophy, and it has not been earned yet.
function isSpoiled(trophy) {
  return state.spoilers && trophy.kind === 'story' && !isEarned(trophy);
}

function nextUnearned() {
  const ordered = [...state.trophies].sort(SORT_COMPARATORS.roadmap);
  return ordered.find((trophy) => !isEarned(trophy)) || null;
}

function visibleTrophies() {
  const query = state.searchTerm.trim().toLowerCase();
  const rows = state.trophies.filter((trophy) => {
    if (state.activeFilter === 'missable' && !trophy.missable) return false;
    if (state.activeFilter !== 'all' && state.activeFilter !== 'missable' && trophy.kind !== state.activeFilter) return false;
    if (!query) return true;
    const haystack = [trophy.name, trophy.description, trophy.guide, ...(trophy.steps || [])]
      .join(' ').toLowerCase();
    return haystack.includes(query);
  });
  return rows.sort(SORT_COMPARATORS[state.sortMode] || SORT_COMPARATORS.roadmap);
}

function renderAll() {
  const earnedSet = state.earnedIds;
  renderDashboard(state.trophies, earnedSet, nextUnearned());
  renderFilterChips(state.trophies, state.activeFilter);
  renderTrophyList(visibleTrophies(), state.selectedId, earnedSet, isSpoiled, state.activeFilter);
  renderTrophyDetail(
    state.trophies.find((trophy) => trophy.id === state.selectedId) || null,
    earnedSet.has(state.selectedId),
    isSpoiled(state.trophies.find((trophy) => trophy.id === state.selectedId) || {}),
  );
  renderRoadmap(state.trophies, isSpoiled);
  document.getElementById('spoiler-badge').hidden = !state.spoilers;
  document.getElementById('spoiler-toggle').checked = state.spoilers;
}

// ----- saved progress -----

function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const ids = Array.isArray(saved.earnedIds) ? saved.earnedIds : [];
    state.earnedIds = new Set(ids.filter((id) => Number.isInteger(id)));
    if (typeof saved.spoilers === 'boolean') state.spoilers = saved.spoilers;
    if (typeof saved.selectedId === 'number') state.selectedId = saved.selectedId;
  } catch {
    state.earnedIds = new Set();
  }
}

function persistProgress(note) {
  const payload = {
    earnedIds: [...state.earnedIds],
    spoilers: state.spoilers,
    selectedId: state.selectedId,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    document.getElementById('save-label').textContent = note || 'Progress saved on this device';
  } catch {
    document.getElementById('save-label').textContent = 'Could not save in this browser';
  }
}

function toggleEarned(id) {
  if (state.earnedIds.has(id)) state.earnedIds.delete(id);
  else state.earnedIds.add(id);
  persistProgress();
  renderAll();
}

function selectTrophy(id) {
  const trophy = state.trophies.find((item) => item.id === id);
  if (!trophy) return;
  state.selectedId = id;
  persistProgress();
  showView('tracker');
  renderAll();
  document.querySelector('.detail-panel')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ----- export / import -----

function exportProgress() {
  const earned = state.trophies.filter((trophy) => state.earnedIds.has(trophy.id)).map((trophy) => trophy.name);
  const payload = {
    app: 'Leonida Ledger v3',
    exportedAt: new Date().toISOString(),
    earnedIds: [...state.earnedIds],
    earnedNames: earned,
    spoilers: state.spoilers,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${earned.length} earned trophies`);
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!imported || !Array.isArray(imported.earnedIds)) throw new Error('no earnedIds');
      const known = new Set(state.trophies.map((trophy) => trophy.id));
      state.earnedIds = new Set(imported.earnedIds.filter((id) => known.has(id)));
      if (typeof imported.spoilers === 'boolean') state.spoilers = imported.spoilers;
      persistProgress('Progress imported');
      renderAll();
      showToast(`Imported ${state.earnedIds.size} earned trophies`);
    } catch {
      showToast('That file is not a Leonida Ledger export');
    }
  };
  reader.readAsText(file);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
}

// ----- views -----

function showView(view) {
  state.view = view;
  document.getElementById('tab-tracker').classList.toggle('active', view === 'tracker');
  document.getElementById('tab-roadmap').classList.toggle('active', view === 'roadmap');
  document.getElementById('tracker-view').hidden = view !== 'tracker';
  document.getElementById('roadmap-view').hidden = view !== 'roadmap';
}

// ----- screenshot parameters -----

// Deep links for the four screenshots (also useful for sharing a view):
//   ?view=roadmap  — open the roadmap
//   ?select=43     — open one trophy's guide
//   ?filter=story  — pre-filter the checklist
//   ?sort=grade    — pre-sort the checklist
//   ?spoilers=off  — reveal story trophies
function applyUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'roadmap' || view === 'tracker') showView(view);
  const select = Number(params.get('select'));
  if (Number.isInteger(select) && state.trophies.some((trophy) => trophy.id === select)) {
    state.selectedId = select;
  }
  const filter = params.get('filter');
  if (['all', 'story', 'missable', 'collectibles', 'activities', 'online'].includes(filter)) {
    state.activeFilter = filter;
  }
  const sort = params.get('sort');
  if (SORT_COMPARATORS[sort]) {
    state.sortMode = sort;
    document.getElementById('sort-select').value = sort;
  }
  if (params.get('spoilers') === 'off') state.spoilers = false;
  if (params.get('spoilers') === 'on') state.spoilers = true;
}

// ----- events -----

function bindEvents() {
  document.getElementById('tab-tracker').addEventListener('click', () => showView('tracker'));
  document.getElementById('tab-roadmap').addEventListener('click', () => showView('roadmap'));

  document.getElementById('filter-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    state.activeFilter = chip.dataset.filter;
    renderAll();
  });

  document.getElementById('search-input').addEventListener('input', (event) => {
    state.searchTerm = event.target.value;
    renderTrophyList(visibleTrophies(), state.selectedId, state.earnedIds, isSpoiled, state.activeFilter);
  });

  document.getElementById('sort-select').addEventListener('change', (event) => {
    state.sortMode = event.target.value;
    renderTrophyList(visibleTrophies(), state.selectedId, state.earnedIds, isSpoiled, state.activeFilter);
  });

  document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    persistProgress();
    renderAll();
  });

  // One delegation point: every earn button and every select link in the
  // tracker grid, the dashboard and the roadmap flows through here.
  document.addEventListener('click', (event) => {
    const earnButton = event.target.closest('[data-earn]');
    if (earnButton) {
      toggleEarned(Number(earnButton.dataset.earn));
      return;
    }
    const selectLink = event.target.closest('[data-select]');
    if (selectLink) {
      event.preventDefault();
      selectTrophy(Number(selectLink.dataset.select));
    }
  });

  document.getElementById('export-button').addEventListener('click', exportProgress);
  document.getElementById('import-button').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgressFile(file);
    event.target.value = '';
  });
  document.getElementById('reset-progress').addEventListener('click', () => {
    state.earnedIds = new Set();
    persistProgress('Progress reset');
    renderAll();
    showToast('Progress reset');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      event.preventDefault();
      document.getElementById('search-input').focus();
    }
    if (event.key === 'Escape' && state.searchTerm) {
      state.searchTerm = '';
      document.getElementById('search-input').value = '';
      renderTrophyList(visibleTrophies(), state.selectedId, state.earnedIds, isSpoiled, state.activeFilter);
    }
  });
}

// ----- boot -----

async function boot() {
  try {
    const response = await fetch('data/trophies.json');
    const data = await response.json();
    state.trophies = Array.isArray(data) ? data : data.trophies;
    if (!Array.isArray(state.trophies) || !state.trophies.length) throw new Error('no trophies');
  } catch {
    document.getElementById('trophy-list').innerHTML =
      '<div class="empty-state"><b>The trophy list did not load</b>Serve app/ over HTTP — file:// blocks the data fetch.</div>';
    window.__shotReady = true;
    return;
  }
  loadSavedProgress();
  bindEvents();
  applyUrlParameters();
  renderAll();
  window.__shotReady = true;
}

boot();

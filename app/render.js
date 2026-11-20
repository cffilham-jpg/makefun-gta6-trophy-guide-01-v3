// Leonida Ledger v3 — render.js
// Turns trophy data into the dashboard, the checklist and the detail panel.
// Pure rendering: every function takes plain data and returns HTML or writes
// it into one named element. State lives in app.js.

export const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };
export const FILTER_NAMES = { all: 'ALL TROPHIES', story: 'STORY', missable: 'MISSABLE', collectibles: 'COLLECTIBLES', activities: 'ACTIVITIES', online: 'ONLINE' };
export const DIFFICULTY_LABELS = { 1: 'Trivial', 2: 'Easy', 3: 'Moderate', 4: 'Demanding', 5: 'Long grind' };

const GRADE_MEDALS = { platinum: '✧', gold: '◆', silver: '◇', bronze: '●' };
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

export function gradeMedal(grade) {
  return GRADE_MEDALS[grade] || '●';
}

export function gradeRank(grade) {
  return GRADE_ORDER[grade] ?? 9;
}

export function formatCount(trophy) {
  if (trophy.count == null) return '';
  const number = Number(trophy.count).toLocaleString('en-US');
  if (trophy.money) return `$${number} ${trophy.countLabel || ''}`.trim();
  return `${number} ${trophy.countLabel || ''}`.trim();
}

export function difficultyStars(level) {
  const filled = '★'.repeat(Math.max(0, Math.min(5, level || 1)));
  const empty = '☆'.repeat(5 - filled.length);
  return filled + empty;
}

// The dashboard: overall progress, per-grade counts, per-kind bars, next up.
export function renderDashboard(trophies, earnedIds, nextTrophy) {
  const done = trophies.filter((trophy) => earnedIds.has(trophy.id)).length;
  const percent = trophies.length ? Math.round((done / trophies.length) * 100) : 0;
  document.getElementById('progress-label').innerHTML = `${done} <small>/ ${trophies.length}</small>`;
  document.getElementById('progress-percent').textContent = `${percent}% complete`;
  document.getElementById('progress-fill').style.width = `${percent}%`;

  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  document.getElementById('grade-chips').innerHTML = grades.map((grade) => {
    const total = trophies.filter((trophy) => trophy.grade === grade).length;
    const got = trophies.filter((trophy) => trophy.grade === grade && earnedIds.has(trophy.id)).length;
    return `<span class="grade-chip ${grade}"><b>${gradeMedal(grade)} ${GRADE_LABELS[grade]}</b> ${got}/${total}</span>`;
  }).join('');

  const kinds = [['story', 'STORY'], ['collectibles', 'COLLECTIBLES'], ['activities', 'ACTIVITIES']];
  document.getElementById('kind-bars').innerHTML = kinds.map(([kind, label]) => {
    const total = trophies.filter((trophy) => trophy.kind === kind).length;
    const got = trophies.filter((trophy) => trophy.kind === kind && earnedIds.has(trophy.id)).length;
    const share = total ? Math.round((got / total) * 100) : 0;
    return `<div class="kind-bar"><p><span>${label}</span><b>${got}/${total}</b></p>`
      + `<div class="kind-track"><div class="kind-fill" style="width:${share}%"></div></div></div>`;
  }).join('');

  const nextUp = document.getElementById('next-up');
  if (!nextTrophy) {
    nextUp.innerHTML = '<p><span class="next-label">PLATINUM COMPLETE</span><br>Every trophy earned. Leonida Legend.</p>';
    return;
  }
  nextUp.innerHTML = `<p><span class="next-label">NEXT UP · ROADMAP STAGE ${nextTrophy.stage || '–'}</span><br>`
    + `<b>${escapeHtml(nextTrophy.name)}</b> — ${escapeHtml(nextTrophy.description)}</p>`
    + `<a href="#tracker" data-select="${nextTrophy.id}">Open guide →</a>`;
}

// The filter chips, each with its live count.
export function renderFilterChips(trophies, activeFilter) {
  const counts = { all: trophies.length, online: 0 };
  for (const trophy of trophies) {
    counts[trophy.kind] = (counts[trophy.kind] || 0) + 1;
    if (trophy.missable) counts.missable = (counts.missable || 0) + 1;
  }
  const order = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];
  document.getElementById('filter-chips').innerHTML = order.map((kind) => {
    const label = kind === 'all' ? 'All' : KIND_LABELS[kind];
    const active = kind === activeFilter ? ' active' : '';
    return `<button class="filter-chip${active}" type="button" data-filter="${kind}">${label}<b>${counts[kind] || 0}</b></button>`;
  }).join('');
}

// One checklist row: checkbox, medal, name, description, tags.
function trophyRowHtml(trophy, selected, earned, spoiled) {
  const title = spoiled ? 'Hidden story trophy' : escapeHtml(trophy.name);
  const description = spoiled ? 'Earn it to reveal this story detail.' : escapeHtml(trophy.description);
  const tags = [
    `<span class="mini-tag">${escapeHtml(GRADE_LABELS[trophy.grade])}</span>`,
    trophy.missable ? '<span class="mini-tag missable">MISSABLE</span>' : '',
    trophy.hidden && !spoiled ? '<span class="mini-tag hidden-tag">HIDDEN</span>' : '',
    earned ? '<span class="mini-tag earned-tag">EARNED</span>' : '',
  ].join('');
  const rowClass = `trophy-item${selected ? ' selected' : ''}${earned ? ' earned' : ''}`;
  return `<div class="${rowClass}" role="listitem">`
    + `<button class="check-box" type="button" data-earn="${trophy.id}" aria-label="${earned ? 'Unmark' : 'Mark'} ${title} as earned" aria-pressed="${earned}">${earned ? '✓' : ''}</button>`
    + `<span class="trophy-medal grade-${escapeHtml(trophy.grade)}" aria-hidden="true">${gradeMedal(trophy.grade)}</span>`
    + `<button class="trophy-copy" type="button" data-select="${trophy.id}" aria-label="Open guide for ${title}">`
    + `<span class="trophy-name">${title}</span><span class="trophy-description">${description}</span>`
    + `<span class="trophy-meta">${tags}</span></button>`
    + `<span class="item-chevron" aria-hidden="true">›</span></div>`;
}

export function renderTrophyList(rows, selectedId, earnedIds, isSpoiled, activeFilter) {
  const list = document.getElementById('trophy-list');
  document.getElementById('shown-count').textContent = rows.length;
  document.getElementById('active-filter-label').textContent = FILTER_NAMES[activeFilter] || 'ALL TROPHIES';
  const pill = document.querySelector('.list-head .count-pill');
  if (pill) pill.textContent = rows.length;
  if (!rows.length) {
    list.innerHTML = '<div class="empty-state"><b>No trophies here</b>Try another filter or search term.</div>';
    return;
  }
  list.innerHTML = rows.map((trophy) => trophyRowHtml(
    trophy,
    trophy.id === selectedId,
    earnedIds.has(trophy.id),
    isSpoiled(trophy),
  )).join('');
}

// The detail panel: the selected trophy's official text, guide steps, tip,
// difficulty, tracked count and cited sources.
export function renderTrophyDetail(trophy, earned, spoiled) {
  const panel = document.getElementById('detail-panel');
  if (!trophy) {
    panel.innerHTML = '<div class="empty-state"><b>No trophy selected</b>Pick one from the checklist.</div>';
    return;
  }
  const title = spoiled ? 'Hidden story trophy' : escapeHtml(trophy.name);
  const description = spoiled
    ? 'Mark this trophy earned, or switch off “Hide story spoilers”, to reveal its name and description.'
    : escapeHtml(trophy.description);
  const badges = [
    `<span class="detail-tag">${escapeHtml(KIND_LABELS[trophy.kind] || trophy.kind)}</span>`,
    trophy.stage ? `<span class="detail-tag stage">ROADMAP STAGE ${trophy.stage}</span>` : '',
    trophy.missable ? '<span class="detail-tag alert">POTENTIALLY MISSABLE</span>' : '',
    trophy.hidden ? '<span class="detail-tag">HIDDEN ON PS5</span>' : '',
  ].join('');
  const count = trophy.count == null
    ? ''
    : `<span class="detail-count">TRACKED COUNT · <b>${escapeHtml(formatCount(trophy))}</b></span>`;
  const gradeClass = `grade-${escapeHtml(trophy.grade)}`;
  const medal = gradeMedal(trophy.grade);
  const gradeName = GRADE_LABELS[trophy.grade];

  let guideSection;
  if (spoiled) {
    guideSection = '<p class="guide-text">This story entry is covered by your spoiler setting. '
      + 'Mark it earned or switch off “Hide story spoilers” to open the guide.</p>';
  } else {
    const steps = Array.isArray(trophy.steps) && trophy.steps.length
      ? `<ol class="guide-steps">${trophy.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`
      : '';
    const tip = trophy.tip
      ? `<div class="tip-box"><b>Watch out:</b> ${escapeHtml(trophy.tip)}</div>`
      : '';
    guideSection = `<p class="guide-text">${escapeHtml(trophy.guide)}</p>${steps}${tip}`;
  }

  const sourceLinks = spoiled ? '' : (trophy.source || []).map((source) =>
    `<a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><span>↗</span>${escapeHtml(source.name)}</a>`,
  ).join('');
  const sourcesSection = spoiled ? '' : `<section class="detail-section"><h3 class="section-title"><span class="section-number">02</span> SOURCES</h3>`
    + `<div class="source-list">${sourceLinks}</div>`
    + '<p class="detail-footnote">Sources open only when you follow them. This guide runs without fetching them.</p></section>';

  const difficulty = trophy.difficulty
    ? `<div class="difficulty"><span class="stars" aria-hidden="true">${difficultyStars(trophy.difficulty)}</span>`
    + `<span><b>${escapeHtml(DIFFICULTY_LABELS[trophy.difficulty] || '')}</b>`
    + (trophy.time ? ` · ${escapeHtml(trophy.time)}` : '') + '</span></div>'
    : '';

  panel.innerHTML = `<div class="detail-topline"><div class="detail-tags">${badges}</div>${count}</div>`
    + `<div class="detail-hero"><span class="detail-medal ${gradeClass}" aria-hidden="true">${medal}</span>`
    + `<div class="detail-hero-copy"><p class="eyebrow">TROPHY ${String(trophy.id).padStart(2, '0')} <span>·</span> ${escapeHtml(gradeName).toUpperCase()}</p>`
    + `<h2>${title}</h2><div class="grade-name">${escapeHtml(gradeName)} trophy</div></div></div>`
    + `<p class="trophy-description-large">${description}</p>`
    + `<div class="detail-action-row"><button class="earned-button ${earned ? 'done' : ''}" type="button" data-earn="${trophy.id}" aria-pressed="${earned}">${earned ? '✓ Trophy earned' : '○ Mark as earned'}</button>`
    + `<span class="type-label">${earned ? 'Saved to this device' : 'Checklist progress saves automatically'}</span></div>`
    + difficulty
    + `<section class="detail-section"><h3 class="section-title"><span class="section-number">01</span> FIELD NOTES</h3>${guideSection}</section>`
    + sourcesSection;
}

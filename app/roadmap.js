// Leonida Ledger v3 — roadmap.js
// The six stages to the platinum, in the order PowerPyx recommends:
// story first, the missable trophy protected, then the open-world list.
// Stages list their trophies by id; renderRoadmap names them from the data.

import { escapeHtml } from './render.js';

export const ROADMAP_STAGES = [
  {
    stage: 1,
    label: 'STAGE 1 · CHAPTERS 1–4 & FINALE',
    title: 'Play the story',
    body: 'Work through the five chapters and the finale in one run. All twelve story '
      + 'trophies unlock automatically as you finish key missions, and free-roam stays '
      + 'open after the credits — nothing story-related is missable.',
    hours: '≈ 60–80 h',
    note: '12 story trophies · save at each chapter',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    highlightIds: [],
  },
  {
    stage: 2,
    label: 'STAGE 2 · CHAPTER 1 ONWARD',
    title: 'Protect the missable trophy',
    body: 'Positive Mental Attitude is the only trophy that can be missed: meditate at '
      + 'all 18 spots across 10 locations, with both Jason and Lucia. The first '
      + 'meditation, with Lucia on the balcony at Jason’s house in Chapter 1, is the '
      + 'single cut-off in the game — do it the morning after Down to Earth, then keep '
      + 'a save at each chapter start.',
    hours: '≈ 4 h across the run',
    note: '1 trophy · the only missable one',
    trophyIds: [28],
    highlightIds: [28],
  },
  {
    stage: 3,
    label: 'STAGE 3 · OPEN WORLD',
    title: 'Roam, scan and collect',
    body: 'Drive every road, scan vehicles and landmarks with the WAiNK app, and buy the '
      + 'garages. Progress toward the 100% checklist counts from your first hour, so '
      + 'the earlier the scanning starts, the less backtracking the cleanup needs.',
    hours: '≈ 30 h',
    note: '7 trophies · feeds the 100% checklist',
    trophyIds: [42, 54, 55, 35, 31, 30, 44],
    highlightIds: [],
  },
  {
    stage: 4,
    label: 'STAGE 4 · STRANGERS & SIDES',
    title: 'Finish the stranger strands',
    body: 'Follow the stranger questlines to their finales: Andy’s rehabilitation, '
      + 'Kenton’s shipwrecks, Billy’s mudclub, Randy’s wish list and Tyrone’s lab '
      + 'hunt. Each strand unlocks a trophy at its finale, and eight Strangers & '
      + 'Freaks strands are needed for their own trophy.',
    hours: '≈ 20 h',
    note: '9 trophies · strands stay open after the story',
    trophyIds: [29, 20, 21, 22, 23, 24, 25, 26, 27],
    highlightIds: [],
  },
  {
    stage: 5,
    label: 'STAGE 5 · COUNTERS & SKILL',
    title: 'Clear the counters',
    body: 'The big numbers: 250 stunts, 42 shooting-range golds, 20 race wins, 50 '
      + 'challenges, 100 scanned vehicles, the drone races and the full activity set. '
      + 'Work them one counter at a time — most overlap with the 100% checklist, so '
      + 'nothing here is wasted effort.',
    hours: '≈ 50 h',
    note: '12 trophies · the long middle',
    trophyIds: [15, 17, 16, 33, 34, 19, 36, 37, 38, 39, 32, 18],
    highlightIds: [],
  },
  {
    stage: 6,
    label: 'STAGE 6 · CLEANUP',
    title: 'Cleanup & platinum',
    body: 'Rob the five bank vaults, launder and spend the cash, finish the last '
      + 'challenges and check the 100% checklist under Progress > Stats. When A Long '
      + 'Road unlocks, the platinum — Leonida Legend — follows it.',
    hours: '≈ 20 h',
    note: '14 trophies · ends at the platinum',
    trophyIds: [14, 52, 53, 40, 41, 43, 45, 46, 47, 48, 49, 50, 51, 1],
    highlightIds: [],
  },
];

// Renders one stage card: the stage number, title, blurb, hours, and the
// trophies it covers as links back into the tracker.
export function renderRoadmap(trophies, isSpoiled) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  document.getElementById('roadmap-grid').innerHTML = ROADMAP_STAGES.map((stage) => {
    const items = stage.trophyIds.map((id) => {
      const trophy = byId.get(id);
      if (!trophy) return '';
      const name = isSpoiled(trophy) ? 'Hidden story trophy' : escapeHtml(trophy.name);
      const alert = stage.highlightIds.includes(id)
        ? '<span class="route-mini-alert">MISSABLE</span>'
        : '';
      return `<li><a href="#tracker" data-select="${trophy.id}">${name}</a>${alert}</li>`;
    }).join('');
    return `<article class="roadmap-card"><div class="roadmap-card-head"><span class="roadmap-step">${stage.stage}</span>`
      + `<div><p class="eyebrow">${escapeHtml(stage.label)}</p><h3>${escapeHtml(stage.title)}</h3></div></div>`
      + `<p>${escapeHtml(stage.body)}</p>`
      + `<div class="roadmap-meta"><span>TIME · <b>${escapeHtml(stage.hours)}</b></span><span>${escapeHtml(stage.note)}</span></div>`
      + `<ul>${items}</ul></article>`;
  }).join('');
}

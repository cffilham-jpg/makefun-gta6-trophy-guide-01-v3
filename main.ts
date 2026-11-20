// Leonida Ledger v3 — the entry program for make.fun's gta6-trophy-guide-01.
//
// What it does, in two moves: copy the guide (app/) and its screenshots
// (screenshots/) beside this file into the output directory, then write
// dossier.json there with the kit's buildDossier library — the summary the
// judge reads (screenshots, first-load files and bytes, source outline).
//
// Node 22, standard library only. It runs twice in the grader and both runs
// must write the same bytes, so nothing here reads the clock or the network.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts is the kit's library file, kept byte for byte:
// the scorer rebuilds the dossier with its own copy and compares the two.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The gate's own caps (the kit's reference/gate.json): only text_max_bytes
// shapes the dossier's bytes; the rest refuse an entry the scorer would
// refuse — more than 4 screenshots or one over 256 KiB, more than 993 files
// and directories in app/, or more than 48 MiB of app files.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function handInEntry() {
  const repoRoot = fileURLToPath(new URL('.', import.meta.url));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });

  const shotDir = join(outDir, 'screenshots');
  mkdirSync(shotDir, { recursive: true });
  const repoShots = join(repoRoot, 'screenshots');
  if (existsSync(repoShots)) cpSync(repoShots, shotDir, { recursive: true });

  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handInEntry();

// main.ts — hands the Rumah Tangga budget site in to make.fun.
//
// The site is plain static files in app/ (index.html plus its own JS and CSS,
// no build step, nothing loaded over the network). This program copies app/
// and screenshots/ next to this file into the output directory and writes
// dossier.json there with the kit's vendored buildDossier, exactly as the
// scorer rebuilds it. vendor/makefun-frontend.ts is left untouched.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and serve the site locally with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });

const shotsDir = join(outDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}

// Caps mirror the gate so a local run refuses what the scorer would refuse:
// at most 4 screenshots of 256 KiB, app/ at most 993 entries / 16 MiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('Wrote ' + join(outDir, 'dossier.json') + ' (' + dossier.length + ' bytes).');

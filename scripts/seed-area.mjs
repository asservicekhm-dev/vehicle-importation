#!/usr/bin/env node
/**
 * `pnpm seed <area> [--local-media]`
 * Areas: globals | home | services | blog | all
 */
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const localMedia = args.includes('--local-media');
const area = args.find((a) => !a.startsWith('-'));

const AREAS = ['globals', 'home', 'services', 'blog'];

function run(script) {
  const res = spawnSync('pnpm', ['run', script], { stdio: 'inherit', shell: true });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

function scriptFor(name) {
  return localMedia ? `seed:${name}:local-media` : `seed:${name}`;
}

if (!area || area === '-h' || area === '--help') {
  console.log(`Usage: pnpm seed <${AREAS.join('|')}|all> [--local-media]`);
  process.exit(area ? 0 : 1);
}

if (area === 'all') {
  for (const name of AREAS) run(scriptFor(name));
  process.exit(0);
}

if (!AREAS.includes(area)) {
  console.error(`Unknown area "${area}". Expected: ${AREAS.join(', ')}, all`);
  process.exit(1);
}

run(scriptFor(area));

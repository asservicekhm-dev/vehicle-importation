import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(dirname, '../src/payload-types.ts');
const outPath = path.resolve(dirname, '../src/payload-types-export.ts');

const src = fs.readFileSync(srcPath, 'utf8');
const stripped = src.replace(/\n*declare module 'payload' \{[\s\S]*\}\s*$/, '\n');

const banner = `/* Auto-generated for @autosearch/web — do not edit. Source: payload-types.ts (declare module stripped). */\n`;

fs.writeFileSync(outPath, banner + stripped);
console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);

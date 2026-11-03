import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');

function usage(): never {
  console.error(`Usage:
  pnpm new component <Name|path/Name> [--tag=div] [--no-class]
  pnpm new view <Name|path/Name>
  pnpm new block <area>/<Name>`);
  process.exit(1);
}

function pascalCase(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function kebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function parseTag(argv: string[]): string {
  const eq = argv.find((arg) => arg.startsWith('--tag='));
  if (eq) return eq.slice('--tag='.length) || 'div';
  const spaced = argv.findIndex((arg) => arg === '--tag');
  if (spaced !== -1 && argv[spaced + 1] && !argv[spaced + 1].startsWith('-')) {
    return argv[spaced + 1];
  }
  // Legacy AS Service typo: --tag-section
  const legacy = argv.find((arg) => arg.startsWith('--tag-') && arg !== '--tag-');
  if (legacy) return legacy.slice('--tag-'.length) || 'div';
  return 'div';
}

function writeFile(filePath: string, contents: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    console.error(`Error: File already exists: ${filePath}`);
    process.exit(1);
  }
  fs.writeFileSync(filePath, contents, 'utf8');
}

function createComponentOrView(kind: 'component' | 'view', inputPath: string, argv: string[]) {
  const name = pascalCase(inputPath.split('/').at(-1) || '');
  if (!name) usage();

  const baseDir = path.join(__dirname, '..', kind === 'component' ? 'components' : 'views');
  const dir = path.join(baseDir, ...inputPath.split('/').map((p, i, arr) => (i === arr.length - 1 ? name : p)));

  if (fs.existsSync(dir)) {
    console.error(`Error: Directory ${dir} already exists.`);
    process.exit(1);
  }

  const includeClassName = !argv.includes('--no-class');
  const tag = parseTag(argv);

  const tsx =
    kind === 'component'
      ? `${includeClassName ? "import clsx from 'clsx';\n" : ''}import styles from './${name}.module.scss';

type Props = {
${includeClassName ? '  className?: string;\n' : ''}};

export function ${name}({ ${includeClassName ? 'className' : ''} }: Props) {
  return (
    <${tag} className={${includeClassName ? `clsx(styles.wrapper, className)` : 'styles.wrapper'}} />
  );
}
`
      : `import styles from './${name}.module.scss';

export function ${name}() {
  return <section className={styles.wrapper} />;
}
`;

  const scss = `.wrapper {
  @include tablet {
  }

  @include laptop {
  }

  @include desktop {
  }
}
`;

  writeFile(path.join(dir, `${name}.tsx`), tsx);
  writeFile(path.join(dir, `${name}.module.scss`), scss);
  writeFile(path.join(dir, 'index.ts'), `export { ${name} } from './${name}';\n`);

  console.info(`Created ${kind}: ${path.relative(repoRoot, dir)}`);
}

function createBlock(rawPath: string) {
  const parts = rawPath.split('/').filter(Boolean);
  if (parts.length !== 2) {
    console.error('Block path must be <area>/<Name>, e.g. home/PromoBanner or services/Warranty');
    process.exit(1);
  }

  const [area, rawName] = parts;
  const name = pascalCase(rawName);
  const blockSlug = `${kebabCase(name)}-block`;
  const exportName = `${name}Block`;
  const interfaceName = `${name}BlockFields`;

  const cmsBlockPath = path.join(
    repoRoot,
    'apps/cms/src/collections/Pages/blocks',
    area,
    `${exportName}.ts`,
  );
  const registryPath = path.join(repoRoot, 'apps/cms/src/collections/Pages/blocks/registry.ts');
  const webDir = path.join(repoRoot, 'apps/web/src/components', name);

  const cmsTemplate = `import type { Block } from 'payload';

export const ${exportName}: Block = {
  slug: '${blockSlug}',
  labels: { singular: '${name}', plural: '${name} sections' },
  interfaceName: '${interfaceName}',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
    },
  ],
};
`;

  const webTsx = `import clsx from 'clsx';

import styles from './${name}.module.scss';

type Props = {
  title?: string | null;
  className?: string;
};

export function ${name}({ title, className }: Props) {
  if (!title?.trim()) return null;

  return (
    <section className={clsx(styles.section, className)}>
      <h2 className={styles.title}>{title}</h2>
    </section>
  );
}
`;

  const webScss = `.section {
  padding-block: var(--space-10) var(--space-16);
}

.title {
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-heading);
  font-weight: 800;
}
`;

  writeFile(cmsBlockPath, cmsTemplate);
  writeFile(path.join(webDir, `${name}.tsx`), webTsx);
  writeFile(path.join(webDir, `${name}.module.scss`), webScss);
  writeFile(path.join(webDir, 'index.ts'), `export { ${name} } from './${name}';\n`);

  // Register in CMS registry if not already present.
  let registry = fs.readFileSync(registryPath, 'utf8');
  const importLine = `import { ${exportName} } from './${area}/${exportName}';`;
  if (!registry.includes(importLine)) {
    const lastImport = [...registry.matchAll(/^import .+;$/gm)].at(-1);
    if (lastImport) {
      const idx = lastImport.index + lastImport[0].length;
      registry = `${registry.slice(0, idx)}\n${importLine}${registry.slice(idx)}`;
    }
  }
  if (!registry.includes(`${exportName},`) && !registry.includes(`${exportName}\n`)) {
    registry = registry.replace(
      /export const pageBlocks: Block\[\] = \[([\s\S]*?)\];/,
      (_m, body: string) => {
        const trimmed = body.trimEnd();
        const insertion = trimmed.endsWith(',') ? `\n  ${exportName},` : `,\n  ${exportName},`;
        return `export const pageBlocks: Block[] = [${trimmed}${insertion}\n];`;
      },
    );
  }
  fs.writeFileSync(registryPath, registry, 'utf8');

  console.info(`Created CMS block: ${path.relative(repoRoot, cmsBlockPath)}`);
  console.info(`Registered in: ${path.relative(repoRoot, registryPath)}`);
  console.info(`Created web component: ${path.relative(repoRoot, webDir)}`);
  console.info(`Next:
  1. Map '${blockSlug}' → ${name} in apps/web/src/components/RenderBlocks/unifiedBlocksMapper.tsx
  2. pnpm generate:types`);
}

const kind = process.argv[2];
const target = process.argv[3];
const rest = process.argv.slice(2);

if (!kind || !target) usage();

if (kind === 'component' || kind === 'view') {
  createComponentOrView(kind, target, rest);
} else if (kind === 'block') {
  createBlock(target);
} else {
  usage();
}

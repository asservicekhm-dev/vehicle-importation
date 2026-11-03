import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const deployDir = path.join(repoRoot, '.deploy');
const defaultDevEnvFile = path.join(deployDir, 'env.dev');
const defaultProdEnvFile = path.join(deployDir, 'env.web.prod');
const seedDir = path.join(deployDir, 'seed-data');
const mongoArchive = path.join(seedDir, 'mongo.archive.gz');
const minioDir = path.join(seedDir, 'minio');

function run(cmd, opts = {}) {
  const res = spawnSync(cmd, {
    shell: true,
    stdio: 'inherit',
    ...opts,
  });
  if (res.status !== 0) {
    throw new Error(`Command failed (${res.status}): ${cmd}`);
  }
}

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

/** MinIO `mc mirror` defaults: avoid parallel multipart races that surface as intermittent SignatureDoesNotMatch. */
const MC_MIRROR_FLAGS = '--overwrite --max-workers 1 --retry --disable-multipart';

/** Align `mc` path-style signing with Payload / AWS SDK (`S3_FORCE_PATH_STYLE`). Default on for MinIO over `http://host:9000`. */
function mcPathStyleFlag(env) {
  const v = String(env.S3_FORCE_PATH_STYLE ?? 'true').trim().toLowerCase();
  if (v === 'false' || v === '0' || v === 'no') return '--path off';
  return '--path on';
}

function parseEnv(filePath) {
  const out = {};
  const txt = fs.readFileSync(filePath, 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx === -1) continue;
    const key = l.slice(0, idx).trim();
    let val = l.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function ensureDirs() {
  fs.mkdirSync(seedDir, { recursive: true });
  fs.mkdirSync(minioDir, { recursive: true });
}

function containerIdByName(name) {
  // Prefer exact container name (compose sets container_name)
  try {
    return sh(`docker ps -q --filter "name=^/${name}$"`);
  } catch {
    return '';
  }
}

function pickArgValue(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return null;
  const val = argv[idx + 1];
  if (!val || val.startsWith('-')) return null;
  return val;
}

function getConfigFromArgs() {
  const argv = process.argv.slice(2);
  const envNameRaw = pickArgValue(argv, '--env');
  const envName = envNameRaw === 'prod' ? 'prod' : 'dev';

  const envFileArg = pickArgValue(argv, '--env-file');
  const envFile =
    envFileArg ||
    (envName === 'prod'
      ? // Prod env files are typically present only on the server.
        defaultProdEnvFile
      : defaultDevEnvFile);

  const mongoContainerArg = pickArgValue(argv, '--mongo-container');
  const minioContainerArg = pickArgValue(argv, '--minio-container');

  const mongoContainer =
    mongoContainerArg || (envName === 'prod' ? 'autosearch-mongo' : 'autosearch-mongo-dev');
  const minioContainer =
    minioContainerArg || (envName === 'prod' ? 'autosearch-minio' : 'autosearch-minio-dev');

  // Optional Mongo namespace rewrite for restores (e.g. smarty-landing.* -> wayon.*)
  // mongorestore flags: --nsFrom <pattern> --nsTo <replacement>
  const nsFrom = pickArgValue(argv, '--ns-from');
  const nsTo = pickArgValue(argv, '--ns-to');

  // Optional namespace include/exclude (mongorestore filters)
  // Helpful when archive contains multiple DBs and rewrite would cause conflicts.
  const nsInclude = pickArgValue(argv, '--ns-include');
  const nsExclude = pickArgValue(argv, '--ns-exclude');

  return { envName, envFile, mongoContainer, minioContainer, nsFrom, nsTo, nsInclude, nsExclude };
}

function getContainerNetworks(containerId) {
  const raw = sh(`docker inspect ${containerId} --format "{{json .NetworkSettings.Networks}}"`);
  const obj = JSON.parse(raw || '{}');
  return Object.keys(obj);
}

function usage() {
  console.log(
    [
      'Usage:',
      '  node .deploy/seed/seed.mjs backup [--env dev|prod] [--env-file <path>]',
      '  node .deploy/seed/seed.mjs seed [--env dev|prod] [--env-file <path>] --yes [--confirm-prod]',
      '  (or: SEED=true node .deploy/seed/seed.mjs seed)',
      '',
      'Overrides (optional):',
      '  --mongo-container <name>   (defaults: autosearch-mongo-dev / autosearch-mongo)',
      '  --minio-container <name>   (defaults: autosearch-minio-dev / autosearch-minio)',
      '  --ns-from <pattern>        (mongorestore namespace rewrite source, e.g. smarty-landing.*)',
      '  --ns-to <pattern>          (mongorestore namespace rewrite target, e.g. wayon.*)',
      '  --ns-include <pattern>     (mongorestore filter include, e.g. smarty-landing.*)',
      '  --ns-exclude <pattern>     (mongorestore filter exclude, e.g. wayon.*)',
      '',
      'What it does:',
      '  backup: creates .deploy/seed-data/mongo.archive.gz and .deploy/seed-data/minio/**',
      '  seed: restores Mongo dump + mirrors MinIO objects from seed-data into the running MinIO',
    ].join('\n'),
  );
}

async function backup() {
  ensureDirs();
  const { envFile, mongoContainer, minioContainer, envName } = getConfigFromArgs();
  if (!fs.existsSync(envFile)) {
    throw new Error(`Env file not found: ${envFile}. Use --env-file to point to the correct file.`);
  }
  const env = parseEnv(envFile);

  const mongoId = containerIdByName(mongoContainer);
  const minioId = containerIdByName(minioContainer);
  if (!mongoId) throw new Error(`Mongo container not running: ${mongoContainer}`);
  if (!minioId) throw new Error(`MinIO container not running: ${minioContainer}`);

  // Mongo dump (gzip archive)
  console.log('\n== Mongo: mongodump → archive ==\n');
  run(`docker exec ${mongoId} sh -lc "mongodump --archive=/tmp/seed.archive.gz --gzip"`);
  run(`docker cp ${mongoId}:/tmp/seed.archive.gz "${mongoArchive}"`);
  run(`docker exec ${mongoId} sh -lc "rm -f /tmp/seed.archive.gz"`);

  // MinIO mirror via mc container (does not require mc on host)
  const bucket = env.S3_BUCKET;
  // Prefer MinIO root keys for mc ↔ MinIO API; must match the running minio container (see docker-compose prod `env_file`).
  const accessKey = env.MINIO_ROOT_USER || env.S3_ACCESS_KEY_ID;
  const secretKey = env.MINIO_ROOT_PASSWORD || env.S3_SECRET_ACCESS_KEY;
  // Prefer internal docker-network endpoint for backup/restore operations.
  // Prod env files often set S3_ENDPOINT to an external HTTPS host (Traefik), which may not be reachable
  // from a one-off `minio/mc` container or may require extra TLS handling.
  const endpoint =
    env.S3_ENDPOINT_INTERNAL || (envName === 'prod' ? 'http://minio:9000' : env.S3_ENDPOINT) || 'http://minio:9000';
  if (!bucket) throw new Error(`S3_BUCKET is missing in ${envFile}`);
  if (!accessKey || !secretKey) throw new Error(`MinIO credentials missing in ${envFile}`);

  const pathStyle = mcPathStyleFlag(env);

  const networks = getContainerNetworks(minioId);
  const network = networks[0];
  if (!network) throw new Error('Could not determine docker network for MinIO container');

  console.log('\n== MinIO: mc mirror bucket → local folder ==\n');
  const minioDirPosix = minioDir.replace(/\\/g, '/');
  run(
    `docker run --rm --network ${network} -v "${minioDirPosix}:/seed" --entrypoint /bin/sh minio/mc -lc ` +
      `"mc alias set src ${endpoint} ${accessKey} ${secretKey} --api s3v4 ${pathStyle}; mc mirror ${MC_MIRROR_FLAGS} src/${bucket} /seed/${bucket}"`,
  );

  console.log(`\nBackup completed:\n- ${mongoArchive}\n- ${path.join(minioDir, bucket)}\n`);
}

function seedConfirmed() {
  const argv = process.argv.slice(2);
  return (
    String(process.env.SEED || '').toLowerCase() === 'true' ||
    argv.includes('--yes') ||
    argv.includes('--confirm')
  );
}

async function seed() {
  const { envFile, mongoContainer, minioContainer, nsFrom, nsTo, nsInclude, nsExclude, envName } = getConfigFromArgs();
  if (!fs.existsSync(envFile)) {
    throw new Error(`Env file not found: ${envFile}. Use --env-file to point to the correct file.`);
  }
  const env = parseEnv(envFile);
  if (!seedConfirmed()) {
    console.log('Seed skipped. Run with --yes (or SEED=true) to execute (drops Mongo, overwrites MinIO).');
    return;
  }
  if (envName === 'prod') {
    const argv = process.argv.slice(2);
    const ok =
      argv.includes('--confirm-prod') ||
      String(process.env.CONFIRM_PROD_SEED || '').toLowerCase() === 'true';
    if (!ok) {
      throw new Error(
        'Prod seed refused. Pass --confirm-prod (or CONFIRM_PROD_SEED=true) together with --yes.',
      );
    }
  }

  const mongoId = containerIdByName(mongoContainer);
  const minioId = containerIdByName(minioContainer);
  if (!mongoId) throw new Error(`Mongo container not running: ${mongoContainer}`);
  if (!minioId) throw new Error(`MinIO container not running: ${minioContainer}`);

  if (!fs.existsSync(mongoArchive)) {
    throw new Error(`Mongo archive not found: ${mongoArchive}. Run backup first.`);
  }

  const bucket = env.S3_BUCKET;
  // Prefer MinIO root keys for mc ↔ MinIO API; must match the running minio container (see docker-compose prod `env_file`).
  const accessKey = env.MINIO_ROOT_USER || env.S3_ACCESS_KEY_ID;
  const secretKey = env.MINIO_ROOT_PASSWORD || env.S3_SECRET_ACCESS_KEY;
  const endpoint =
    env.S3_ENDPOINT_INTERNAL || (envName === 'prod' ? 'http://minio:9000' : env.S3_ENDPOINT) || 'http://minio:9000';
  if (!bucket) throw new Error(`S3_BUCKET is missing in ${envFile}`);
  if (!accessKey || !secretKey) throw new Error(`MinIO credentials missing in ${envFile}`);

  const pathStyle = mcPathStyleFlag(env);

  const bucketPath = path.join(minioDir, bucket);
  if (!fs.existsSync(bucketPath)) {
    throw new Error(`MinIO bucket backup not found: ${bucketPath}. Run backup first.`);
  }

  console.log('\n== Mongo: restore archive ==\n');
  // Copy archive into container and restore (drop existing)
  run(`docker cp "${mongoArchive}" ${mongoId}:/tmp/seed.archive.gz`);
  // Important: don't inject quotes here (command is already wrapped by sh -lc "...").
  // Patterns like smarty-landing.* have no spaces and are safe without shell quoting.
  const rewriteArgs = nsFrom && nsTo ? ` --nsFrom=${nsFrom} --nsTo=${nsTo}` : '';
  const filterArgs = [
    nsInclude ? `--nsInclude=${nsInclude}` : '',
    nsExclude ? `--nsExclude=${nsExclude}` : '',
  ]
    .filter(Boolean)
    .map((s) => ` ${s}`)
    .join('');
  if ((nsFrom && !nsTo) || (!nsFrom && nsTo)) {
    throw new Error('Both --ns-from and --ns-to must be provided together.');
  }
  run(
    `docker exec ${mongoId} sh -lc ` +
      `"mongorestore --archive=/tmp/seed.archive.gz --gzip --drop${rewriteArgs}${filterArgs}"`,
  );
  run(`docker exec ${mongoId} sh -lc "rm -f /tmp/seed.archive.gz"`);

  console.log('\n== MinIO: mirror local folder → bucket ==\n');
  const networks = getContainerNetworks(minioId);
  const network = networks[0];
  if (!network) throw new Error('Could not determine docker network for MinIO container');
  const bucketPathPosix = bucketPath.replace(/\\/g, '/');
  run(
    `docker run --rm --network ${network} -v "${bucketPathPosix}:/seed" --entrypoint /bin/sh minio/mc -lc ` +
      `"mc alias set dst ${endpoint} ${accessKey} ${secretKey} --api s3v4 ${pathStyle}; mc mb -p dst/${bucket} || true; mc mirror ${MC_MIRROR_FLAGS} /seed dst/${bucket}"`,
  );

  console.log('\nSeed completed.\n');
}

const cmd = process.argv[2];
if (!cmd || cmd === '-h' || cmd === '--help') {
  usage();
  process.exit(0);
}

if (cmd === 'backup') {
  await backup();
} else if (cmd === 'seed') {
  await seed();
} else {
  usage();
  process.exit(1);
}


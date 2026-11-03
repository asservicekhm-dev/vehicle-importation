# Seed / Backup (Autosearch)

Backup/restore for **running** compose containers (Mongo dump + MinIO mirror).

## Output

- `.deploy/seed-data/mongo.archive.gz` (gitignored)
- `.deploy/seed-data/minio/<bucket>/**` (gitignored)

Do **not** commit large dumps. Create a snapshot when you need one:

```bash
pnpm seed:backup
```

## Commands

```bash
pnpm seed:backup
pnpm seed:restore
pnpm seed:backup:prod
pnpm seed:restore:prod   # requires --confirm-prod (wired in the script)
```

Prod restore also needs `CONFIRM_PROD_SEED=true` or `--confirm-prod` (in addition to `--yes`).

## Content seeds (CMS)

Prefer idempotent Payload seeds for day-to-day content:

```bash
pnpm seed:all
# or without S3:
pnpm seed:all:local-media
```

Order: globals → home → services → blog.

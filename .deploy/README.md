# Autosearch deploy

Docker Compose for **dev** (bind-mount) and **prod** (Traefik + Let's Encrypt + MinIO).

Create the external network once on the host: `docker network create autosearch-network` (also done by `setup.sh`).

## Dev

```bash
cd .deploy
docker compose -f docker-compose.dev.yml --env-file env.dev up -d --build
```

Ports (host):

| Service | URL |
| --- | --- |
| Web | http://localhost:3200 |
| CMS | http://localhost:3201 |
| Mongo | localhost:27019 |
| MinIO API / console | http://localhost:9200 / http://localhost:9201 |

## Prod (first run on a server)

```bash
cd .deploy
bash setup.sh
# edit env.traefik.prod + env.web.prod
docker compose -f docker-compose.prod.yml \
  --env-file env.traefik.prod \
  --env-file env.web.prod \
  up -d --build
```

- Traefik **v3.6+** (older tags fail on modern Docker Engine API).
- Site at `/`, CMS at `/cms` (`CMS_BASE_PATH`), MinIO on `WEB_MINIO_*` hosts.
- Leave `NEXT_PUBLIC_GTM_ID` empty to disable GTM.

## Seed backup / restore

See [seed/README.md](./seed/README.md) and root scripts `pnpm seed:backup` / `pnpm seed:restore`.

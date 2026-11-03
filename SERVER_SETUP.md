# Server Setup Guide

Provision a host for Autosearch (`.deploy/docker-compose.prod.yml` + Traefik).

## Server requirements

- Ubuntu 22.04+ / Debian 11+
- 2+ CPU, 4+ GB RAM (8 GB recommended), 50+ GB SSD
- DNS for `WEB_DOMAIN`, `WEB_MINIO_S3_DOMAIN`, `WEB_MINIO_CONSOLE_DOMAIN`

## Initial setup

```bash
ssh root@your-server-ip
apt update && apt upgrade -y

adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

apt install ufw -y
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Install Docker

```bash
apt install -y ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker
usermod -aG docker deploy
```

Use Traefik **v3.6+** (pinned in compose). Older tags fail against modern Docker Engine API.

## Clone and configure

```bash
su - deploy
git clone <repo-url> ~/autosearch-landing
cd ~/autosearch-landing/.deploy
bash setup.sh
# edit env.traefik.prod + env.web.prod
```

`setup.sh` creates `autosearch-network` if missing and copies env examples.

## Start

```bash
cd ~/autosearch-landing/.deploy
docker compose -f docker-compose.prod.yml \
  --env-file env.traefik.prod --env-file env.web.prod \
  up -d --build
```

Verify:

- `https://<WEB_DOMAIN>/`
- `https://<WEB_DOMAIN>/cms/api/health`
- MinIO hosts from Traefik env

## Backups

```bash
cd ~/autosearch-landing
pnpm seed:backup:prod
# restore (destructive):
CONFIRM_PROD_SEED=true pnpm seed:restore:prod
```

Prefer content seeds for demos: `pnpm seed:all` / `seed:all:local-media` (not AS Service dumps).

## Security notes

- Strong `PAYLOAD_SECRET`, MinIO passwords, `REVALIDATE_SECRET`
- Empty `NEXT_PUBLIC_GTM_ID` disables GTM
- Keep firewall to 22/80/443; Traefik dashboard bound to localhost in compose

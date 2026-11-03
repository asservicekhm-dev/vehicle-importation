#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up Autosearch deploy environment..."

for env_file in env.traefik.prod env.web.prod; do
  if [ ! -f "$SCRIPT_DIR/$env_file" ]; then
    cp "$SCRIPT_DIR/$env_file.example" "$SCRIPT_DIR/$env_file"
    echo "$env_file created from example — fill in your values"
  else
    echo "$env_file already exists, skipping"
  fi
done

if ! docker network inspect autosearch-network >/dev/null 2>&1; then
  echo "Creating docker network autosearch-network..."
  docker network create autosearch-network
else
  echo "Network autosearch-network already exists"
fi

echo ""
echo "Setup complete."
echo ""
echo "Next steps:"
echo "  1. Edit .deploy/env.traefik.prod — set WEB_DOMAIN + MinIO hosts + TRAEFIK_ACME_EMAIL"
echo "  2. Edit .deploy/env.web.prod     — set secrets (CMS is https://<site>/cms)"
echo "  3. Run docker compose (see .deploy/README.md)"

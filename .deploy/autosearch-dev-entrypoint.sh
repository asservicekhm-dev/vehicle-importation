#!/bin/sh
set -eu

# Shared pnpm store + install guard for dev Docker (CMS + Web share one node_modules volume).

STORE_DIR="${PNPM_STORE_DIR:-/pnpm-store}"
DEPS_STATE_DIR="${AUTOSEARCH_DEPS_STATE_DIR:-/deps}"
LOCK_DIR="${DEPS_STATE_DIR}/.pnpm-install.lock"
DONE_FILE="${DEPS_STATE_DIR}/.done"
LOCK_HASH_FILE="${DEPS_STATE_DIR}/.pnpm-lock.sha256"
RUNTIME_TAG_FILE="${DEPS_STATE_DIR}/.runtime-tag"

mkdir -p "$STORE_DIR" "$DEPS_STATE_DIR"

acquire_lock() {
  while ! mkdir "$LOCK_DIR" 2>/dev/null; do
    sleep 0.5
  done
}

release_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap release_lock EXIT

HASH=""
if [ -f /app/pnpm-lock.yaml ]; then
  HASH="$(sha256sum /app/pnpm-lock.yaml | awk '{print $1}')"
fi

needs_install=""
RUNTIME_TAG="${AUTOSEARCH_DEV_RUNTIME_TAG:-}"

if [ ! -f "$DONE_FILE" ]; then
  needs_install=1
elif [ -n "$RUNTIME_TAG" ] && [ "$RUNTIME_TAG" != "$(cat "$RUNTIME_TAG_FILE" 2>/dev/null || echo "")" ]; then
  echo "[autosearch] Dev base image tag changed — reinstalling native deps (e.g. sharp)..."
  needs_install=1
elif [ ! -f "$LOCK_HASH_FILE" ] || [ "$HASH" != "$(cat "$LOCK_HASH_FILE" 2>/dev/null || echo "")" ]; then
  echo "[autosearch] pnpm-lock.yaml changed — syncing node_modules..."
  needs_install=1
fi

acquire_lock
if [ -n "$needs_install" ]; then
  echo "[autosearch] Installing pnpm deps (store: $STORE_DIR)..."
  pnpm config set store-dir "$STORE_DIR" >/dev/null
  cd /app
  pnpm install --frozen-lockfile
  pnpm rebuild sharp
  printf '%s\n' "$HASH" >"$LOCK_HASH_FILE"
  if [ -n "$RUNTIME_TAG" ]; then
    printf '%s\n' "$RUNTIME_TAG" >"$RUNTIME_TAG_FILE"
  fi
  touch "$DONE_FILE"
  echo "[autosearch] Deps ready."
else
  echo "[autosearch] Deps already match lockfile — skipping install."
fi
release_lock
trap - EXIT

exec "$@"

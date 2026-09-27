#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y-%m-%dT%H%M%SZ)"
target="$BACKUP_DIR/khane-kabab-$timestamp.dump"
pg_dump --format=custom --no-owner --no-privileges --file="$target" "$DATABASE_URL"
printf '%s\n' "Backup created: $target"

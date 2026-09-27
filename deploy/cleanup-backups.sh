#!/usr/bin/env sh
set -eu
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
[ -d "$BACKUP_DIR" ] || exit 0
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'khane-kabab-????-??-??T??????Z.dump' -mtime "+$BACKUP_RETENTION_DAYS" -print -delete

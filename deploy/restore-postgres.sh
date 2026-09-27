#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
backup_path="${1:-}"
if [ -z "$backup_path" ] || [ ! -f "$backup_path" ]; then
  printf '%s\n' "Usage: $0 /path/to/khane-kabab-YYYY-MM-DDTHHMMSSZ.dump" >&2
  exit 2
fi
printf '%s\n' "WARNING: this will replace objects in the target database." >&2
if [ "${FORCE_RESTORE:-false}" != "true" ]; then
  printf '%s' "Type RESTORE to continue: " >&2
  read -r confirmation
  [ "$confirmation" = "RESTORE" ] || { printf '%s\n' "Restore cancelled." >&2; exit 3; }
fi
pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error --dbname="$DATABASE_URL" "$backup_path"
printf '%s\n' "Restore completed."

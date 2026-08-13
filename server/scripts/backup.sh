#!/usr/bin/env bash
set -euo pipefail

# Simple local Postgres backup script. Requires `pg_dump` and DATABASE_URL env var.
OUT_DIR="$(pwd)/backups"
mkdir -p "$OUT_DIR"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
FILENAME="backup-$TIMESTAMP.sql"
echo "Writing backup to $OUT_DIR/$FILENAME"
pg_dump "$DATABASE_URL" -F p -f "$OUT_DIR/$FILENAME"
echo "Backup complete"

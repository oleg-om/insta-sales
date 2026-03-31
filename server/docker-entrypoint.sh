#!/bin/sh
set -e

# Single source of truth for Docker: POSTGRES_* from .env must match the postgres service.
# If DATABASE_URL is unset/empty, build it with encodeURIComponent (safe for @ : # in passwords).
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$(node -e "
    const q = (s) => encodeURIComponent(String(s ?? ''));
    const u = process.env.POSTGRES_USER || 'instasales';
    const p = process.env.POSTGRES_PASSWORD;
    const d = process.env.POSTGRES_DB || 'instasales';
    if (p === undefined || p === '') {
      console.error('docker-entrypoint: set POSTGRES_PASSWORD in .env, or set DATABASE_URL explicitly');
      process.exit(1);
    }
    console.log('postgresql://' + q(u) + ':' + q(p) + '@postgres:5432/' + q(d));
  ")"
fi

exec "$@"

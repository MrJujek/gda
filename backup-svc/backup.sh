#!/bin/sh

mkdir -p /backup/db
pg_dump "host=${DB_HOST:-db} user=${DB_USER} \
    password=${DB_PASS} dbname=${DB_NAME:-gda}" \
    | gzip > "/backup/db/$(date -I)-dump.gz"

mkdir -p /backup/data
rsync -av /data/ /backup/data

mkdir -p /backup/config
rsync -av /config/ /backup/config

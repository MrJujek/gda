#!/bin/sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <yyyy-mm-dd> date of backup to restore"
    exit 1
fi

date="$1"

gunzip -c "/backup/db/${date}-dump.gz" | psql "host=${DB_HOST:-db} user=${DB_USER} \
    password=${DB_PASS} dbname=${DB_NAME:-gda}"

rsync -av /backup/data/ /data
rsync -av /backup/config/ /config

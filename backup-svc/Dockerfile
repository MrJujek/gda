FROM alpine:3.19

COPY ./crontab.tmp ./backup.sh ./restore.sh /

RUN \
    apk add --no-cache postgresql-client rsync \
    && crontab /crontab.tmp

ENTRYPOINT [ "/usr/sbin/crond", "-f", "-d", "0" ]

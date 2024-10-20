FROM mysql:8.0.40

ENV MYSQL_ROOT_PASSWORD="zeroxpoint@1234"
ENV MYSQL_DATABASE="zeroxpoint"

ADD db_backup.sql /docker-entrypoint-initdb.d/db_backup.sql

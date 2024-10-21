FROM mysql:8.0.40

ENV MYSQL_ROOT_PASSWORD=my-secret-pw
ENV MYSQL_DATABASE=zeroxpoint

ADD db_backup.sql /docker-entrypoint-initdb.d/db_backup.sql

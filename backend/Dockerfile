# 1) Builder con Maven
FROM maven:3.9.3-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 2) Runtime con solo JRE
FROM eclipse-temurin:24-jre
WORKDIR /app

# 2.1) Cliente de Postgres para psql
RUN apt-get update \
 && apt-get install -y postgresql-client \
 && rm -rf /var/lib/apt/lists/*

# 2.2) Script de espera
COPY docker/wait-for-postgres.sh /usr/local/bin/wait-for-postgres.sh
RUN chmod +x /usr/local/bin/wait-for-postgres.sh

# 2.3) JAR final
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# Comprueba cada 30s que Postgres sigue respondiendo
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" || exit 1

# 2.4) Arranque sólo cuando autenticación funcione
ENTRYPOINT ["sh","-c","/usr/local/bin/wait-for-postgres.sh"]
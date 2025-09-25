#!/usr/bin/env bash
set -e

echo "⏳ Esperando a que Postgres esté listo en $DB_HOST:$DB_PORT…"

until PGPASSWORD="$POSTGRES_PASSWORD" \
      psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "   aún no responde, reintentando en 5s..."
  sleep 2
done

echo "✅ Postgres listo. Arrancando la app…"
exec java -jar app.jar

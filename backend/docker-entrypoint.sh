#!/bin/sh
set -e

echo "=== Laravel Startup ==="

mkdir -p storage/logs
mkdir -p bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

find storage -type f -exec chmod 664 {} \; || true
find bootstrap/cache -type f -exec chmod 664 {} \; || true

exec apache2-foreground
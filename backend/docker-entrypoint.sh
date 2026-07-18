set -e

echo "Setting Laravel permissions..."

mkdir -p storage/logs
mkdir -p bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

chmod -R 775 storage bootstrap/cache

find storage -type f -exec chmod 664 {} \;
find bootstrap/cache -type f -exec chmod 664 {} \;

exec apache2-foreground
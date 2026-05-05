#!/bin/sh

echo "Starting Redis..."
redis-server &

echo "Initializing MariaDB..."
mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld
mysql_install_db --user=mysql --datadir=/var/lib/mysql > /dev/null

echo "Starting MariaDB..."
mysqld --user=mysql --datadir=/var/lib/mysql --skip-networking=0 &
MYSQL_PID=$!

# Wait for MariaDB to start
echo "Waiting for MariaDB to be ready..."
while ! mysqladmin ping -h 127.0.0.1 --silent; do
    sleep 1
done

echo "Setting up Database..."
# Create Database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS food_waste_redistribution_platform;"
# Setup User and Password
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'raghav@741';"
mysql -u root -p'raghav@741' -e "FLUSH PRIVILEGES;"

echo "Importing Schema..."
mysql -u root -p'raghav@741' food_waste_redistribution_platform < /app/schema.sql

echo "Seeding Database..."
node src/scripts/seed.js

echo "Starting Node.js Application..."
# Bring Node to the foreground so the container stays alive
npm start

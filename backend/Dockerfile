FROM php:8.2-apache

# -------------------------
# System dependencies
# -------------------------
RUN apt-get update && apt-get install -y \
    git zip unzip \
    libpng-dev libonig-dev libxml2-dev \
    sqlite3 libsqlite3-dev \
 && rm -rf /var/lib/apt/lists/*

# -------------------------
# PHP extensions
# -------------------------
RUN docker-php-ext-install \
    pdo pdo_mysql pdo_sqlite \
    mbstring exif pcntl bcmath gd

# -------------------------
# Enable Apache rewrite
# -------------------------
RUN a2enmod rewrite

# -------------------------
# Set Apache document root
# -------------------------
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && sed -ri 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# -------------------------
# Install Composer
# -------------------------
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# -------------------------
# Application setup
# -------------------------
WORKDIR /var/www/html

# 🚨 IMPORTANT: Railway build context is repo root
COPY backend/composer.json ./composer.json
COPY backend/composer.lock* ./

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist

# Copy rest of backend application
COPY backend/ ./

# Fix permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

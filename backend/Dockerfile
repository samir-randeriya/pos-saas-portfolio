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
# Force ONLY mpm_prefork
# -------------------------
RUN rm -f /etc/apache2/mods-enabled/mpm_*.conf \
    && rm -f /etc/apache2/mods-enabled/mpm_*.load \
    && ln -s /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && ln -s /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load

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

COPY backend/composer.json ./composer.json
COPY backend/composer.lock* ./

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts

COPY backend/ ./

RUN composer dump-autoload --optimize \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]
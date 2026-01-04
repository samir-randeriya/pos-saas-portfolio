FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    git zip unzip \
    libpng-dev libonig-dev libxml2-dev \
    sqlite3 libsqlite3-dev

RUN docker-php-ext-install \
    pdo pdo_mysql pdo_sqlite \
    mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set Apache document root to Laravel public folder
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
 && sed -ri 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

# Copy composer files first for better layer caching
COPY composer.json composer.lock* ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY . .

# Run post-install scripts
RUN composer dump-autoload --optimize

RUN chown -R www-data:www-data /var/www/html
RUN a2enmod rewrite

EXPOSE 80

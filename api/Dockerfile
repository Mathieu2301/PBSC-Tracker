FROM php:apache
COPY src/ /var/www/html/

# Install PDO
RUN docker-php-ext-install pdo pdo_mysql

# Apache rewrite
RUN a2enmod rewrite

# PHP Config
COPY conf/php.ini /usr/local/etc/php/conf.d/app.ini

EXPOSE 80
ENTRYPOINT apache2-foreground

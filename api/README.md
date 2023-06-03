# PBSC-Tracker API

API pour PBSC-Tracker.

## Développement

1. Lancer un conteneur MariaDB sur le réseau 'mariadb'. Exemple de docker-compose:

    ```yml
    version: '3.1'

    services:
      mariadb:
        image: mariadb:latest
        restart: always
        environment:
          MARIADB_ROOT_PASSWORD: example
        hostname: dev.mysql
        volumes:
          - data:/var/lib/mysql
      phpmyadmin:
        image: phpmyadmin
        restart: always
        environment:
          PMA_HOST: dev.mysql
          UPLOAD_LIMIT: 50000000
          MEMORY_LIMIT: 50000000
        ports:
          - 3333:80

    networks:
      default:
        name: mariadb
        attachable: true

    volumes:
      data:
    ```

2. (conseillé) Créer une base de données `pbsctracker` et un utilisateur du même nom avec des droits SELECT et INSERT.
3. Créer un fichier `.env` et le remplir avec ces informations:

    ```env
    MYSQL_HOST=dev.mysql
    MYSQL_USER=pbsctracker
    MYSQL_PASS=pbsctracker
    MYSQL_DB=pbsctracker

    CITY=valence # *.publicbikesystem.net
    TIMEZONE_CORRECTION=PT0H
    ```

4. Lancer le script `dev.sh`:

    ```bash
    bash dev.sh
    ```

## Production

```yml
version: '3'

services:
  pbsctracker-api:
    image: ghcr.io/mathieu2301/pbsctracker-api:latest
    restart: always
    environment:
      - MYSQL_HOST=${MYSQL_HOST}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASS=${MYSQL_PASS}
      - MYSQL_DB=${MYSQL_DB}
      - CITY=${CITY}
      - TIMEZONE_CORRECTION=${TIMEZONE_CORRECTION}
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.pbsctracker-api.rule=Host(`${SERVER_URL}`)'
      - 'traefik.http.routers.pbsctracker-api.entrypoints=https'
    networks:
      - default
      - mariadb

networks:
  default:
    name: public
    external: true
  mariadb:
    external: true
```

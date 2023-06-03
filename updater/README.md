# PBSC-Tracker updater

Ce script permet de vérifier régulièrement (par défaut: 1 fois par seconde) les arrivées et départs de vélos dans les stations d'une ville en particulier et de demander à l'API de mettre à jour la base de données.

## Installation

```bash
yarn
```

## Configuration

Le script utilise les variables d'environnement suivantes:

```env
TRACKER_API=http://localhost:3000
CITY=valence
UPDATE_INTERVAL=10000
```

- `TRACKER_API` est l'URL de l'API du tracker. C'est l'API qui sera utilisée pour mettre à jour la base de données. Pour Valence, vous pouvez utiliser `https://libelostats.apis.colmon.fr`. Sinon vous pouvez utiliser l'API locale en lançant le tracker en local.
- `CITY` est le nom de la ville
- `UPDATE_INTERVAL` est l'intervalle de temps entre chaque mise à jour (en millisecondes). Optionnel, par défaut: 1000.

## Déploiement

Exemple de docker-compose:

```yml
version: '3'

services:
  pbsc-tracking-updater:
    image: ghcr.io/mathieu2301/pbsctracking-updater:latest
    restart: always
    environment:
      TRACKER_API: ${TRACKER_API}
      CITY: ${CITY}
      UPDATE_INTERVAL: ${UPDATE_INTERVAL}
```

## Développement

```bash
yarn dev
```

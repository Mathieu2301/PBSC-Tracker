# Google Maps Path Fetcher

Ce script permet de récupérer les temps de trajets théoriques entre toutes les stations d'une ville.

## Installation

```sh
yarn
```

## Utilisation

1. Créer un fichier `.env` avec les informations suivantes:

    ```env
    TRACKER_API=http://localhost:3000
    GMAPS_API_KEY=AAAA...
    CITY=valence
    ```

    - `TRACKER_API` est l'URL de l'API du tracker. L'API sera utilisée pour récupérer la liste des stations. Pour Valence, vous pouvez utiliser `https://libelostats.apis.colmon.fr`. Sinon vous pouvez utiliser l'API locale en lançant le tracker en local.
    - `GMAPS_API_KEY` est la clé d'API Google Maps
    - `CITY` est le nom de la ville

2. Lancer le script:

    ```sh
    yarn start
    ```

3. Le résultat est enregistré dans le fichier `{CITY}_paths_.json`. Vous pouvez désormais copier son contenu dans le fichier `paths.json` de l'API.

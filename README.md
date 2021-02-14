# PBSC Tracker
Expérience de tracking des vélos en libre service fonctionnants avec [PBSC](https://www.pbsc.com/fr)

Les données stockées sont celles de la ville de Valence dont le système utilisé est [Libélo](https://www.vrd-mobilites.fr/velo/).  
Les résultats de cette expérience sont disponibles sur [libelotracker.vercel.app](https://libelotracker.vercel.app/)

L'objectif de ce projet est de développer un algorithme de prédiction permettant de calculer,
lors du retrait d'un vélo, les probabilités des différentes destinations.

# Fonctionnement actuel

Un serveur se charge de récupérer la liste des stations et d'enregistrer le nombre de vélos lorsqu'il y a un changement.
En résulte donc l'évolution des quantités de vélos de chaques stations de laquelle on peut déduire une liste d'opérations entrées/sorties de vélos.
Pour émettre des hypothèses sur les trajets on procède de la manière suivante :

 **➜ Étape 1 : Premier balayage des trajets courts et directs**
 - Pour chaque arrivée dans une station, on regarde la liste des départs qui précèdent cette arrivée.
 - On élimine les départs qui mettraient plus de temps que le trajet théorique le plus élevé
 	(Pour Valence, le trajet "Portes-lès-Valence -> Romans" a une durée théorique de 1h30)
 - Pour chaque potentielle station départ, on compare le temps passé avec le temps de trajet théorique calculé par Google Maps ou autre système.
 - On trie les hypothèses (différence "réelle/théorique" la plus faible = probabilité plus élevée)
 - (Si l'hypothèse correspond à dire que la vitesse moyenne du cycliste était supérieure à 30km/h, on la considère directement fausse)
 - Les hypothèses de trajets cours sont prioritaires sur les trajets longs.
 
 **➜ Étape 2 : Résoudre les conflits**
 - Le premier balayage créera des conflits d'hypothèses.
 - Pour un conflit dans lequel plusieurs arrivées seraient affectées au même départ, c'est l'arrivée ayant le nombre d'hypothèses
 	**le plus faible** qui est prioritaire.

 **➜ Étape 3 : Allers-retours et grands détours**
 - Le premier balayage ne prend pas en compte les allers-retours et les grands détours. Ces types
 	de trajets serons ceux qui restent à traiter donc, si une arrivée n'a pas trouvé d'affectation à un départ :
 - On regarde les départs qui précèdent cette arrivée et qui mettraient **plus de temps** que le trajet théorique le plus élevé.
 - Les départs potentiels associés à ces arrivées seront triées dans l'ordre du trajet le plus court au trajet le plus long en
 	gardant l'hypothèse d'un aller-retour (qui sera donc le premier résultat).

# Participer

N'hésitez pas à créer une discussion [ici](https://github.com/Mathieu2301/PBSC-Tracker/discussions).  

Vous pouvez consulter :
 - Les résultats des expériences : [libelotracker.vercel.app](https://libelotracker.vercel.app/)
 - La liste des stations Libélo : [/getStations](https://libelostats.usp-3.fr/getStations)
 - Les données stockées en brut : [/getFullData](https://libelostats.usp-3.fr/getFullData)
 - L'historique des opérations : [/getLogs](https://libelostats.usp-3.fr/getLogs)

L'API PHP est hébergée sur [libelostats.usp-3.fr](https://libelostats.usp-3.fr/) et fonctionne avec le système [Libélo](https://www.vrd-mobilites.fr/velo/) de Valence.
Le script "/update" est automatiquement exécuté dès qu'un changement est détexté par le script "updater.js" pour assurer le suivi précis des données.

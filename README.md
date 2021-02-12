# Velib-Tracker
Outil de tracking pour les vélos en libre service fonctionnants avec instant-system.com

L'objectif de ce projet est de développer un algorithme de prédiction permettant de calculer,
lors du retrait d'un vélo, les probabilités des différentes destinations.

Pour cela, nous avons plusieurs pistes :

1. Définition du potentiel d'acceptation en fonction du temps (proabilité)  
    ➤ Probabilité qu'une station accueille un nouveau libélo en fonction du temps

2. Vitesse moyenne des trajets = 4 minutes/km (= 15km/h)  
	  ➤ 250 m/minute (+ ou - 50 m/min)  
    ➤ Utilisation :  
        Sur une carte, lorsqu'un vélo est retiré :  
        Dessiner un cercle autour de la station. Le cercle s'agrandit de 250m chaque minute  
        et définit donc la zone dans laquelle il est le plus probable que le vélo soit.

    ➜ (Prendre en compte, si possible, l'inertie au départ du trajet)  

# Participer

N'hésitez pas à créer une discussion [ici](https://github.com/Mathieu2301/Velib-Tracker/discussions).  

Vous pouvez consulter :
 - La liste des stations : [/getStations](https://libelostats.usp-3.fr/getStations)
 - Les données en brut : [/getFullData](https://libelostats.usp-3.fr/getFullData)
 - L'historique des actions : [/getLogs/text](https://libelostats.usp-3.fr/getLogs/text) (Texte) ou [/getLogs](https://libelostats.usp-3.fr/getLogs) (JSON)

L'API PHP est hébergée sur [libelostats.usp-3.fr](https://libelostats.usp-3.fr/) et fonctionne avec le système Libélo de Valence.
La partie "Auto fetch" est automatiquement exécutée 1 fois toutes les 60 secondes pour assurer le suivi et donc la qualité des données.

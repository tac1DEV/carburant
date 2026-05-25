# Feature – Carte des bornes fiables

## Objectif

Permettre à l’utilisateur de rechercher les bornes de recharge autour d’une ville ou d’un code postal, puis de distinguer les bornes réellement fiables grâce à un score de confiance.

L’idée n’est pas seulement d’afficher des bornes, mais d’aider l’utilisateur à choisir la meilleure borne selon :
- la distance ;
- la puissance ;
- le type de connecteur ;
- la disponibilité ;
- les signalements utilisateurs ;
- la fraîcheur des données.

## Contexte

Les données IRVE peuvent contenir des informations statiques comme la localisation, les connecteurs ou la puissance, ainsi que des données dynamiques liées à l’état ou à la disponibilité des points de recharge.

Dans AUTOnomie, cette feature complète le suivi énergétique en ajoutant une aide concrète à la recharge.

## Nom de la feature

**Bornes fiables**

## Pages concernées

- `/bornes`
- `/bornes/{id}`
- `/bornes/favorites`

## Fonctionnalités principales

### 1. Recherche par ville ou code postal

L’utilisateur peut saisir :
- un code postal ;
- une ville ;
- une adresse approximative.

L’application récupère les coordonnées GPS de la zone puis affiche les bornes dans un rayon choisi.

Rayons proposés :
- 5 km ;
- 10 km ;
- 20 km ;
- 30 km ;
- 50 km.

### 2. Affichage sur carte

Les bornes sont affichées sur une carte interactive.

Chaque marqueur change de couleur selon le score :

- :green_circle: 80–100 : borne fiable ;
- :yellow_circle: 60–79 : borne correcte ;
- :orange_circle: 40–59 : borne risquée ;
- :red_circle: 0–39 : borne à éviter.

### 3. Score de fiabilité

Chaque borne possède un score sur 100.

Exemple :

```txt
Score = disponibilité + état + puissance + fraîcheur des données + avis utilisateurs + signalements
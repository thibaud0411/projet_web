
  # Mon Miam Miam Web App

  This is a code bundle for Mon Miam Miam App Design. 

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

Mon Miam Miam est une application web moderne conçue pour simplifier la commande de repas au sein d'une institution (cantine universitaire, entreprise, etc.). Elle propose une interface utilisateur réactive et une gestion des accès basée sur différents rôles (Visiteur, Étudiant, Employé et Administrateur).

Ce projet est développé en React et stylisé avec le framework Tailwind CSS.

Cette partie du dépôt contient le code pour l'interface utilisateur publique de l'application, accessible à tous les visiteurs non connectés (guest).

Elle inclut :

Le système de navigation central (App.tsx).

La structure et le stylisme des pages suivantes :

Page d'Accueil (HomePage)

Page du Menu (MenuPage)

Processus de Commande (CheckoutPage)

Pages de Connexion/Inscription (LoginPage, SignupPage)

 Démarrage Rapide
Suivez ces étapes pour installer et lancer l'application sur votre machine locale à des fins de développement.

Pré-requis
Vous devez avoir installé sur votre machine :

Node.js (recommandé : version LTS, ex: 18.x ou 20.x)

npm  (gestionnaire de paquets)

Installation
Cloner le dépôt :

Bash

git clone https://git-scm.com/book/fr/v2/Les-bases-de-Git-D%C3%A9marrer-un-d%C3%A9p%C3%B4t-Git
cd mon-miam-miam
Installer les dépendances :

Bash

npm install

Bash

npm run dev

L'application sera accessible dans votre navigateur à l'adresse suivante : http://localhost:5173/ (ou un port similaire).

Technologies Utilisées
Frontend :  React (avec Vite ou Create React App)

Langage : TypeScript

Stylisme : Tailwind CSS (pour une approche utility-first)

 Structure du Projet
Les fichiers clés pour l'interface Visiteur sont :

Dossier/Fichier	Description
src/App.tsx	Le routeur central et le gestionnaire d'état de la page active.
src/main.tsx	Le point d'entrée de l'application.
src/components/	Contient tous les composants React (HomePage, MenuPage, etc.).
src/index.css	Le fichier principal où Tailwind CSS est importé et configuré.
README.md	Ce fichier.
Attributions.md	Crédits des ressources externes utilisées.


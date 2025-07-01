# CopyMe API

API backend pour l'application CopyMe, développée avec Node.js, Express, TypeScript et MongoDB.

## Prérequis

- Node.js (v14+)
- MongoDB (locale ou distante)
- npm ou yarn

## Installation

1. Cloner le dépôt
```bash
git clone <url_du_repo>
cd backend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/copymedb
JWT_SECRET=votre_secret_jwt_ultra_securise
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Démarrer le serveur en mode développement
```bash
npm run dev
```

## Endpoints API

### Authentification

- `POST /api/auth/register` - Enregistrement d'un nouvel utilisateur
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/auth/login` - Connexion d'un utilisateur
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/profile` - Récupération du profil utilisateur (JWT requis)

### Gestion des Clients

- `GET /api/clients` - Liste des clients
- `GET /api/clients/:id` - Récupération des informations d'un client spécifique
- `POST /api/clients` - Création d'un nouveau client
  ```json
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    },
    "notes": "Notes sur le client"
  }
  ```
- `PUT /api/clients/:id` - Mise à jour d'un client
- `DELETE /api/clients/:id` - Suppression d'un client

### Gestion des Exercices

- `GET /api/exercises` - Liste des exercices
- `GET /api/exercises/:id` - Récupération des informations d'un exercice
- `POST /api/exercises` - Création d'un nouvel exercice (admin uniquement)
  ```json
  {
    "name": "Squat",
    "description": "Un exercice pour les jambes",
    "category": "Jambes",
    "difficulty": "intermédiaire",
    "instructions": "Instructions détaillées pour réaliser l'exercice...",
    "targetMuscles": ["Quadriceps", "Fessiers", "Ischio-jambiers"],
    "equipment": ["Aucun", "Haltères"]
  }
  ```
- `PUT /api/exercises/:id` - Mise à jour d'un exercice (admin uniquement)
- `DELETE /api/exercises/:id` - Suppression d'un exercice (admin uniquement)

### Gestion des Images

- `GET /api/data/images` - Récupération des données des images traitées
- `GET /api/data/images/:id` - Récupération des données d'une image traitée spécifique
- `POST /api/data/images` - Envoi d'une nouvelle image pour traitement (utiliser multipart/form-data avec un champ 'image')

## Authentification

L'API utilise JSON Web Tokens (JWT) pour l'authentification. Pour accéder aux routes protégées, vous devez inclure un token JWT dans l'en-tête de vos requêtes :

```
Authorization: Bearer <votre_token_jwt>
```

## Déploiement

Pour déployer en production :
```bash
npm run build
npm start
```

## Licence

[MIT](LICENSE) 
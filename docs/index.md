# Documentation des Services

Cette documentation détaille les services disponibles dans l'application backend.

## Services disponibles

- [Service Utilisateurs](./users-service.md) - Gestion des utilisateurs et authentification
- [Service Exercices](./exercises-service.md) - Gestion des exercices (CRUD)

## Résumé des Endpoints API

### Authentification et Utilisateurs

| Endpoint | Méthode | Description | Authentification |
|----------|---------|-------------|-----------------|
| `/api/auth/register` | POST | Création d'un nouvel utilisateur | Non |
| `/api/auth/login` | POST | Authentification et obtention du token | Non |
| `/api/users/profile` | GET | Récupération des informations de profil | Oui |

### Exercices

| Endpoint | Méthode | Description | Authentification |
|----------|---------|-------------|-----------------|
| `/api/exercises` | GET | Récupération de tous les exercices | Non |
| `/api/exercises/:id` | GET | Récupération d'un exercice par ID | Non |
| `/api/exercises` | POST | Création d'un nouvel exercice | Oui |
| `/api/exercises/:id` | PUT | Mise à jour d'un exercice | Oui (Admin) |
| `/api/exercises/:id` | DELETE | Suppression d'un exercice | Oui (Admin) |

## Format des Requêtes et Réponses

Tous les endpoints API acceptent et renvoient des données au format JSON.

### Exemple de requête

```javascript
// Exemple de requête POST pour créer un exercice
fetch('/api/exercises', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    title: 'Nouvel exercice',
    description: 'Description de l\'exercice',
    difficulty: 'medium',
    category: 'cardio',
    duration: 30
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

### Exemple de réponse

```json
{
  "status": "success",
  "message": "Exercise created successfully",
  "data": {
    "_id": "6151f5d2e14d8a2e9c8c5678",
    "title": "Nouvel exercice",
    "description": "Description de l'exercice",
    "difficulty": "medium",
    "category": "cardio",
    "duration": 30,
    "createdAt": "2023-04-15T08:30:00.000Z",
    "updatedAt": "2023-04-15T08:30:00.000Z"
  }
}
```

## Structure des réponses

Tous les services suivent une structure de réponse cohérente:

```typescript
{
  status: string,     // 'success' ou 'error'
  message: string,    // Description du résultat
  data?: any,         // Données retournées (si présentes)
  error?: any         // Détails de l'erreur (en cas d'échec)
}
```

## Authentification

L'API utilise l'authentification JWT (JSON Web Token) pour sécuriser les routes protégées.

### Processus d'authentification

1. L'utilisateur s'authentifie via `/api/auth/login` et reçoit un token JWT
2. Le token doit être inclus dans l'en-tête `Authorization` de toutes les requêtes authentifiées
3. Format: `Authorization: Bearer {token}`

### Routes protégées nécessitant un token JWT

| Route | Méthode HTTP | Authentification requise |
|-------|-------------|--------------------|
| `/api/auth/login` | POST | Non |
| `/api/auth/register` | POST | Non |
| `/api/users/profile` | GET | Oui |
| `/api/exercises` (liste) | GET | Non |
| `/api/exercises/{id}` (détail) | GET | Non |
| `/api/exercises` (création) | POST | Oui |
| `/api/exercises/{id}` (modification) | PUT | Oui |
| `/api/exercises/{id}` (suppression) | DELETE | Oui |
| Toutes les routes admin | * | Oui + Rôle Admin |

Pour plus de détails sur l'utilisation des tokens, consultez la [section sur l'utilisation du Token JWT](./users-service.md#utilisation-du-token-jwt).

## Modèles de données

Les services s'appuient sur les modèles suivants:

### User
- `email` - Email unique de l'utilisateur
- `password` - Mot de passe hashé
- `firstname` - Prénom
- `lastname` - Nom de famille
- `role` - Rôle utilisateur

Pour plus de détails, voir la [documentation complète du modèle User](./users-service.md#structure-du-modèle-user).

### Exercise
- `title` - Titre de l'exercice
- `description` - Description détaillée
- `difficulty` - Niveau de difficulté
- `category` - Catégorie d'exercice
- `duration` - Durée en minutes

Pour plus de détails, voir la [documentation complète du modèle Exercise](./exercises-service.md#structure-du-modèle-exercise).

## Validation des données

- Le service `Exercises` utilise une validation via le schéma `ValidateExercise`
- Les mots de passe utilisateurs sont hachés avec bcrypt

## Utilisation générale

Importez les services nécessaires dans vos contrôleurs ou routes:

```typescript
import { createUser, authenticateUser } from '../services/users';
import { getAllExercises, createExercise } from '../services/excercices';
``` 
# Documentation du Service Exercises

## Vue d'ensemble

Le service `Exercises` fournit des fonctions CRUD (Create, Read, Update, Delete) pour gérer les exercices dans l'application. Chaque opération inclut une validation des données et gère les erreurs de manière cohérente.

## Endpoints API

| Endpoint | Méthode | Description | Authentification |
|----------|---------|-------------|-----------------|
| `/api/exercises` | GET | Récupération de tous les exercices | Non |
| `/api/exercises/:id` | GET | Récupération d'un exercice par ID | Non |
| `/api/exercises` | POST | Création d'un nouvel exercice | Oui |
| `/api/exercises/:id` | PUT | Mise à jour d'un exercice | Oui (Admin) |
| `/api/exercises/:id` | DELETE | Suppression d'un exercice | Oui (Admin) |

## Structure du modèle Exercise

Le modèle `Exercise` contient les propriétés suivantes:

| Propriété | Type | Description | Requis |
|-----------|------|-------------|--------|
| title | String | Titre de l'exercice | Oui |
| description | String | Description détaillée de l'exercice | Oui |
| difficulty | String | Niveau de difficulté (ex: 'easy', 'medium', 'hard') | Oui |
| category | String | Catégorie d'exercice (ex: 'cardio', 'musculation') | Oui |
| duration | Number | Durée estimée en minutes | Oui |
| caloriesBurned | Number | Estimation des calories brûlées | Non |
| mediaUrl | String | URL vers une image ou vidéo de démonstration | Non |
| createdAt | Date | Date de création | Auto |
| updatedAt | Date | Date de dernière mise à jour | Auto |

## Validation des données

Toutes les données sont validées avec le schéma `ValidateExercise` qui définit:
- Les champs obligatoires et optionnels
- Les contraintes de format et de longueur
- Les valeurs par défaut

## Exigences d'authentification

| Fonction | Authentification requise | Rôle requis |
|----------|--------------------------|------------|
| getAllExercises | Non | - |
| getExerciseById | Non | - |
| createExercise | Oui | Utilisateur ou Admin |
| updateExercise | Oui | Admin uniquement |
| deleteExercise | Oui | Admin uniquement |

Pour plus d'informations sur l'authentification, consultez la [documentation d'authentification](./users-service.md#utilisation-du-token-jwt).

## Fonctions

### createExercise(data)

Crée un nouvel exercice dans la base de données après validation des données.

**Endpoint API**: `POST /api/exercises`

**En-têtes (Headers):**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Données d'entrée (Request):**
```json
{
  "title": "Exercice de musculation",
  "description": "Description détaillée de l'exercice",
  "difficulty": "medium",
  "category": "musculation",
  "duration": 30,
  "caloriesBurned": 250,
  "mediaUrl": "https://example.com/exercises/push-up.mp4"
}
```

**Données de sortie (Response) - Succès (201):**
```json
{
  "status": "success",
  "message": "Exercise created successfully",
  "data": {
    "_id": "6151f5d2e14d8a2e9c8c5678",
    "title": "Exercice de musculation",
    "description": "Description détaillée de l'exercice",
    "difficulty": "medium",
    "category": "musculation",
    "duration": 30,
    "caloriesBurned": 250,
    "mediaUrl": "https://example.com/exercises/push-up.mp4",
    "createdAt": "2023-04-15T08:30:00.000Z",
    "updatedAt": "2023-04-15T08:30:00.000Z"
  }
}
```

**Données de sortie (Response) - Erreur (400/401/500):**
```json
{
  "status": "error",
  "message": "Failed to create exercise",
  "error": "Validation error: title is required"
}
```

**Authentification**: Requise (accessToken JWT)

**Paramètres:**
- `data` (Object): Données de l'exercice à créer
  - `title` (String): Titre de l'exercice
  - `description` (String): Description détaillée
  - `difficulty` (String): Niveau de difficulté
  - `category` (String): Catégorie d'exercice
  - `duration` (Number): Durée en minutes
  - `caloriesBurned` (Number, optionnel): Calories brûlées estimées
  - `mediaUrl` (String, optionnel): URL de média

**Retourne:**
- `Object`: Résultat de l'opération
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (Object): Données de l'exercice créé (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await createExercise({
  title: 'Exercice de musculation',
  description: 'Description détaillée de l'exercice',
  difficulty: 'medium',
  category: 'musculation',
  duration: 30,
  caloriesBurned: 250,
  mediaUrl: 'https://example.com/exercises/push-up.mp4'
});
```

### getExerciseById(id)

Récupère un exercice spécifique par son ID.

**Endpoint API**: `GET /api/exercises/:id`

**Paramètres d'URL:**
- `:id` - ID de l'exercice à récupérer

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "Exercise retrieved successfully",
  "data": {
    "_id": "6151f5d2e14d8a2e9c8c5678",
    "title": "Exercice de musculation",
    "description": "Description détaillée de l'exercice",
    "difficulty": "medium",
    "category": "musculation",
    "duration": 30,
    "caloriesBurned": 250,
    "mediaUrl": "https://example.com/exercises/push-up.mp4",
    "createdAt": "2023-04-15T08:30:00.000Z",
    "updatedAt": "2023-04-15T08:30:00.000Z"
  }
}
```

**Données de sortie (Response) - Erreur (404/500):**
```json
{
  "status": "error",
  "message": "Failed to retrieve exercise",
  "error": "Exercise not found"
}
```

**Paramètres:**
- `id` (String): ID de l'exercice à récupérer

**Retourne:**
- `Object`: Résultat de la récupération
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (Object): Données de l'exercice (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await getExerciseById('6151f5d2e14d8a2e9c8c1234');
```

### getAllExercises()

Récupère tous les exercices disponibles dans la base de données.

**Endpoint API**: `GET /api/exercises`

**Paramètres de requête (Query Parameters) - Optionnels:**
```
?category=cardio
?difficulty=easy
?limit=10
?page=1
```

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "Exercises retrieved successfully",
  "data": [
    {
      "_id": "6151f5d2e14d8a2e9c8c5678",
      "title": "Exercice de musculation",
      "description": "Description détaillée de l'exercice",
      "difficulty": "medium",
      "category": "musculation",
      "duration": 30,
      "caloriesBurned": 250,
      "mediaUrl": "https://example.com/exercises/push-up.mp4",
      "createdAt": "2023-04-15T08:30:00.000Z",
      "updatedAt": "2023-04-15T08:30:00.000Z"
    },
    // ... autres exercices
  ]
}
```

**Données de sortie (Response) - Erreur (500):**
```json
{
  "status": "error",
  "message": "Failed to retrieve exercises",
  "error": "Database connection error"
}
```

**Paramètres:**
- Aucun

**Retourne:**
- `Object`: Résultat de la récupération
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (Array): Liste des exercices (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await getAllExercises();
```

### updateExercise(id, data)

Met à jour un exercice existant après validation des données.

**Endpoint API**: `PUT /api/exercises/:id`

**En-têtes (Headers):**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Paramètres d'URL:**
- `:id` - ID de l'exercice à mettre à jour

**Données d'entrée (Request):**
```json
{
  "title": "Nouveau titre d'exercice",
  "description": "Nouvelle description",
  "difficulty": "hard",
  "duration": 45
}
```

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "Exercise updated successfully",
  "data": {
    "_id": "6151f5d2e14d8a2e9c8c5678",
    "title": "Nouveau titre d'exercice",
    "description": "Nouvelle description",
    "difficulty": "hard",
    "category": "musculation",
    "duration": 45,
    "caloriesBurned": 250,
    "mediaUrl": "https://example.com/exercises/push-up.mp4",
    "createdAt": "2023-04-15T08:30:00.000Z",
    "updatedAt": "2023-04-15T09:45:00.000Z"
  }
}
```

**Données de sortie (Response) - Erreur (400/401/403/404/500):**
```json
{
  "status": "error",
  "message": "Failed to update exercise",
  "error": "Exercise not found or unauthorized"
}
```

**Authentification**: Requise (accessToken JWT avec rôle Admin)

**Paramètres:**
- `id` (String): ID de l'exercice à mettre à jour
- `data` (Object): Nouvelles données de l'exercice (mêmes propriétés que pour createExercise)

**Retourne:**
- `Object`: Résultat de la mise à jour
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (Object): Données mises à jour de l'exercice (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await updateExercise('6151f5d2e14d8a2e9c8c1234', {
  title: 'Nouveau titre d'exercice',
  description: 'Nouvelle description',
  difficulty: 'hard',
  duration: 45
});
```

### deleteExercise(id)

Supprime un exercice de la base de données.

**Endpoint API**: `DELETE /api/exercises/:id`

**En-têtes (Headers):**
```
Authorization: Bearer {token}
```

**Paramètres d'URL:**
- `:id` - ID de l'exercice à supprimer

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "Exercise deleted successfully"
}
```

**Données de sortie (Response) - Erreur (401/403/404/500):**
```json
{
  "status": "error",
  "message": "Failed to delete exercise",
  "error": "Exercise not found or unauthorized"
}
```

**Authentification**: Requise (accessToken JWT avec rôle Admin)

**Paramètres:**
- `id` (String): ID de l'exercice à supprimer

**Retourne:**
- `Object`: Résultat de la suppression
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await deleteExercise('6151f5d2e14d8a2e9c8c1234');
```

## Notes

- Le service utilise le modèle `Exercise` pour interagir avec la base de données
- Toutes les données entrantes sont validées avec le schéma `ValidateExercise` de Joi
- Les opérations CRUD renvoient des formats de réponse standardisés
- La mise à jour (`updateExercise`) retourne le document mis à jour avec l'option `{ new: true }` 
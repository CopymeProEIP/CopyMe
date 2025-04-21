# Documentation du Service Exercises

## Vue d'ensemble

Le service `Exercises` fournit des fonctions CRUD (Create, Read, Update, Delete) pour gérer les exercices dans l'application. Chaque opération inclut une validation des données et gère les erreurs de manière cohérente.

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

## Fonctions

### createExercise(data)

Crée un nouvel exercice dans la base de données après validation des données.

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
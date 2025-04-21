# Documentation des Services

Cette documentation détaille les services disponibles dans l'application backend.

## Services disponibles

- [Service Utilisateurs](./users-service.md) - Gestion des utilisateurs et authentification
- [Service Exercices](./exercises-service.md) - Gestion des exercices (CRUD)

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
# Documentation du Service Users

## Vue d'ensemble

Le service `Users` fournit des fonctions pour gérer l'authentification et les opérations liées aux utilisateurs dans l'application. Il permet la création, l'authentification et la récupération d'informations des utilisateurs.

## Endpoints API

| Endpoint | Méthode | Description | Authentification |
|----------|---------|-------------|-----------------|
| `/api/auth/register` | POST | Création d'un nouvel utilisateur | Non |
| `/api/auth/login` | POST | Authentification et obtention du token | Non |
| `/api/users/profile` | GET | Récupération des informations de profil | Oui |

## Structure du modèle User

Le modèle `User` contient les propriétés suivantes:

| Propriété | Type | Description | Requis |
|-----------|------|-------------|--------|
| email | String | Adresse email de l'utilisateur (unique) | Oui |
| password | String | Mot de passe hashé de l'utilisateur | Oui |
| firstname | String | Prénom de l'utilisateur | Oui |
| lastname | String | Nom de famille de l'utilisateur | Oui |
| role | String | Rôle de l'utilisateur (ex: 'user', 'admin') | Oui |
| createdAt | Date | Date de création du compte | Auto |
| updatedAt | Date | Date de dernière mise à jour | Auto |

## Utilisation du Token JWT

Le token JWT (JSON Web Token) généré par la fonction `authenticateUser` doit être utilisé pour accéder aux routes protégées de l'API.

### Format du token
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Comment utiliser le token

1. **Inclusion dans les en-têtes HTTP**:
   ```javascript
   const headers = {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   };
   ```

2. **Routes nécessitant une authentification**:
   - Toutes les routes commençant par `/api/users/` (excepté login et register)
   - Toutes les routes de création/modification/suppression d'exercices
   - Toutes les routes d'administration

3. **Durée de validité**: Le token expire après 1 heure, nécessitant une nouvelle authentification.

4. **Gestion des erreurs**: Si le token est invalide ou expiré, l'API renverra une erreur 401 (Unauthorized).

### Exemple d'utilisation complète

```typescript
// 1. Authentification pour obtenir le token
const authResult = await authenticateUser({
  email: 'user@example.com',
  password: 'password123'
});

// 2. Stockage du token (par exemple dans localStorage ou un état React)
const token = authResult.data;

// 3. Utilisation du token pour une requête authentifiée
const userInfoResult = await fetch('/api/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Fonctions

### generateToken(user)

Génère un token JWT (JSON Web Token) pour l'authentification de l'utilisateur.

**Paramètres:**
- `user` (Object): Objet utilisateur contenant au moins les propriétés `_id` et `role`

**Retourne:**
- `String`: Token JWT signé

**Utilisation:**
```typescript
const token = generateToken(user);
```

### createUser(data)

Crée un nouvel utilisateur dans la base de données.

**Endpoint API**: `POST /api/auth/register`

**Données d'entrée (Request):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstname": "John",
  "lastname": "Doe",
  "role": "user"
}
```

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "_id": "6151f5d2e14d8a2e9c8c1234",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "role": "user",
    "createdAt": "2023-04-15T08:30:00.000Z",
    "updatedAt": "2023-04-15T08:30:00.000Z"
  }
}
```

**Données de sortie (Response) - Erreur (400/500):**
```json
{
  "status": "error",
  "message": "Failed to create user",
  "error": "Email already exists"
}
```

**Paramètres:**
- `data` (Object): Données de l'utilisateur à créer
  - `email` (String): Email unique de l'utilisateur
  - `password` (String): Mot de passe (sera hashé)
  - `firstname` (String): Prénom de l'utilisateur
  - `lastname` (String): Nom de famille de l'utilisateur
  - `role` (String): Rôle de l'utilisateur (par défaut: 'user')

**Retourne:**
- `Object`: Résultat de l'opération
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (Object): Données de l'utilisateur créé (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await createUser({
  email: 'user@example.com',
  password: 'password123',
  firstname: 'John',
  lastname: 'Doe',
  role: 'user'
});
```

### authenticateUser(data)

Authentifie un utilisateur en vérifiant son email et son mot de passe.

**Endpoint API**: `POST /api/auth/login`

**Données d'entrée (Request):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "User authenticated successfully",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNTFmNWQyZTE0ZDhhMmU5YzhjMTIzNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjE1NDkwMjAwLCJleHAiOjE2MTU0OTM4MDB9.7Hb1tObqgLFN5fj9jFzuYYN6jvPHn06aNRZUWWH2UcQ"
}
```

**Données de sortie (Response) - Erreur (400/401):**
```json
{
  "status": "error",
  "message": "Invalid password"
}
```

**Paramètres:**
- `data` (Object): Données d'authentification
  - `email` (String): Email de l'utilisateur
  - `password` (String): Mot de passe de l'utilisateur

**Retourne:**
- `Object`: Résultat de l'authentification
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (String): Token JWT (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await authenticateUser({
  email: 'user@example.com',
  password: 'password123'
});
```

### getUserInformation(data)

Récupère les informations d'un utilisateur en fonction de son ID.

**Endpoint API**: `GET /api/users/profile`

**En-têtes (Headers):**
```
Authorization: Bearer {token}
```

**Données de sortie (Response) - Succès (200):**
```json
{
  "status": "success",
  "message": "User information retrieved successfully",
  "data": {
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

**Données de sortie (Response) - Erreur (401/404):**
```json
{
  "status": "error",
  "message": "Failed to get user information",
  "error": "User not found"
}
```

**Paramètres:**
- `data` (Object): Données de requête
  - `id` (String): ID de l'utilisateur

**Retourne:**
- `Object`: Résultat de la récupération
  - `status` (String): 'success' ou 'error'
  - `message` (String): Description du résultat
  - `data` (Object): Informations de l'utilisateur (en cas de succès)
  - `error` (Object): Détails de l'erreur (en cas d'échec)

**Utilisation:**
```typescript
const result = await getUserInformation({
  id: '6151f5d2e14d8a2e9c8c1234'
});
```

## Notes

- Le service utilise le modèle `User` pour interagir avec la base de données
- Les mots de passe sont hachés avec bcrypt
- Les tokens JWT expirent après 1 heure 
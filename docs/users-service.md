# Documentation du Service Users

## Vue d'ensemble

Le service `Users` fournit des fonctions pour gérer l'authentification et les opérations liées aux utilisateurs dans l'application. Il permet la création, l'authentification et la récupération d'informations des utilisateurs.

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
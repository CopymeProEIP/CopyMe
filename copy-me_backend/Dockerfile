# Image de base pour la construction
FROM node:20-alpine AS builder

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Compiler le TypeScript
RUN npm run build

# Image de production
FROM node:20-alpine

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm install --only=production

# Copier les fichiers compilés depuis l'étape de construction
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

# Créer le dossier uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/server.js"] 
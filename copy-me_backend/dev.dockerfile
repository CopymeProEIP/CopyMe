# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy all source code
COPY . .

# Expose the application's port
EXPOSE 3000

# Enable hot reload with nodemon (if configured)
CMD ["npm", "run", "dev"]

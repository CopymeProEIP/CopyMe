import axios from 'axios';

// Détermine si nous sommes sur le serveur ou le client
const isServer = typeof window === 'undefined';

// Choisit l'URL de base en fonction de l'environnement
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Crée une instance axios avec une configuration personnalisée
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour la gestion des erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error);
    
    // Gestion spécifique de l'erreur ECONNREFUSED
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.error('Connexion refusée - Le serveur backend est-il en cours d\'exécution?');
      return Promise.reject(new Error('Le serveur backend n\'est pas accessible. Veuillez vérifier qu\'il est en cours d\'exécution.'));
    }
    
    return Promise.reject(error);
  }
);

// Log de l'URL de base pour le débogage
console.log(`[Axios] URL de base: ${baseURL}`);

export default axiosInstance;
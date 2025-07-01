/** @format */

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ApiOptions {
	url: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: any;
	headers?: Record<string, string>;
	requiresAuth?: boolean;
}

export function useApi() {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const callApi = async <T>({
		url,
		method = 'GET',
		body,
		headers = {},
		requiresAuth = false,
	}: ApiOptions): Promise<T | null> => {
		setIsLoading(true);

		try {
			// S'assurer que l'URL de base est définie
			const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
			const fullUrl = url.startsWith('http')
				? url
				: `${baseUrl}/${url.startsWith('/') ? url.substring(1) : url}`;

			const requestHeaders: Record<string, string> = {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...headers,
			};

			const options: RequestInit = {
				method,
				headers: requestHeaders,
				credentials: 'include', // Inclut les cookies pour l'authentification cross-origin
				mode: 'cors', // Active explicitement le mode CORS
				cache: 'no-cache', // Évite la mise en cache des requêtes
				redirect: 'follow', // Suit les redirections
				referrerPolicy: 'no-referrer',
			};

			if (body && method !== 'GET') {
				options.body = JSON.stringify(body);
			}

			const response = await fetch(fullUrl, options);

			// Vérifier si la réponse est en JSON avant de la parser
			const contentType = response.headers.get('content-type');
			let data;

			if (contentType && contentType.includes('application/json')) {
				data = await response.json();
			} else {
				data = { message: await response.text() };
			}

			if (!response.ok) {
				throw new Error(data.message || `Erreur ${response.status}`);
			}
			return data as T;
		} catch (error) {
			console.error('API error:', error);

			// Gestion spécifique des erreurs de connexion
			let errorMessage = 'Une erreur est survenue';

			if (error instanceof Error) {
				if (
					error.cause &&
					typeof error.cause === 'object' &&
					'code' in error.cause &&
					error.cause.code === 'ECONNREFUSED'
				) {
					errorMessage =
						"Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution.";
				} else {
					errorMessage = error.message;
				}
			}

			toast({
				title: 'Erreur',
				description: errorMessage,
				variant: 'destructive',
			});

			return null;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		callApi,
		isLoading,
	};
}

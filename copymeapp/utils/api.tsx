/** @format */

import { useAuthFetch } from './auth';
import { API_URL } from '@env';

// Base API URL
const API_BASE_URL = API_URL; // Adjust as needed


export function useApi() {
	const authFetch = useAuthFetch();

	// Generic GET request with authentication
	const get = async <T,>(endpoint: string, headers?: any): Promise<T> => {
		const response = await authFetch(`${API_BASE_URL}${endpoint}`, { headers: headers });
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Something went wrong');
		}

		return response.json();
	};

	// Generic POST request with authentication
	const post = async <T,>(endpoint: string, data: any): Promise<T> => {
		const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Something went wrong');
		}

		return response.json();
	};

	// Generic PUT request with authentication
	const put = async <T,>(endpoint: string, data: any): Promise<T> => {
		const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Something went wrong');
		}

		return response.json();
	};

	// Generic DELETE request with authentication
	const del = async <T,>(endpoint: string): Promise<T> => {
		const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Something went wrong');
		}

		return response.json();
	};

	// Upload file with authentication
	const uploadFile = async <T,>(
		endpoint: string,
		fileUri: string,
		fieldName: string = 'file',
		fileName?: string,
		fileType: string = 'video/mp4',
		additionalFields?: Record<string, string>,
	): Promise<T> => {
		// Créer un formData pour l'upload du fichier
		const formData = new FormData();

		// Obtenir le nom du fichier à partir de l'URI si non fourni
		const finalFileName = fileName || fileUri.split('/').pop() || `file_${Date.now()}`;

		// Ajouter le fichier au formData
		formData.append(fieldName, {
			uri: fileUri,
			name: finalFileName,
			type: fileType,
		} as any);

		// Ajouter les champs additionnels
		if (additionalFields) {
			Object.entries(additionalFields).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || `Upload failed with status ${response.status}`);
		}

		return response.json();
	};

	return {
		get,
		post,
		put,
		delete: del,
		uploadFile,
	};
}

/** @format */

import { useAuthFetch } from './auth';

// Base API URL
const API_BASE_URL = 'http://localhost:3000/api'; // Adjust as needed

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

	return {
		get,
		post,
		put,
		delete: del,
	};
}

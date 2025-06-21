/** @format */

import { getSession } from 'next-auth/react';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios, { AxiosError } from 'axios';
import axiosInstance from './axios';

export async function getAuthToken() {
	const session = await getSession();
	return session?.accessToken;
}

export async function fetchWithAuth(
	endpoint: string,
	options: {
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
		data?: any;
		headers?: Record<string, string>;
	} = {},
) {
	const token = await getAuthToken();
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	return axiosInstance({
		url: endpoint,
		method: options.method || 'GET',
		data: options.data,
		headers,
	});
}

// Exemple d'utilisation:
// const response = await fetchWithAuth('${process.env.NEXT_PUBLIC_API_BASE_URL}/protected-route');
// const data = await response.json();

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email', placeholder: 'hello@example.com' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {

					// Utiliser axiosInstance au lieu de fetch
					const response = await axiosInstance.post('/auth/login', {
						email: credentials.email,
						password: credentials.password,
					});

					return response.data;
				} catch (error: unknown) {
					console.error('Auth error:', error);

					// Gestion des erreurs axios
					if (axios.isAxiosError(error)) {
						const errorMessage =
							error.response?.data?.message || error.message || "Échec de l'authentification";
						throw new Error(errorMessage);
					} else if (error instanceof Error) {
						throw error;
					}

					return null;
				}
			},
		}),
	],
	pages: {
		signIn: '/login',
		error: '/login',
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 jours
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.token;
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = session.user || {};
			session.user.id = token.id as string;
			session.user.accessToken = token.accessToken as string;
			return session;
		},
	},
	debug: process.env.NODE_ENV === 'development',
};

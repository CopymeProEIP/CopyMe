/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

// Types
type User = {
	token: string;
};

type AuthContextType = {
	user: User | null;
	signIn: (token: string) => Promise<void>;
	signOut: () => Promise<void>;
	isLoading: boolean;
	authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

// Create the context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const segments = useSegments();

	// Authenticated fetch function
	const authFetch = async (url: string, options: RequestInit = {}) => {
		const token = user?.token || (await AsyncStorage.getItem('userToken'));

		// Merge headers with Authorization header
		const headers = {
			...options.headers,
			Authorization: token ? `Bearer ${token}` : '',
		};

		return fetch(url, {
			...options,
			headers,
		});
	};

	useEffect(() => {
		// Check if the user is authenticated when the component mounts
		const loadToken = async () => {
			const token = await AsyncStorage.getItem('userToken');
			if (token) {
				setUser({ token });
			}
			setIsLoading(false);
		};

		loadToken();
	}, []);

	// Listen for segment changes to handle protected routes
	useEffect(() => {
		if (!isLoading) {
			const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

			if (!user && !inAuthGroup && segments[0] !== undefined) {
				// If user is not authenticated and not on an auth screen, redirect to login
				router.replace('/login');
			} else if (user && inAuthGroup) {
				// If user is authenticated and on an auth screen, redirect to home
				router.replace('/(tabs)');
			}
		}
	}, [user, segments, isLoading]);

	const signIn = async (token: string) => {
		await AsyncStorage.setItem('userToken', token);
		setUser({ token });
	};

	const signOut = async () => {
		await AsyncStorage.removeItem('userToken');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, signIn, signOut, isLoading, authFetch }}>
			{children}
		</AuthContext.Provider>
	);
}

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Hook to protect routes
export function useProtectedRoute(isProtected: boolean) {
	const { user, isLoading } = useAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading) {
			const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
			if (isProtected && !user) {
				router.replace('/login');
			}
		}
	}, [user, segments, isLoading]);
}

// Utility function to make authenticated API calls
export const useAuthFetch = () => {
	const { authFetch } = useAuth();
	return authFetch;
};

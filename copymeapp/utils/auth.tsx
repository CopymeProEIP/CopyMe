/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
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
	const navigation = useNavigation();

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
	const navigation = useNavigation();
	const route = useRoute();

	useEffect(() => {
		if (!isLoading) {
			const routeName = route.name;
			const inAuthGroup = routeName === 'Login' || routeName === 'Register';
			if (isProtected && !user) {
				(navigation as any).replace('Login');
			}
		}
	}, [user, route.name, isLoading]);
}

// Utility function to make authenticated API calls
export const useAuthFetch = () => {
	const { authFetch } = useAuth();
	return authFetch;
};

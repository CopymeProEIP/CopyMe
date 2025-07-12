/** @format */

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock } from 'lucide-react-native';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import color from '@/app/theme/color';
import { API_URL } from '@env';
import { useAuth } from '@/utils/auth';

export default function LoginScreen() {
	const navigation = useNavigation();
	const [email, setEmail] = useState('idriss.said@epitech.eu');
	const [password, setPassword] = useState('qwerty');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const { signIn } = useAuth();

	const handleLogin = async () => {
		if (!email || !password) {
			setError('Please fill in all fields');
			return;
		}

		setError('');
		setIsLoading(true);

		try {
			const response = await fetch(API_URL + '/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Login failed');
			}
			if (!data.token) {
				throw new Error('No token received');
			}
			// Store the JWT token for future authenticated requests
			await signIn(data.token);

			// Navigate to the main app
			(navigation as any).replace('Main');
		} catch (err) {
			console.error('Login error:', err);
			setError(err instanceof Error ? err.message : 'Invalid email or password');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}>
			<ThemedView style={styles.content}>
				{/* <Image
					source={require('@/assets/images/logo.png')}
					style={styles.logo}
					resizeMode='contain'
				/> */}
				<ThemedText type='title' style={styles.title}>
					CopyMe
				</ThemedText>

				<ThemedText type='title' style={styles.title}>
					Welcome Back
				</ThemedText>
				<ThemedText type='description' style={styles.subtitle}>
					Sign in to continue your training journey
				</ThemedText>

				{error ? (
					<ThemedView style={styles.errorContainer}>
						<ThemedText style={styles.errorText}>{error}</ThemedText>
					</ThemedView>
				) : null}

				<ThemedView style={styles.form}>
					<ThemedView style={styles.inputContainer}>
						<Mail color={color.colors.textPrimary} size={20} style={styles.inputIcon} />
						<TextInput
							placeholder='Email Address'
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							autoCapitalize='none'
							keyboardType='email-address'
						/>
					</ThemedView>

					<ThemedView style={styles.inputContainer}>
						<Lock color={color.colors.textPrimary} size={20} style={styles.inputIcon} />
						<TextInput
							placeholder='Password'
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							secureTextEntry
						/>
					</ThemedView>

					<TouchableOpacity>
						<ThemedText style={styles.forgotPassword}>Forgot password?</ThemedText>
					</TouchableOpacity>

					<Button onPress={handleLogin} title='Login' loading={isLoading} style={styles.button} />
				</ThemedView>

				<ThemedView style={styles.footer}>
					<ThemedText type='default'>Don't have an account? </ThemedText>
					<TouchableOpacity onPress={() => (navigation as any).navigate('Register')}>
						<ThemedText style={styles.registerLink}>Register</ThemedText>
					</TouchableOpacity>
				</ThemedView>
			</ThemedView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 24,
		justifyContent: 'center',
	},
	logo: {
		width: 100,
		height: 100,
		alignSelf: 'center',
		marginBottom: 24,
	},
	title: {
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		textAlign: 'center',
		marginBottom: 32,
		opacity: 0.7,
	},
	form: {
		gap: 16,
		marginBottom: 24,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: color.colors.border,
		borderRadius: 8,
		paddingHorizontal: 12,
		height: 50,
	},
	inputIcon: {
		marginRight: 10,
		opacity: 0.7,
	},
	input: {
		flex: 1,
		height: '100%',
	},
	forgotPassword: {
		textAlign: 'right',
		color: color.colors.primary,
	},
	button: {
		marginTop: 16,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 24,
	},
	registerLink: {
		color: color.colors.primary,
		fontWeight: 'bold',
	},
	errorContainer: {
		backgroundColor: 'rgba(255, 0, 0, 0.1)',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	errorText: {
		color: 'red',
		textAlign: 'center',
	},
});

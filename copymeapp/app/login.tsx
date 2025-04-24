/** @format */

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('idriss.said@epitech.eu');
	const [password, setPassword] = useState('qwerty');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleLogin = async () => {
		if (!email || !password) {
			setError('Please fill in all fields');
			return;
		}

		setError('');
		setIsLoading(true);

		try {
			const response = await fetch('http://localhost:3000/api/auth/login', {
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
			console.log('Login response:', data.data);
			if (!data.data) {
				throw new Error('No token received');
			}
			// Store the JWT token for future authenticated requests
			await AsyncStorage.setItem('userToken', data.data);
			console.log('Authentication successful, token stored');

			// Navigate to the main app
			router.replace('/(tabs)');
		} catch (error) {
			console.error('Login error:', error);
			setError(error instanceof Error ? error.message : 'Invalid email or password');
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
						<Mail color={Colors.light.text} size={20} style={styles.inputIcon} />
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
						<Lock color={Colors.light.text} size={20} style={styles.inputIcon} />
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
					<Link href='/register' asChild>
						<TouchableOpacity>
							<ThemedText style={styles.registerLink}>Register</ThemedText>
						</TouchableOpacity>
					</Link>
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
		borderColor: Colors.light.border,
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
		color: Colors.light.principal,
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
		color: Colors.light.principal,
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

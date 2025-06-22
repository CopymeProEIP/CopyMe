/** @format */

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, User } from 'lucide-react-native';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import color from '@/app/theme/color';

export default function RegisterScreen() {
	const navigation = useNavigation();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleRegister = async () => {
		if (!name || !email || !password || !confirmPassword) {
			setError('Please fill in all fields');
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		setError('');
		setIsLoading(true);

		try {
			const nameParts = name.trim().split(' ');
			const firstName = nameParts[0];
			const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

			const response = await fetch('http://57.128.44.19:3000/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					password,
					firstName,
					lastName,
					role: 'user', // Default role
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			// Store the JWT token if it's returned from registration
			// This could be in AsyncStorage or a state management solution
			// AsyncStorage.setItem('userToken', data.token);

			// Navigate to the main app
			(navigation as any).replace('Main');
		} catch (error) {
			console.error('Registration error:', error);
			setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}>
			<ThemedView style={styles.content}>
				<ThemedText type='title' style={styles.title}>
					CopyMe
				</ThemedText>

				<ThemedText type='title' style={styles.title}>
					Create Account
				</ThemedText>
				<ThemedText type='description' style={styles.subtitle}>
					Start your basketball training journey
				</ThemedText>

				{error ? (
					<ThemedView style={styles.errorContainer}>
						<ThemedText style={styles.errorText}>{error}</ThemedText>
					</ThemedView>
				) : null}

				<ThemedView style={styles.form}>
					<ThemedView style={styles.inputContainer}>
						<User color={color.colors.textPrimary} size={20} style={styles.inputIcon} />
						<TextInput
							placeholder='Full Name'
							style={styles.input}
							value={name}
							onChangeText={setName}
						/>
					</ThemedView>

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

					<ThemedView style={styles.inputContainer}>
						<Lock color={color.colors.textPrimary} size={20} style={styles.inputIcon} />
						<TextInput
							placeholder='Confirm Password'
							style={styles.input}
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry
						/>
					</ThemedView>

					<Button
						onPress={handleRegister}
						title='Register'
						loading={isLoading}
						style={styles.button}
					/>
				</ThemedView>

				<ThemedView style={styles.footer}>
					<ThemedText type='default'>Already have an account? </ThemedText>
					<TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
						<ThemedText style={styles.loginLink}>Login</ThemedText>
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
	button: {
		marginTop: 16,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 24,
	},
	loginLink: {
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

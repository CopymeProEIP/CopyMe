/** @format */

import React, { useState } from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';

export default function RegisterScreen() {
	const router = useRouter();
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
			// Split name into firstName and lastName (required by API)
			const nameParts = name.trim().split(' ');
			const firstName = nameParts[0];
			const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

			const response = await fetch('http://localhost:3000/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					password,
					firstName,
					lastName,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			// Store the JWT token if it's returned from registration
			// This could be in AsyncStorage or a state management solution
			// AsyncStorage.setItem('userToken', data.token);

			// For now, just console log the success
			console.log('Registration successful:', data);

			// Navigate to the main app
			router.replace('/(tabs)');
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
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<ThemedView style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<ArrowLeft color={Colors.light.text} size={24} />
					</TouchableOpacity>
				</ThemedView>

				<Image
					source={require('@/assets/images/logo.png')}
					style={styles.logo}
					resizeMode='contain'
				/>

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
						<User color={Colors.light.text} size={20} style={styles.inputIcon} />
						<TextInput
							placeholder='Full Name'
							style={styles.input}
							value={name}
							onChangeText={setName}
						/>
					</ThemedView>

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

					<ThemedView style={styles.inputContainer}>
						<Lock color={Colors.light.text} size={20} style={styles.inputIcon} />
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
					<Link href='/login' asChild>
						<TouchableOpacity>
							<ThemedText style={styles.loginLink}>Login</ThemedText>
						</TouchableOpacity>
					</Link>
				</ThemedView>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 24,
	},
	header: {
		marginBottom: 16,
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 80,
		height: 80,
		alignSelf: 'center',
		marginBottom: 16,
	},
	title: {
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		textAlign: 'center',
		marginBottom: 24,
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
	button: {
		marginTop: 8,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 16,
	},
	loginLink: {
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

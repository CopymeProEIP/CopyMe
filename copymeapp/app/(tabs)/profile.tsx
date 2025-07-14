/** @format */

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useNavigation } from '@react-navigation/native';
import { LogOut, User, Settings, Award, HelpCircle } from 'lucide-react-native';
import color from '@/app/theme/color';
import { useAuth } from '@/utils/auth';

interface ProfileOptionProps {
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	onPress: () => void;
}

const ProfileOption = ({ icon, title, subtitle, onPress }: ProfileOptionProps) => (
	<TouchableOpacity style={styles.optionCard} onPress={onPress}>
		<ThemedView style={styles.optionIcon}>{icon}</ThemedView>
		<ThemedView style={styles.optionContent}>
			<ThemedText type='defaultSemiBold'>{title}</ThemedText>
			{subtitle && <ThemedText type='small'>{subtitle}</ThemedText>}
		</ThemedView>
	</TouchableOpacity>
);

export default function ProfileScreen() {
	const navigation = useNavigation();
	const [userName, setUserName] = useState('John Doe');
	const [userEmail, setUserEmail] = useState('john.doe@example.com');
	const { signOut } = useAuth();

	const handleLogout = async () => {
		Alert.alert(
			'Logout',
			'Are you sure you want to logout?',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Logout',
					style: 'destructive',
					onPress: async () => {
						try {
							await signOut();
							(navigation as any).replace('Login');
						} catch (error) {
							console.error('Error during logout:', error);
						}
					},
				},
			],
			{ cancelable: true },
		);
	};

	return (
		<ThemedSafeAreaView style={styles.container}>
			<ThemedText type='title' style={styles.headerTitle}>
				Profile
			</ThemedText>

			<Card style={styles.profileCard}>
				<ThemedView style={styles.profileHeader}>
					<ThemedView style={styles.avatarContainer}>
						<User size={40} color={color.colors.primary} />
					</ThemedView>
					<ThemedView style={styles.profileInfo}>
						<ThemedText type='subtitle'>{userName}</ThemedText>
						<ThemedText type='small'>{userEmail}</ThemedText>
					</ThemedView>
				</ThemedView>
			</Card>

			<ThemedText type='subtitle' style={styles.sectionTitle}>
				Account
			</ThemedText>

			<ThemedView style={styles.optionsContainer}>
				<ProfileOption
					icon={<User size={24} color={color.colors.primary} />}
					title='Edit Profile'
					subtitle='Update your personal information'
					onPress={() => Alert.alert('Edit Profile', 'This feature is coming soon!')}
				/>

				<ProfileOption
					icon={<Settings size={24} color={color.colors.primary} />}
					title='Settings'
					subtitle='App preferences and notifications'
					onPress={() => Alert.alert('Settings', 'This feature is coming soon!')}
				/>

				<ProfileOption
					icon={<Award size={24} color={color.colors.primary} />}
					title='Achievements'
					subtitle='View your training milestones'
					onPress={() => Alert.alert('Achievements', 'This feature is coming soon!')}
				/>

				<ProfileOption
					icon={<HelpCircle size={24} color={color.colors.primary} />}
					title='Help & Support'
					subtitle='FAQs and contact information'
					onPress={() => Alert.alert('Help & Support', 'This feature is coming soon!')}
				/>
			</ThemedView>

			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<LogOut size={20} color={color.colors.error} />
				<ThemedText style={styles.logoutText}>Logout</ThemedText>
			</TouchableOpacity>
		</ThemedSafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		paddingBottom: 24,
	},
	headerTitle: {
		marginBottom: 16,
	},
	profileCard: {
		marginBottom: 24,
		padding: 16,
	},
	profileHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatarContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: color.colors.primaryForeground,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	profileInfo: {
		flex: 1,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	optionsContainer: {
		gap: 12,
		marginBottom: 24,
	},
	optionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		backgroundColor: color.colors.card,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: color.colors.border,
	},
	optionIcon: {
		marginRight: 16,
	},
	optionContent: {
		flex: 1,
	},
	logoutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		backgroundColor: color.colors.error,
		borderRadius: 12,
		marginTop: 'auto',
		marginBottom: 24,
	},
	logoutText: {
		marginLeft: 8,
		color: color.colors.textForeground,
		fontWeight: 'bold',
	},
});

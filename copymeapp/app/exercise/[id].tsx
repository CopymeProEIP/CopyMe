/** @format */

import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play } from 'lucide-react-native';
import color from '../theme/color';
import ReviewItem from '@/components/v1/ReviewItem';
import { Badge } from '@/components/Badge';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';

const reviews = [
	{
		id: '1',
		title: 'First attempt',
		score: 65,
		date: new Date(2023, 9, 15),
	},
	{
		id: '2',
		title: 'Second try',
		score: 78,
		date: new Date(2023, 10, 2),
	},
	{
		id: '3',
		title: 'Latest practice',
		score: 85,
		date: new Date(2023, 10, 20),
	},
];

export default function ExerciseDetailScreen() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const { id, title, level, description, completed } = params;

	const handleStartExercise = () => {
		// Convertir les paramètres en string pour éviter l'erreur TypeScript
		const idParam = typeof id === 'string' ? id : String(id);
		const titleParam = typeof title === 'string' ? title : String(title);

		router.push({
			pathname: '/exercise-session/[id]',
			params: { id: idParam, title: titleParam },
		});
	};

	return (
		<ParallaxScrollView
			headerImage={
				<Image
					source={
						params.imageUrl
							? { uri: params.imageUrl as string }
							: require('@/assets/images/placeholder.png')
					}
					style={styles.coverImage}
					defaultSource={require('@/assets/images/placeholder.png')}
				/>
			}
			headerBackgroundColor={{dark: color.colors.background, light: color.colors.background}}>
			<ThemedView>
				<ThemedView style={styles.header}>
					<ThemedText type='title'>{(title as string) || 'No Name'}</ThemedText>
					<Badge type='primary' text={(level as string) || 'No level'} />
				</ThemedView>

				<Card style={styles.statsCard}>
					<ThemedView style={styles.statsRow}>
						<ThemedView style={styles.statItem}>
							<ThemedText type='defaultSemiBold'>Sessions</ThemedText>
							<ThemedText type='subtitle'>{reviews.length}</ThemedText>
						</ThemedView>
						<View style={styles.divider} />
						<ThemedView style={styles.statItem}>
							<ThemedText type='defaultSemiBold'>Highest alignement</ThemedText>
							<ThemedText type='subtitle'>0%</ThemedText>
						</ThemedView>
					</ThemedView>
				</Card>

				<TouchableOpacity style={styles.startButton} onPress={handleStartExercise}>
					<Play size={24} color={color.colors.textForeground} />
					<ThemedText type='button'>Start Exercise</ThemedText>
				</TouchableOpacity>

				<ThemedText type='subtitle' style={styles.sectionTitle}>
					Description
				</ThemedText>
				<Card style={styles.descriptionCard}>
					<ThemedText type='default'>{description as string || 'No description'}</ThemedText>
				</Card>

				<ThemedText type='subtitle' style={styles.sectionTitle}>
					Previous Sessions
				</ThemedText>

				{reviews.map((review, index) => (
					<ReviewItem key={index} item={review} />
				))}
			</ThemedView>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({

	coverImage: {
		width: '100%',
		height: 250,
		resizeMode: 'cover',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	badge: {
		backgroundColor: color.colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	statsCard: {
		marginBottom: 24,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	statItem: {
		alignItems: 'center',
		padding: 16,
	},
	divider: {
		width: 1,
		backgroundColor: 'rgba(0,0,0,0.1)',
		height: '80%',
		alignSelf: 'center',
	},
	sectionTitle: {
		marginBottom: 16,
	},
	descriptionCard: {
		marginBottom: 24,
	},
	startButton: {
		backgroundColor: color.colors.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		borderRadius: 12,
		marginBottom: 24,
	},
	sessionCard: {
		marginBottom: 12,
		padding: 16,
	},
	sessionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
});

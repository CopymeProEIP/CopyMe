/** @format */

import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, Image, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Upload } from 'lucide-react-native';

// Images pour les différents niveaux de difficulté
const levelImages = {
	Beginner: 'https://images.unsplash.com/photo-1546519638-68e109acd618?q=80&w=400',
	Intermediate: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=400',
	Advanced: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=400',
};

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

	// Calculer le score moyen des précédentes sessions
	const averageScore = useMemo(() => {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.score, 0);
		return Math.round(sum / reviews.length);
	}, []);

	// Trouver le meilleur score
	const bestScore = useMemo(() => {
		if (reviews.length === 0) return 0;
		return Math.max(...reviews.map((review) => review.score));
	}, []);

	// Sélectionner l'image en fonction du niveau
	const imageUrl =
		level && typeof level === 'string'
			? levelImages[level as keyof typeof levelImages] || levelImages.Beginner
			: levelImages.Beginner;

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
		<ScrollView style={styles.container}>
			<Image
				source={{ uri: imageUrl }}
				style={styles.coverImage}
				defaultSource={require('@/assets/images/placeholder.png')}
			/>

			<ThemedView style={styles.content}>
				<ThemedView style={styles.header}>
					<ThemedText type='title'>{title as string}</ThemedText>
					<View style={styles.badge}>
						<ThemedText style={styles.badgeText}>{level as string}</ThemedText>
					</View>
				</ThemedView>

				<Card style={styles.statsCard}>
					<ThemedView style={styles.statsRow}>
						<ThemedView style={styles.statItem}>
							<ThemedText type='defaultSemiBold'>Completion</ThemedText>
							<ThemedText type='subtitle'>{averageScore}%</ThemedText>
						</ThemedView>
						<View style={styles.divider} />
						<ThemedView style={styles.statItem}>
							<ThemedText type='defaultSemiBold'>Best Score</ThemedText>
							<ThemedText type='subtitle'>{bestScore}%</ThemedText>
						</ThemedView>
					</ThemedView>
				</Card>

				<TouchableOpacity style={styles.startButton} onPress={handleStartExercise}>
					<Play size={24} color='#000000' />
					<ThemedText style={styles.startButtonText}>Start Exercise</ThemedText>
				</TouchableOpacity>

				<ThemedText type='subtitle' style={styles.sectionTitle}>
					Description
				</ThemedText>
				<Card style={styles.descriptionCard}>
					<ThemedText type='default'>{description as string}</ThemedText>
				</Card>

				<ThemedText type='subtitle' style={styles.sectionTitle}>
					Previous Sessions
				</ThemedText>

				{reviews.map((review) => (
					<Card key={review.id} style={styles.sessionCard}>
						<ThemedView style={styles.sessionHeader}>
							<ThemedText type='defaultSemiBold'>{review.title}</ThemedText>
							<ThemedText type='small'>{review.date.toLocaleDateString()}</ThemedText>
						</ThemedView>
						<ThemedView style={styles.progressContainer}>
							<ThemedView style={styles.progressBarContainer}>
								<View
									style={[
										styles.progressBar,
										{ width: `${review.score}%`, backgroundColor: getProgressColor(review.score) },
									]}
								/>
							</ThemedView>
							<ThemedText type='defaultSemiBold'>{review.score}%</ThemedText>
						</ThemedView>
					</Card>
				))}
			</ThemedView>
		</ScrollView>
	);
}

// Helper function to determine progress bar color based on percentage
function getProgressColor(progress: number): string {
	if (progress >= 80) return 'gold';
	if (progress >= 60) return '#36A2EB';
	return '#FF6384';
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	coverImage: {
		width: '100%',
		height: 250,
		resizeMode: 'cover',
	},
	content: {
		padding: 16,
		marginTop: -40,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	badge: {
		backgroundColor: 'gold',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	badgeText: {
		color: '#000',
		fontWeight: 'bold',
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
		backgroundColor: 'gold',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		borderRadius: 12,
		marginBottom: 24,
	},
	startButtonText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
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
	progressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	progressBarContainer: {
		flex: 1,
		height: 8,
		backgroundColor: 'rgba(0,0,0,0.05)',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		borderRadius: 4,
	},
});

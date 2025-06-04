/** @format */

import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Card } from './Card';

const exerciseImageUrls = [
	'https://images.unsplash.com/photo-1546519638-68e109acd618?q=80&w=200',
	'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
	'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
	'https://images.unsplash.com/photo-1518908336710-4e1cf821d3d1?q=80&w=200',
	'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=200',
];

export interface Exercise {
	id: string;
	name: string;
	description: string;
	category: string;
	difficulty: string;
	completed?: number;
	instructions: string;
	imageUrl?: string;
	videoUrl?: string;
	targetMuscles: string[];
	equipment?: string[];
}

interface ExerciseItemProps {
	exercise: Exercise;
	onPress?: (exercise: Exercise) => void;
}

export function ExerciseItem({ exercise, onPress }: ExerciseItemProps) {
	return (
		<TouchableOpacity onPress={() => onPress && onPress(exercise)} activeOpacity={0.8}>
			<Card style={styles.container}>
				<ThemedView style={styles.content}>
					<Image
						source={{
							uri:
								exercise.imageUrl ||
								exerciseImageUrls[Math.floor(Math.random() * exerciseImageUrls.length)],
						}}
						style={styles.image}
						defaultSource={require('@/assets/images/placeholder.png')}
					/>
					<ThemedView style={styles.mainContent}>
						<ThemedView style={styles.headerContainer}>
							<ThemedText type='defaultSemiBold' style={{ maxWidth: '60%' }}>
								{exercise.name}
							</ThemedText>
							<ThemedView style={styles.levelBadge}>
								<ThemedText type='default' style={styles.levelText}>
									{typeof exercise.difficulty === 'number'
										? `Level ${exercise.difficulty}`
										: exercise.difficulty}
								</ThemedText>
							</ThemedView>
						</ThemedView>

						<ThemedText type='default' numberOfLines={2} style={styles.description}>
							{exercise.description}
						</ThemedText>
					</ThemedView>
				</ThemedView>
				<ThemedView style={styles.progressFooter}>
					<ThemedView style={styles.progressBarContainer}>
						<View
							style={[
								styles.progressBar,
								{
									width: `${exercise.completed ?? 0}%`,
									backgroundColor: 'gold',
								},
							]}
						/>
					</ThemedView>
					<ThemedText type='defaultSemiBold' style={styles.percentageText}>
						{Math.round(exercise.completed || 0)}%
					</ThemedText>
				</ThemedView>
			</Card>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 8,
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	mainContent: {
		flex: 1,
		marginLeft: 12,
	},
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	levelBadge: {
		backgroundColor: 'gold',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 16,
	},
	levelText: {
		color: '#000',
		fontSize: 12,
	},
	description: {
		opacity: 0.7,
		fontSize: 12,
		// marginBottom: 16,
	},
	progressFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 4,
	},
	progressBarContainer: {
		flex: 1,
		height: 8,
		backgroundColor: 'rgba(255,215,0,0.2)',
		borderRadius: 4,
		overflow: 'hidden',
		marginRight: 8,
	},
	progressBar: {
		height: '100%',
		borderRadius: 4,
	},
	percentageText: {
		fontSize: 12,
		minWidth: 40,
		textAlign: 'right',
	},
	image: {
		width: 80,
		height: 80,
		borderRadius: 8,
		objectFit: 'cover',
	},
});

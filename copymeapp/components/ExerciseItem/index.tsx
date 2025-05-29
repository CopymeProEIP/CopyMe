/** @format */

import { TouchableOpacity, View, Image } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Card } from '../Card';
import { useMemo } from 'react';
import { styles } from './styles';
import { theme } from '@/styles/theme';

const exerciseImageUrls = [
	'https://images.unsplash.com/photo-1546519638-68e109acd618?q=80&w=200',
	'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
	'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
	'https://images.unsplash.com/photo-1518908336710-4e1cf821d3d1?q=80&w=200',
	'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=200',
];

export interface Exercise {
	id: string;
	title: string;
	level: string;
	description: string;
	completed: number;
}

interface ExerciseItemProps {
	exercise: Exercise;
	onPress?: (exercise: Exercise) => void;
}

export function ExerciseItem({ exercise, onPress }: ExerciseItemProps) {
	const imageIndex = useMemo(() => {
		const numericId = parseInt(exercise.id.replace(/\D/g, '') || '0');
		return numericId % exerciseImageUrls.length;
	}, [exercise.id]);

	return (
		<TouchableOpacity onPress={() => onPress && onPress(exercise)} activeOpacity={0.8}>
			<Card style={styles.container}>
				<ThemedView style={styles.content}>
					<Image
						source={{ uri: exerciseImageUrls[imageIndex] }}
						style={styles.image}
						defaultSource={require('@/assets/images/placeholder.png')}
					/>
					<ThemedView style={styles.mainContent}>
						<ThemedView style={styles.headerContainer}>
							<ThemedText type='defaultSemiBold' style={{ maxWidth: '60%' }}>
								{exercise.title}
							</ThemedText>
							<ThemedView style={styles.levelBadge}>
								<ThemedText type='default' style={styles.levelText}>
									{typeof exercise.level === 'number' ? `Level ${exercise.level}` : exercise.level}
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
									width: `${exercise.completed}%`,
									backgroundColor: theme.colors.primary,
								},
							]}
						/>
					</ThemedView>
					<ThemedText type='defaultSemiBold' style={styles.percentageText}>
						{Math.round(exercise.completed)}%
					</ThemedText>
				</ThemedView>
			</Card>
		</TouchableOpacity>
	);
}

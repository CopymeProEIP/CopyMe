/** @format */

import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Exercise } from '@/constants/interface';

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
						// source={{
						// 	uri: exercise.imageUrl
						// 		? exercise.imageUrl
						// 		: require('../assets/images/placeholder.png'),
						// }}
						source={require('@/assets/images/placeholder.png')}
						style={styles.image}
						defaultSource={require('@/assets/images/placeholder.png')}
					/>
					<ThemedView style={styles.mainContent}>
						<ThemedView style={styles.headerContainer}>
							<ThemedText type='defaultSemiBold' style={{ maxWidth: '60%' }}>
								{exercise.name}
							</ThemedText>
							<Badge type='primary' text={exercise.difficulty} />
						</ThemedView>
						<ThemedText type='description' numberOfLines={2} style={styles.description}>
							{exercise.description}
						</ThemedText>
					</ThemedView>
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
	description: {
		opacity: 0.7,
	},
	image: {
		width: 80,
		height: 80,
		borderRadius: 8,
		objectFit: 'cover',
	},
});

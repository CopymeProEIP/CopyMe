/** @format */

import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Card } from './Card';

interface ReviewItemProps {
	author: string;
	date: string;
	rating: number;
	text: string;
}

export function ReviewItem({ author, date, rating, text }: ReviewItemProps) {
	const maxRating = 5;

	return (
		<Card style={styles.container}>
			<ThemedView style={styles.header}>
				<ThemedView style={styles.authorContainer}>
					<ThemedText type='subtitle'>{author}</ThemedText>
					<ThemedText type='default' style={styles.date}>
						{date}
					</ThemedText>
				</ThemedView>
			</ThemedView>
			<ThemedView style={styles.content}>
				<ThemedText type='default'>{text}</ThemedText>
			</ThemedView>
		</Card>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	authorContainer: {
		gap: 4,
	},
	ratingContainer: {
		flexDirection: 'row',
		gap: 2,
	},
	date: {
		opacity: 0.6,
	},
	content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
	},
});

/** @format */

import { ProcessedData } from '@/constants/processedData';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import color from '@/app/theme/color';

const ReviewItem = ({ item }: { item: Partial<ProcessedData> }) => {
	if (!item) {
		return null;
	}
	const formattedDate = item.created_at
		? new Date(item.created_at).toLocaleDateString('fr-FR', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
		  })
		: item.updated_at
		  ? new Date(item.updated_at).toLocaleDateString('fr-FR', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		  : 'N/A';

	return (
		<ThemedView style={styles.container}>
			<ThemedView>
				<ThemedText type='defaultSemiBold'>
					{item?.exercise ? item?.exercise.name : 'No name'}
				</ThemedText>
				<ThemedText type='small'>{formattedDate}</ThemedText>
			</ThemedView>
			<ThemedView style={{ alignItems: 'center', padding: 8, borderRadius: 8 }}>
				<ThemedText type='subtitle' style={styles.scoresText}>
					{item.alignement_score || 'NAN'}%
				</ThemedText>
				<ThemedText>Alignment</ThemedText>
			</ThemedView>
			<ThemedView style={{ alignItems: 'center', padding: 8, borderRadius: 8 }}>
				<ThemedText type='subtitle' style={styles.scoresText}>
					{item.precision_score || 'NAN'}%
				</ThemedText>
				<ThemedText>Precision</ThemedText>
			</ThemedView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: color.colors.card,
		borderColor: color.colors.border,
		borderWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	scoresText: {
		color: color.colors.success,
	},
});

export default ReviewItem;

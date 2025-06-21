/** @format */

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LucideIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { useState } from 'react';

export function StatsBox(props: { title: string; value: string; icon: LucideIcon }) {
	const [progress, setProgress] = useState(0.7);
	const percentage = Math.round(progress * 100);

	return (
		<Card style={styles.container}>
			<ThemedView style={styles.content}>
				<ThemedView style={styles.containerHeader}>
					<ThemedView style={styles.containerTitle}>
						<props.icon color={'gold'} size={24} />
						<ThemedText type='default'>{props.title}</ThemedText>
					</ThemedView>
					<ThemedText type='default'>{props.value}</ThemedText>
				</ThemedView>
				<ThemedView style={styles.containerBody}>
					{/* <ProgressCircle
						style={styles.progressCircle}
						progress={progress}
						progressColor={'gold'}
						backgroundColor={'rgba(255,215,0,0.2)'}
						strokeWidth={8}
					/> */}
					<ThemedText style={styles.percentageText} type='defaultSemiBold'>
						{percentage}%
					</ThemedText>
				</ThemedView>
			</ThemedView>
		</Card>
	);
}

const styles = StyleSheet.create({
	container: {
		minHeight: 100,
		width: '100%',
	},
	content: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	containerHeader: {
		flex: 1,
		gap: 8,
	},
	containerTitle: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	containerBody: {
		width: 80,
		height: 80,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	progressCircle: {
		height: '100%',
		width: '100%',
		position: 'absolute',
	},
	percentageText: {},
});

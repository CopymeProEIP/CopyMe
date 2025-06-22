/** @format */

import React, { useState, useMemo, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { FilterChips, FilterOption } from '@/components/FilterChips';
import { Activity } from 'lucide-react-native';
import ReviewItem from '@/components/v1/ReviewItem';
import color from '@/app/theme/color';
import { ProcessedData } from '@/constants/processedData';
import { useApi } from '@/utils/api';
import useReviews from '@/app/hooks/useReviews';

// Filtres de date
const dateFilters: FilterOption[] = [
	{ id: 'all', label: 'All Time' },
	{ id: 'recent', label: 'Recent (30 days)' },
	{ id: 'older', label: 'Older' },
];

export default function AnalysisListScreen() {
	const navigation = useNavigation();
	const [selectedDateFilters, setSelectedDateFilters] = useState<string[]>(['all']);
	const [customDate, setCustomDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const { reviews, loading, error } = useReviews();


	const handleDateFilterToggle = (id: string) => {
		if (id === 'custom') {
			setShowDatePicker(true);
		}

		if (id === 'all') {
			setSelectedDateFilters(['all']);
			setShowDatePicker(false);
		} else {
			const newFilters = selectedDateFilters.filter((f) => f !== 'all');

			if (selectedDateFilters.includes(id)) {
				const updatedFilters = newFilters.filter((f) => f !== id);
				setSelectedDateFilters(updatedFilters.length ? updatedFilters : ['all']);

				if (id === 'custom') {
					setShowDatePicker(false);
				}
			} else {
				setSelectedDateFilters([...newFilters, id]);
			}
		}
	};

	const filteredAnalysisData = useMemo(() => {
		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 jours en millisecondes

		return reviews?.filter((item) => {
			// Filtre de date
			let matchesDateFilter = false;
			if (selectedDateFilters.includes('all')) {
				matchesDateFilter = true;
			} else {
				if (selectedDateFilters.includes('recent') && item.created_at >= thirtyDaysAgo) {
					matchesDateFilter = true;
				}
				if (selectedDateFilters.includes('older') && item.created_at < thirtyDaysAgo) {
					matchesDateFilter = true;
				}
				if (selectedDateFilters.includes('custom')) {
					// Compare seulement année, mois, jour
					const itemDate = new Date(item.created_at);
					const filterDate = new Date(customDate);

					if (
						itemDate.getFullYear() === filterDate.getFullYear() &&
						itemDate.getMonth() === filterDate.getMonth() &&
						itemDate.getDate() === filterDate.getDate()
					) {
						matchesDateFilter = true;
					}
				}
			}

			return matchesDateFilter;
		});
	}, [selectedDateFilters, customDate, reviews]);

	const handleAnalysisPress = (analysis: ProcessedData) => {
		(navigation as any).navigate('Analyze', {
			id: analysis.id,
			title: analysis.exercise.name,
			exerciseName: analysis.exercise.name,
		});
	};

	return (
		<ThemedSafeAreaView style={styles.container}>
			<FilterChips
				options={dateFilters}
				selectedIds={selectedDateFilters}
				onToggle={handleDateFilterToggle}
			/>

			{filteredAnalysisData.length > 0 ? (
				<FlatList
					data={filteredAnalysisData}
					renderItem={({ item, index }: { item: ProcessedData; index: number }) => (
						<TouchableOpacity onPress={() => handleAnalysisPress(item)}>
							<ReviewItem item={item} />
						</TouchableOpacity>
					)}
					keyExtractor={(item, index) => index.toString()}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			) : (
				<ThemedView style={styles.emptyStateContainer}>
					<Activity size={60} color={color.colors.primary} style={styles.emptyStateIcon} />
					<ThemedText type='subtitle'>No Analyses Found</ThemedText>
					<ThemedText type='default' style={styles.emptyStateText}>
						No shot analyses match your current filters. Try adjusting your date filters.
					</ThemedText>
				</ThemedView>
			)}
		</ThemedSafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		marginBottom: 70,
	},
	listContent: {
		height: '100%',
		gap: 8,
		paddingTop: 8,
		paddingBottom: 20,
	},
	card: {
		flexDirection: 'row',
		marginVertical: 8,
	},
	thumbnail: {
		width: 80,
		height: 80,
		borderRadius: 8,
	},
	contentContainer: {
		flex: 1,
		marginLeft: 12,
		justifyContent: 'space-between',
	},
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	date: {
		opacity: 0.6,
	},
	exerciseName: {
		marginVertical: 4,
		fontSize: 14,
	},
	progressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginTop: 4,
	},
	progressBarContainer: {
		flex: 1,
		height: 6,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 3,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		borderRadius: 3,
	},
	progressText: {
		minWidth: 32,
		textAlign: 'right',
	},
	emptyStateContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		padding: 24,
	},
	emptyStateIcon: {
		marginBottom: 16,
		opacity: 0.7,
	},
	emptyStateText: {
		textAlign: 'center',
		marginTop: 8,
		opacity: 0.7,
		maxWidth: '80%',
	},
});

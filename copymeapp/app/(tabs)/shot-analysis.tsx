/** @format */

import React, { useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useRouter } from 'expo-router';
import { FilterChips, FilterOption } from '@/components/FilterChips';
import { Activity } from 'lucide-react-native';
import { SearchBar } from '@/components/SearchBar';
import { getProgressColor } from '@/styles/theme';

// Type pour les éléments d'analyse
interface AnalysisItem {
	id: string;
	title: string;
	date: Date;
	exerciseName: string;
	thumbnailUrl: string;
	progress: number;
}

// Données factices pour les analyses
const analysisData: AnalysisItem[] = [
	{
		id: '1',
		title: 'Free Throw Analysis',
		date: new Date(2023, 5, 10),
		exerciseName: 'Free Throw',
		thumbnailUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
		progress: 75,
	},
	{
		id: '2',
		title: 'Jump Shot Analysis',
		date: new Date(2023, 5, 15),
		exerciseName: 'Three-Point Shot',
		thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
		progress: 62,
	},
	{
		id: '3',
		title: 'Layup Analysis',
		date: new Date(2023, 6, 2),
		exerciseName: 'Layup Drill',
		thumbnailUrl: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=200',
		progress: 88,
	},
	{
		id: '4',
		title: 'Recent Free Throw',
		date: new Date(2023, 10, 20), // Plus récent
		exerciseName: 'Free Throw',
		thumbnailUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
		progress: 82,
	},
	{
		id: '5',
		title: 'Recent Jump Shot',
		date: new Date(2023, 10, 25), // Plus récent
		exerciseName: 'Three-Point Shot',
		thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
		progress: 68,
	},
];

// Filtres de date
const dateFilters: FilterOption[] = [
	{ id: 'all', label: 'All Time' },
	{ id: 'recent', label: 'Recent (30 days)' },
	{ id: 'older', label: 'Older' },
];

export default function ShotAnalysisListScreen() {
	const router = useRouter();
	const [selectedDateFilters, setSelectedDateFilters] = useState<string[]>(['all']);
	const [customDate, setCustomDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);

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

		return analysisData.filter((item) => {
			// Filtre de date
			let matchesDateFilter = false;
			if (selectedDateFilters.includes('all')) {
				matchesDateFilter = true;
			} else {
				if (selectedDateFilters.includes('recent') && item.date >= thirtyDaysAgo) {
					matchesDateFilter = true;
				}
				if (selectedDateFilters.includes('older') && item.date < thirtyDaysAgo) {
					matchesDateFilter = true;
				}
				if (selectedDateFilters.includes('custom')) {
					// Compare seulement année, mois, jour
					const itemDate = new Date(item.date);
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
	}, [selectedDateFilters, customDate]);

	const handleAnalysisPress = (analysis: AnalysisItem) => {
		router.push({
			pathname: '/analysis/[id]',
			params: {
				id: analysis.id,
				title: analysis.title,
				exerciseName: analysis.exerciseName,
			},
		});
	};

	const renderAnalysisItem = ({ item }: { item: AnalysisItem }) => (
		<TouchableOpacity onPress={() => handleAnalysisPress(item)} activeOpacity={0.8}>
			<Card style={styles.card}>
				<Image
					source={{ uri: item.thumbnailUrl }}
					style={styles.thumbnail}
					defaultSource={require('@/assets/images/placeholder.png')}
				/>

				<ThemedView style={styles.contentContainer}>
					<ThemedView style={styles.headerContainer}>
						<ThemedText type='defaultSemiBold'>{item.title}</ThemedText>
						<ThemedText type='small' style={styles.date}>
							{item.date.toLocaleDateString()}
						</ThemedText>
					</ThemedView>

					<ThemedText type='default' style={styles.exerciseName}>
						{item.exerciseName}
					</ThemedText>

					<ThemedView style={styles.progressContainer}>
						<ThemedView style={styles.progressBarContainer}>
							<ThemedView
								style={[
									styles.progressBar,
									{ width: `${item.progress}%`, backgroundColor: getProgressColor(item.progress) },
								]}
							/>
						</ThemedView>
						<ThemedText type='small' style={styles.progressText}>
							{item.progress}%
						</ThemedText>
					</ThemedView>
				</ThemedView>
			</Card>
		</TouchableOpacity>
	);

	return (
		<ThemedView style={styles.container}>

			<FilterChips
				options={dateFilters}
				selectedIds={selectedDateFilters}
				onToggle={handleDateFilterToggle}
			/>

			{filteredAnalysisData.length > 0 ? (
				<FlatList
					data={filteredAnalysisData}
					renderItem={renderAnalysisItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			) : (
				<ThemedView style={styles.emptyStateContainer}>
					<Activity size={60} color='gold' style={styles.emptyStateIcon} />
					<ThemedText type='subtitle'>No Analyses Found</ThemedText>
					<ThemedText type='default' style={styles.emptyStateText}>
						No shot analyses match your current filters. Try adjusting your date filters.
					</ThemedText>
				</ThemedView>
			)}
		</ThemedView>
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
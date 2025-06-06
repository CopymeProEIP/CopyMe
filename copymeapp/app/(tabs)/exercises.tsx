/** @format */

import { useState, useMemo, useEffect } from 'react';
import { FlatList } from 'react-native';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips, FilterOption } from '@/components/FilterChips';
import { ExerciseItem, Exercise } from '@/components/ExerciseItem';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';
import { useApi } from '@/utils/api';
import styles from '../styles/exercisesTabs';
import color from '@/app/theme/color';

const levelFilters: FilterOption[] = [
	{ id: 'all', label: 'All Levels' },
	{ id: 'beginner', label: 'Beginner' },
	{ id: 'intermediate', label: 'Intermediate' },
	{ id: 'advanced', label: 'Advanced' },
];

export default function ExercisesScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
	const [exercisesData, setExercisesData] = useState<Exercise[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const api = useApi();

	const getExercises = async () => {
		try {
			const response = await api.get('/exercises');
			const data = response as { data: Exercise[] };
			setExercisesData(data?.data || []);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching exercises:', error);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getExercises();
	}, []);

	const handleFilterToggle = (id: string) => {
		if (id === 'all') {
			setSelectedFilters(['all']);
		} else {
			const newFilters = selectedFilters.filter((f) => f !== 'all');

			if (selectedFilters.includes(id)) {
				const updatedFilters = newFilters.filter((f) => f !== id);
				setSelectedFilters(updatedFilters.length ? updatedFilters : ['all']);
			} else {
				setSelectedFilters([...newFilters, id]);
			}
		}
	};

	const filteredExercises = useMemo(() => {
		return exercisesData.filter((exercise) => {
			const matchesSearch =
				exercise.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				false ||
				exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				false;

			const matchesLevel =
				selectedFilters.includes('all') ||
				(exercise.difficulty && selectedFilters.includes(exercise.difficulty.toLowerCase()));

			return matchesSearch && matchesLevel;
		});
	}, [searchQuery, selectedFilters, exercisesData]);

	const handleExercisePress = (exercise: Exercise) => {
		router.push({
			pathname: '/exercise/[id]',
			params: {
				id: exercise.id,
				title: exercise.name,
				level: exercise.difficulty,
				description: exercise.description,
				completed: exercise.completed || 0,
				category: exercise.category,
				instructions: exercise.instructions,
				imageUrl: exercise.imageUrl,
				videoUrl: exercise.videoUrl,
			},
		});
	};

	return (
		<ThemedSafeAreaView style={styles.container}>
			<SearchBar onSearch={setSearchQuery} placeholder='Search exercises...' />
			<FilterChips
				options={levelFilters}
				selectedIds={selectedFilters}
				onToggle={handleFilterToggle}
			/>

			{isLoading ? (
				<ThemedView style={styles.loadingContainer}>
					<Activity size={60} color={color.colors.accent} style={styles.loadingIcon} />
					<ThemedText type='subtitle'>Loading Exercises...</ThemedText>
					<ThemedText type='default' style={styles.loadingText}>
						Loading your exercises, please wait a moment.
					</ThemedText>
				</ThemedView>
			) : filteredExercises.length > 0 ? (
				<FlatList
					data={filteredExercises}
					keyExtractor={(item, index) => index.toString()}
					renderItem={({ item }) => <ExerciseItem exercise={item} onPress={handleExercisePress} />}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			) : (
				<ThemedView style={styles.emptyStateContainer}>
					<Activity size={60} color={color.colors.accent} style={styles.emptyStateIcon} />
					<ThemedText type='subtitle'>No Exercises Found</ThemedText>
					<ThemedText type='default' style={styles.emptyStateText}>
						Try adjusting your search or filters
					</ThemedText>
				</ThemedView>
			)}
		</ThemedSafeAreaView>
	);
}

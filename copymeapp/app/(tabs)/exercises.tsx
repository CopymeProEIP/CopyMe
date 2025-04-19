/** @format */

import { useState, useMemo } from 'react';
import { FlatList, StyleSheet, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips, FilterOption } from '@/components/FilterChips';
import { ExerciseItem, Exercise } from '@/components/ExerciseItem';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';

const exercisesData: Exercise[] = [
	{
		id: '1',
		title: 'Free Throw',
		level: 'Beginner',
		description: 'Improve accuracy with this fundamental shot',
		completed: 80,
	},
	{
		id: '2',
		title: 'Three-Point Shot',
		level: 'Intermediate',
		description: 'Master long-range shooting with proper technique',
		completed: 45,
	},
	{
		id: '3',
		title: 'Layup Drill',
		level: 'Beginner',
		description: 'Practice essential close-range scoring',
		completed: 95,
	},
	{
		id: '4',
		title: 'Dribbling Course',
		level: 'Advanced',
		description: 'Advanced ball handling exercises to improve control',
		completed: 30,
	},
	{
		id: '5',
		title: 'Defensive Stance',
		level: 'Intermediate',
		description: 'Learn proper defensive positioning and movement',
		completed: 60,
	},
];

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
				exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				exercise.description.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesLevel =
				selectedFilters.includes('all') || selectedFilters.includes(exercise.level.toLowerCase());

			return matchesSearch && matchesLevel;
		});
	}, [searchQuery, selectedFilters]);

	const handleExercisePress = (exercise: Exercise) => {
		router.push({
			pathname: '/exercise/[id]',
			params: {
				id: exercise.id,
				title: exercise.title,
				level: exercise.level,
				description: exercise.description,
				completed: exercise.completed,
			},
		});
	};

	return (
		<ThemedView style={styles.container}>
			{/* <SearchBar onSearch={setSearchQuery} placeholder='Search exercises...' /> */}
			<FilterChips
				options={levelFilters}
				selectedIds={selectedFilters}
				onToggle={handleFilterToggle}
			/>

			{filteredExercises.length > 0 ? (
				<FlatList
					data={filteredExercises}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => <ExerciseItem exercise={item} onPress={handleExercisePress} />}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			) : (
				<ThemedView style={styles.emptyStateContainer}>
					<Activity size={60} color='gold' style={styles.emptyStateIcon} />
					<ThemedText type='subtitle'>No Exercises Found</ThemedText>
					<ThemedText type='default' style={styles.emptyStateText}>
						Try adjusting your search or filters
					</ThemedText>
				</ThemedView>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 8,
		marginBottom: 70,
	},
	listContent: {
		height: '100%',
    gap: 8,
    paddingTop: 8,
		paddingBottom: 20,
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

/** @format */

import { Image, ScrollView, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import ReviewItem from '@/components/v1/ReviewItem';
import { mockupProcessedData } from '@/constants/Mockup';
import SeeAll from '@/components/v1/SeeAll';
import OverallStats from '@/components/v1/OverallStats';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProcessedData } from '@/constants/processedData';
import { useState } from 'react';
import { useApi } from '@/utils/api';

export default function HomeScreen() {
	const [lastReviews, setLastReviews] = useState<ProcessedData[]>([]);
	const api = useApi();

	const getLastReviews = async () => {
		try {
			const response = await api.get('/reviews/last');
			const data = response as { data: ProcessedData[] };
			setLastReviews(data?.data || []);
		} catch (error) {
			console.error('Error fetching last reviews:', error);
		}
	};

	return (
		<SafeAreaProvider>
			<ThemedSafeAreaView>
				<ScrollView>
					<ThemedView style={styles.container}>
						<ThemedView style={styles.titleContainer}>
							<ThemedText type='title'>Dashboard</ThemedText>
							<HelloWave />
						</ThemedView>
						<Image source={require('@/assets/images/WelcomeCta2.png')} style={styles.cta} />

						<ThemedView style={styles.reviewContainer}>
							<SeeAll text='Last reviews' />
							<ThemedView style={{ flex: 1, gap: 8 }}>
								<ReviewItem item={mockupProcessedData} />
								<ReviewItem item={mockupProcessedData} />
							</ThemedView>
						</ThemedView>
						<ThemedView style={styles.reviewContainer}>
							<SeeAll text='Overall Stats' cta='See More' />
							<OverallStats />
						</ThemedView>
					</ThemedView>
				</ScrollView>
			</ThemedSafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		gap: 24,
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	reviewContainer: {
		flex: 1,
		gap: 8,
	},
	cta: {
		height: 194,
		width: '100%',
		borderRadius: 8,
	},
});

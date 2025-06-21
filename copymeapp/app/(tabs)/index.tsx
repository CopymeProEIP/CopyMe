/** @format */

import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import ReviewItem from '@/components/v1/ReviewItem';
import SeeAll from '@/components/v1/SeeAll';
import OverallStats from '@/components/v1/OverallStats';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useReviews from '@/app/hooks/useReviews';
import { useNavigation } from '@react-navigation/native';
import { ProcessedData } from '@/constants/processedData';

export default function HomeScreen() {
  const { reviews, loading, error } = useReviews();
  const navigation = useNavigation();

  const handleAnalysisPress = (analysis: ProcessedData) => {
    (navigation as any).navigate('Analyze', {
      id: analysis.id,
      title: analysis.exercise.name,
      exerciseName: analysis.exercise.name,
    });
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
            <Image
              source={require('@/assets/images/WelcomeCta2.png')}
              style={styles.cta}
            />

            <ThemedView style={styles.reviewContainer}>
              <SeeAll text='Last reviews' />
              <ThemedView style={{ flex: 1, gap: 8 }}>
                {reviews.length > 0 ? (
                  loading ? (
                    <ThemedText type='default'>Loading...</ThemedText>
                  ) : (
                    reviews.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleAnalysisPress(item)}
                      >
                        <ReviewItem item={item} />
                      </TouchableOpacity>
                    ))
                  )
                ) : (
                  <ThemedText type='default'>No reviews available</ThemedText>
                )}
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

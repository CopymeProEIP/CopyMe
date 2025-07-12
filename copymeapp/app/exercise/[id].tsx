/** @format */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Play } from 'lucide-react-native';
import color from '@/app/theme/color';
import ReviewItem from '@/components/v1/ReviewItem';
import { Badge } from '@/components/Badge';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { Exercise } from '@/constants/interface';
import { useApi } from '@/utils/api';
import useReviews from '@/app/hooks/useReviews';
import { ProcessedData } from '@/constants/processedData';

type RouteParams = {
  id: string;
};

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as RouteParams;
  const { reviews } = useReviews();

  const [exercisesData, setExercisesData] = useState<Exercise>();
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const getExercises = async () => {
      try {
        const response = await api.get('/exercises/' + (id as string));
        const data = response as { data: Exercise };
        setExercisesData(data?.data);

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setIsLoading(false);
      }
    };
    getExercises();
  }, []);

  const handleStartExercise = () => {
    (navigation as any).navigate('ExerciseSession', {
      id: (id as string) || 0,
      title: exercisesData?.name,
    });
  };

  if (isLoading) {
    return <ThemedText type="default">Loading...</ThemedText>;
  }

  if (!exercisesData) {
    return <ThemedText type="default">Exercise not found</ThemedText>;
  }

  const handleAnalysisPress = (analysis: ProcessedData) => {
    (navigation as any).navigate('Analyze', {
      id: analysis.id,
      title: analysis.exercise.name,
      exerciseName: analysis.exercise.name,
    });
  };

  return (
    <ParallaxScrollView
      headerImage={
        exercisesData.videoUrl ? (
          <WebView
            source={{ uri: exercisesData.videoUrl }}
            style={styles.coverVideo}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <Image
            source={require('@/assets/images/placeholder.png')}
            style={styles.coverImage}
          />
        )
      }
      headerBackgroundColor={{
        dark: color.colors.background,
        light: color.colors.background,
      }}
    >
      <ThemedView>
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {(exercisesData?.name as string) || 'No Name'}
          </ThemedText>
          <Badge
            type="primary"
            text={(exercisesData?.difficulty as string) || 'No level'}
          />
        </ThemedView>

        <Card style={styles.statsCard}>
          <ThemedView style={styles.statsRow}>
            <ThemedView style={styles.statItem}>
              <ThemedText type="defaultSemiBold">Sessions</ThemedText>
              <ThemedText type="subtitle">{reviews.length}</ThemedText>
            </ThemedView>
            <View style={styles.divider} />
            <ThemedView style={styles.statItem}>
              <ThemedText type="defaultSemiBold">Average alignement</ThemedText>
              <ThemedText type="subtitle">0%</ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartExercise}
        >
          <Play size={24} color={color.colors.textForeground} />
          <ThemedText type="button">Start Exercise</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Description
        </ThemedText>
        <Card style={styles.descriptionCard}>
          <ThemedText type="default">
            {(exercisesData?.description as string) || 'No description'}
          </ThemedText>
        </Card>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Previous Sessions
        </ThemedText>

        {reviews.map((review, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAnalysisPress(review)}
          >
            <ReviewItem item={review} />
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  coverImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  coverVideo: {
    width: '100%',
    height: 250,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: color.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: '80%',
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  descriptionCard: {
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: color.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sessionCard: {
    marginBottom: 12,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

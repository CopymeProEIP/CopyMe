/** @format */

import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { ReviewItem } from './ReviewItem';

interface Review {
  id: string;
  title: string;
  score: number;
  date: Date;
}

interface ReviewsListProps {
  reviews: Review[];
  onSeeAllPress?: () => void;
}

export function ReviewsList({ reviews, onSeeAllPress }: ReviewsListProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleRow}>
        <ThemedText type='default'>Last reviews</ThemedText>
        <TouchableOpacity onPress={onSeeAllPress}>
          <ThemedText type='description' style={styles.seeAll}>
            See all
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.reviewsContainer}>
        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            author={review.title}
            date={review.date.toLocaleDateString()}
            rating={Math.round(review.score / 20)} // Convert score (0-100) to rating (0-5)
            text={`Score: ${review.score}/100`}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: 'gold',
  },
  reviewsContainer: {
    gap: 8,
  },
});

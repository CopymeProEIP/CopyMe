/** @format */

import { StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useMemo } from 'react';

const basketballImageUrls = [
  'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
  'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
  'https://images.unsplash.com/photo-1518908336710-4e1cf821d3d1?q=80&w=200',
  'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=200',
];

interface ReviewItemProps {
  author: string;
  date: string;
  rating: number;
  text: string;
  id?: string;
}

export function ReviewItem({
  author,
  date,
  rating,
  text,
  id = '1',
}: ReviewItemProps) {
  const imageIndex = useMemo(() => {
    const hash = author
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % basketballImageUrls.length;
  }, [author]);

  return (
    <Card style={styles.container}>
      <ThemedView style={styles.body}>
        <Image
          source={{ uri: basketballImageUrls[imageIndex] }}
          style={styles.image}
          defaultSource={require('@/assets/images/placeholder.png')}
        />

        <ThemedView style={styles.authorContainer}>
          <ThemedText type='defaultSemiBold'>{author}</ThemedText>
          <ThemedText type='small' style={styles.date}>
            {date}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.authorContainer}>
        <ThemedText type='default' style={styles.reviewText}>
          Score
        </ThemedText>
        <ThemedText type='default' style={styles.reviewText}>
          {rating}/100
        </ThemedText>
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    flexDirection: 'row',
    gap: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  authorContainer: {
    gap: 4,
    marginBottom: 8,
  },
  date: {
    opacity: 0.6,
  },
  reviewText: {
    opacity: 0.8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: 'cover',
  },
});

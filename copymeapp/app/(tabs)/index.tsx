/** @format */

import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatsBox } from '@/components/StatsBox';
import { Trophy } from 'lucide-react-native';
import { ReviewsList } from '@/components/ReviewsList';

const reviews = [
  {
    id: '1',
    title: 'Shooting',
    score: 100,
    date: new Date(),
  },
  {
    id: '2',
    title: 'Free Throw',
    score: 80,
    date: new Date(),
  },
  {
    id: '3',
    title: 'Shooting',
    score: 20,
    date: new Date(),
  },
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type='title'>Dashboard</ThemedText>
        <HelloWave />
      </ThemedView>
      <StatsBox title='Best Score' value='Three-point shoot' icon={Trophy} />
      <ReviewsList
        reviews={reviews}
        onSeeAllPress={() => console.log('See all reviews')}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

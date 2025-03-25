/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { Video } from 'expo-av';

interface StatItem {
  title: string;
  progress: number;
}

const shotStats: StatItem[] = [
  {
    title: 'Elbow Alignment',
    progress: 85,
  },
  {
    title: 'Follow Through',
    progress: 70,
  },
  {
    title: 'Release Timing',
    progress: 92,
  },
  {
    title: 'Balance',
    progress: 65,
  },
];

const improvementTips = [
  'Keep your elbow tucked closer to your body',
  'Release the ball at the peak of your jump',
  'Maintain follow-through until ball reaches basket',
];

export default function ShotAnalysisScreen() {
  const video = React.useRef(null);
  const [videoMode, setVideoMode] = useState<'your' | 'pro'>('your');

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.videoContainer}>
        <Video
          ref={video}
          style={styles.video}
          source={
            videoMode === 'your'
              ? require('@/assets/videos/your_shot.mp4')
              : require('@/assets/videos/pro_shot.mp4')
          }
          useNativeControls
          shouldPlay={false}
          isLooping
        />
      </ThemedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, videoMode === 'your' && styles.activeButton]}
          onPress={() => setVideoMode('your')}
        >
          <ThemedText
            type='defaultSemiBold'
            style={videoMode === 'your' ? styles.activeButtonText : {}}
          >
            Your Shot
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, videoMode === 'pro' && styles.activeButton]}
          onPress={() => setVideoMode('pro')}
        >
          <ThemedText
            type='defaultSemiBold'
            style={videoMode === 'pro' ? styles.activeButtonText : {}}
          >
            Pro Shot
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        Statistics
      </ThemedText>

      <View style={styles.statsContainer}>
        {shotStats.map((stat, index) => (
          <StatBox key={index} title={stat.title} progress={stat.progress} />
        ))}
      </View>

      {/* Improvement Tips */}
      <ThemedText type='subtitle' style={styles.sectionTitle}>
        Improvement Tips
      </ThemedText>

      <Card style={styles.tipsCard}>
        <ThemedView style={styles.tipsContainer}>
          {improvementTips.map((tip, index) => (
            <ThemedView key={index} style={styles.tipItem}>
              <ThemedText type='defaultSemiBold' style={styles.tipBullet}>
                •
              </ThemedText>
              <ThemedText type='description' style={styles.tipText}>
                {tip}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </Card>
    </ScrollView>
  );
}

function StatBox({ title, progress }: { title: string; progress: number }) {
  return (
    <Card style={styles.statBox}>
      <ThemedText type='default' style={styles.statTitle}>
        {title}
      </ThemedText>

      <ThemedView style={styles.progressContainer}>
        <ThemedView style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
                backgroundColor: getProgressColor(progress),
              },
            ]}
          />
        </ThemedView>
        <ThemedText type='defaultSemiBold' style={styles.progressText}>
          {progress}%
        </ThemedText>
      </ThemedView>
    </Card>
  );
}

// Helper function to determine progress bar color based on percentage
function getProgressColor(progress: number): string {
  if (progress >= 80) return 'gold';
  if (progress >= 60) return '#36A2EB';
  return '#FF6384';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // paddingTop: Platform.OS === 'ios' ? 50 : 30,
    marginBottom: 70,
  },
  videoContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeButton: {
    backgroundColor: 'gold',
    borderColor: 'gold',
  },
  activeButtonText: {
    color: '#000',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    padding: 16,
  },
  statTitle: {
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    minWidth: 40,
    textAlign: 'right',
  },
  tipsCard: {
    marginBottom: 24,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    marginRight: 8,
    color: 'gold',
    fontSize: 18,
  },
  tipText: {
    flex: 1,
  },
});

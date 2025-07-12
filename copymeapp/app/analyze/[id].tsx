/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { VideoRef } from 'react-native-video';
import { useRoute } from '@react-navigation/native';
import {
  Lightbulb,
  RotateCcw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
} from 'lucide-react-native';
import { mockupProcessedData } from '@/constants/Mockup';
import color from '@/app/theme/color';

type RouteParams = {
  id: string;
  title?: string;
  exerciseName?: string;
};

function Feedback({ feedbacks }: { feedbacks: string[] }) {
  return feedbacks.map((feedback, index) => (
    <ThemedView key={index} style={styles.tipItem}>
      <ThemedText type="defaultSemiBold" style={styles.tipBullet}>
        •
      </ThemedText>
      <ThemedText type="description" style={styles.tipText}>
        {feedback}
      </ThemedText>
    </ThemedView>
  ));
}

export default function AnalysisDetailScreen() {
  const route = useRoute();
  const { id, title, exerciseName } = route.params as RouteParams;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [frame, setFrame] = useState(0);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<VideoRef>(null);

  const scrollToSelected = (index: number) => {
    if (scrollViewRef.current) {
      const itemWidth = 150;
      const position = index * itemWidth;
      scrollViewRef.current.scrollTo({ x: position, animated: true });
    }
  };

  const updateFrame = (newFrame: number): void => {
    setFrame(newFrame);
    setTimeout(() => scrollToSelected(newFrame), 100);
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.seek(0);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const feedbacks = mockupProcessedData.frames[frame].persons[0].feedback;
  const tipCount = feedbacks.length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.tipsHeader}
            disabled={tipCount === 0}
            onPress={() => setTipsExpanded(!tipsExpanded)}
          >
            <ThemedView
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Lightbulb color={color.colors.primary} />
              <ThemedText type="subtitle">Improvement</ThemedText>
            </ThemedView>

            <TouchableOpacity
              style={styles.seeMoreButton}
              disabled={tipCount === 0}
              onPress={() => setTipsExpanded(!tipsExpanded)}
            >
              <ThemedText style={styles.seeMoreText}>
                {!tipsExpanded ? 'See more' : 'Collapse'}
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>

          {
            tipsExpanded && (
              <ThemedView style={styles.tipsContainer}>
                <Feedback feedbacks={feedbacks} />
              </ThemedView>
            )
            //  : (
            // 	<ThemedText type='description' style={{ width: '100%', textAlign: 'center' }}>
            // 		{tipCount} tips available
            // 	</ThemedText>
            // )
          }
        </Card>
        <ThemedView>
          <ThemedView style={styles.videoContainer}>
            <Image
              source={require('@/assets/images/placeholder.png')}
              style={styles.video}
              resizeMode="contain"
            />
          </ThemedView>

          <ThemedView style={styles.videoContainer}></ThemedView>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.navButton]}
            onPress={() => {
              const newFrame = Math.max(0, frame - 1);
              updateFrame(newFrame);
            }}
          >
            <ThemedText type="defaultSemiBold">{'<'}</ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.frameIndicator}>
            <ScrollView
              ref={scrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.positionScroll}
              contentContainerStyle={styles.positionScrollContent}
            >
              {mockupProcessedData.frames.map((frameData, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.positionItem,
                    frame === idx ? styles.activePositionItem : null,
                  ]}
                  onPress={() => updateFrame(idx)}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={frame === idx ? styles.activePositionText : null}
                  >
                    {idx + 1}. {frameData.persons[0]?.step_position || '-'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          <TouchableOpacity
            style={[styles.button, styles.navButton]}
            onPress={() => {
              const newFrame = Math.min(
                mockupProcessedData.frames.length - 1,
                frame + 1,
              );
              updateFrame(newFrame);
            }}
          >
            <ThemedText type="defaultSemiBold">{'>'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.controlBox}>
          <ThemedView style={styles.controlLeft}>
            <ThemedText
              type="default"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: color.colors.border,
                width: '90%',
                textAlign: 'center',
              }}
            >
              Step
            </ThemedText>
            <ThemedView style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  const newFrame = Math.max(0, frame - 1);
                  updateFrame(newFrame);
                }}
              >
                <SkipBack size={32} color={color.colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  updateFrame(0);
                }}
              >
                <RotateCcw size={32} color={color.colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  const newFrame = Math.min(
                    mockupProcessedData.frames.length - 1,
                    frame + 1,
                  );
                  updateFrame(newFrame);
                }}
              >
                <SkipForward size={32} color={color.colors.primary} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.controlRight}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause color={color.colors.primary} size={32} />
              ) : (
                <Play color={color.colors.primary} size={32} />
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  videoContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.colors.border,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  // Navigation buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  navButton: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Frame indicator and scroll
  frameIndicator: {
    flex: 1,
    height: 50,
  },
  positionScroll: {
    width: '100%',
  },
  positionScrollContent: {
    alignItems: 'center',
  },
  positionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activePositionItem: {
    backgroundColor: color.colors.primaryForeground,
  },
  activePositionText: {
    color: color.colors.primary,
  },
  // Tips card
  tipsCard: {
    gap: 8,
    padding: 16,
    marginBottom: 16,
    maxHeight: 170,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  seeMoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: color.colors.primaryForeground,
    borderRadius: 12,
  },
  seeMoreText: {
    color: color.colors.primary,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: 12,
    paddingTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    marginRight: 8,
    color: color.colors.primary,
    fontSize: 18,
  },
  tipText: {
    flex: 1,
  },
  // Control box
  controlBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  controlLeft: {
    width: '80%',
    height: '100%',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: color.colors.border,
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: color.colors.primaryForeground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  videoExpandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: color.colors.border,
    marginBottom: 8,
  },
  collapsedVideoPlaceholder: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.colors.border,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
});

/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  Platform,
  View,
  ScrollView,
  TouchableOpacity,
  Button,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import {
  Lightbulb,
  RotateCcw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Maximize,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Keypoints, ProcessedData } from '@/constants/processedData';

const mockProcessedData: ProcessedData = {
  id: '123456',
  url: 'https://example.com/videos/shot_analysis.mp4',
  exercise_id: '42',
  role: 'client',
  frames: [
    {
      timestamp: 1200, // 1.2 secondes
      persons: [
        {
          step_position: 'shot_preparation',
          precision_global: 78,
          keypoint: {
            nose: { x: 320, y: 240, confidence: 0.92 },
            left_eye: { x: 310, y: 235, confidence: 0.91 },
            right_eye: { x: 330, y: 235, confidence: 0.91 },
            left_ear: { x: 300, y: 240, confidence: 0.85 },
            right_ear: { x: 340, y: 240, confidence: 0.87 },
            left_shoulder: { x: 300, y: 280, confidence: 0.95 },
            right_shoulder: { x: 340, y: 280, confidence: 0.96 },
            left_elbow: { x: 280, y: 320, confidence: 0.92 },
            right_elbow: { x: 360, y: 320, confidence: 0.93 },
            left_wrist: { x: 290, y: 350, confidence: 0.89 },
            right_wrist: { x: 350, y: 350, confidence: 0.91 },
            left_hip: { x: 310, y: 380, confidence: 0.88 },
            right_hip: { x: 330, y: 380, confidence: 0.89 },
            left_knee: { x: 310, y: 450, confidence: 0.87 },
            right_knee: { x: 330, y: 450, confidence: 0.88 },
            left_ankle: { x: 310, y: 510, confidence: 0.85 },
            right_ankle: { x: 330, y: 510, confidence: 0.86 },
          },
          angles: [
            {
              name: 'right_elbow',
              start_point: { x: 340, y: 280 }, // épaule droite
              middle_point: { x: 360, y: 320 }, // coude droit
              end_point: { x: 350, y: 350 }, // poignet droit
              angle: 110,
            },
            {
              name: 'left_elbow',
              start_point: { x: 300, y: 280 }, // épaule gauche
              middle_point: { x: 280, y: 320 }, // coude gauche
              end_point: { x: 290, y: 350 }, // poignet gauche
              angle: 120,
            },
            {
              name: 'right_knee',
              start_point: { x: 330, y: 380 }, // hanche droite
              middle_point: { x: 330, y: 450 }, // genou droit
              end_point: { x: 330, y: 510 }, // cheville droite
              angle: 175,
            },
          ],
          feedback: [
            'Your elbow angle is too wide',
            'Keep your elbow closer to your body',
            'Maintain vertical alignment',
          ],
          improvements: [
            {
              angle_index: 0, // coude droit
              target_angle: 90,
              direction: 'decrease',
              magnitude: 20,
              priority: 'high',
            },
            {
              angle_index: 1, // coude gauche
              target_angle: 100,
              direction: 'decrease',
              magnitude: 20,
              priority: 'medium',
            },
          ],
        },
      ],
    },
    {
      timestamp: 1800, // 1.8 secondes
      persons: [
        {
          step_position: 'shot_release',
          precision_global: 85,
          keypoint: {
            // ... données similaires mais avec position différente
            nose: { x: 320, y: 230, confidence: 0.94 },
            // ... autres keypoints similaires
            right_shoulder: { x: 340, y: 270, confidence: 0.97 },
            right_elbow: { x: 355, y: 290, confidence: 0.95 },
            right_wrist: { x: 365, y: 320, confidence: 0.94 },
            // ... autres keypoints
          } as Keypoints, // type assertion pour éviter d'écrire tous les points
          angles: [
            {
              name: 'right_elbow',
              start_point: { x: 340, y: 270 },
              middle_point: { x: 355, y: 290 },
              end_point: { x: 365, y: 320 },
              angle: 165,
            },
            // ... autres angles
          ],
          feedback: [
            'Good extension at release',
            'Follow through could be more pronounced',
          ],
          improvements: [
            {
              angle_index: 0,
              target_angle: 175,
              direction: 'increase',
              magnitude: 10,
              priority: 'low',
            },
          ],
        },
      ],
    },
  ],
};

function Feedback({ feedbacks }: { feedbacks: string[] }) {
  return feedbacks.map((feedback, index) => (
    <ThemedView key={index} style={styles.tipItem}>
      <ThemedText type='defaultSemiBold' style={styles.tipBullet}>
        •
      </ThemedText>
      <ThemedText type='description' style={styles.tipText}>
        {feedback}
      </ThemedText>
    </ThemedView>
  ));
}

export default function AnalysisDetailScreen() {
  const params = useLocalSearchParams();
  const colors = Colors;
  const video = React.useRef<Video>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [player, setPlayer] = useState(0);
  const [frame, setFrame] = useState(0);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);

  // Fonction pour faire défiler jusqu'à l'élément sélectionné
  const scrollToSelected = (index: number) => {
    if (scrollViewRef.current) {
      // Calculer la position approximative de l'élément
      const itemWidth = 150; // Largeur approximative de chaque élément avec marge
      const position = index * itemWidth;
      scrollViewRef.current.scrollTo({ x: position, animated: true });
    }
  };

  // Mettre à jour le frame et faire défiler
  const updateFrame = (newFrame: number): void => {
    setFrame(newFrame);
    setTimeout(() => scrollToSelected(newFrame), 100); // Léger délai pour assurer que l'état est mis à jour
  };

  const togglePlayPause = async () => {
    if (video.current) {
      if (isPlaying) {
        await video.current.pauseAsync();
      } else {
        await video.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const feedbacks = mockProcessedData.frames[frame].persons[player].feedback;
  const tipCount = feedbacks.length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Improvement Tips */}
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.tipsHeader}
            disabled={tipCount === 0}
            onPress={() => setTipsExpanded(!tipsExpanded)}
          >
            <ThemedView
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Lightbulb color={colors.light.principal} />
              <ThemedText type='subtitle'>Improvement</ThemedText>
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
            <Video
              ref={video}
              style={styles.video}
              source={require('@/assets/videos/pro_shot.mp4')}
              useNativeControls
              shouldPlay={false}
              isLooping
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  setIsPlaying(status.isPlaying);
                }
              }}
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
            <ThemedText type='defaultSemiBold'>{'<'}</ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.frameIndicator}>
            <ScrollView
              ref={scrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.positionScroll}
              contentContainerStyle={styles.positionScrollContent}
            >
              {mockProcessedData.frames.map((frameData, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.positionItem,
                    frame === idx ? styles.activePositionItem : null,
                  ]}
                  onPress={() => updateFrame(idx)}
                >
                  <ThemedText
                    type='defaultSemiBold'
                    style={frame === idx ? styles.activePositionText : null}
                  >
                    {idx + 1}. {frameData.persons[player]?.step_position || '-'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>

          <TouchableOpacity
            style={[styles.button, styles.navButton]}
            onPress={() => {
              const newFrame = Math.min(
                mockProcessedData.frames.length - 1,
                frame + 1
              );
              updateFrame(newFrame);
            }}
          >
            <ThemedText type='defaultSemiBold'>{'>'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.controlBox}>
          <ThemedView style={styles.controlLeft}>
            <ThemedText
              type='default'
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.light.border,
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
                <SkipBack size={32} color={colors.light.principal} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  updateFrame(0);
                }}
              >
                <RotateCcw size={32} color={colors.light.principal} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  const newFrame = Math.min(
                    mockProcessedData.frames.length - 1,
                    frame + 1
                  );
                  updateFrame(newFrame);
                }}
              >
                <SkipForward size={32} color={colors.light.principal} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.controlRight}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause color={colors.light.principal} size={32} />
              ) : (
                <Play color={colors.light.principal} size={32} />
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
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  activePositionText: {
    color: Colors.light.principal,
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
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
  },
  seeMoreText: {
    color: Colors.light.principal,
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
    color: 'gold',
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
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
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
    borderBottomColor: Colors.light.border,
    marginBottom: 8,
  },
  collapsedVideoPlaceholder: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
});

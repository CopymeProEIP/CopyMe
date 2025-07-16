/** @format */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  RotateCcw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
} from 'lucide-react-native';
import color from '@/app/theme/color';

type VideoControlsProps = {
  currentFrame: number;
  totalFrames: number;
  frames: any[]; // Ajout des données des frames
  isPlaying: boolean;
  onPreviousFrame: () => void;
  onNextFrame: () => void;
  onResetFrame: () => void;
  onPlayPauseToggle: () => void;
  onJumpToFrame: (frameIndex: number) => void; // Nouvelle fonction pour sauter à un frame spécifique
};

const VideoControls = ({
  currentFrame,
  totalFrames,
  frames,
  isPlaying,
  onPreviousFrame,
  onNextFrame,
  onResetFrame,
  onPlayPauseToggle,
  onJumpToFrame,
}: VideoControlsProps) => {
  // Fonction pour trouver l'index du prochain frame avec une classe différente
  const findNextClassChange = () => {
    if (frames.length === 0 || currentFrame >= frames.length - 1)
      return currentFrame;

    const currentClassName =
      frames[currentFrame].class_name ||
      frames[currentFrame].persons?.[0]?.step_position ||
      '';

    for (let i = currentFrame + 1; i < frames.length; i++) {
      const nextClassName =
        frames[i].class_name || frames[i].persons?.[0]?.step_position || '';

      if (nextClassName && nextClassName !== currentClassName) {
        return i;
      }
    }

    return frames.length - 1; // Si aucune différence trouvée, aller à la fin
  };

  // Fonction pour trouver l'index du frame précédent avec une classe différente
  const findPreviousClassChange = () => {
    if (frames.length === 0 || currentFrame <= 0) return 0;

    const currentClassName =
      frames[currentFrame].class_name ||
      frames[currentFrame].persons?.[0]?.step_position ||
      '';

    for (let i = currentFrame - 1; i >= 0; i--) {
      const prevClassName =
        frames[i].class_name || frames[i].persons?.[0]?.step_position || '';

      if (prevClassName && prevClassName !== currentClassName) {
        return i;
      }
    }

    return 0; // Si aucune différence trouvée, aller au début
  };

  return (
    <ThemedView style={styles.controlBox}>
      <ThemedView style={styles.controlLeft}>
        <ThemedText type="default" style={styles.stepText}>
          Step
        </ThemedText>
        <ThemedView style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              const prevClassIndex = findPreviousClassChange();
              onJumpToFrame(prevClassIndex);
            }}
          >
            <SkipBack size={32} color={color.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onResetFrame}>
            <RotateCcw size={32} color={color.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              const nextClassIndex = findNextClassChange();
              onJumpToFrame(nextClassIndex);
            }}
          >
            <SkipForward size={32} color={color.colors.primary} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.controlRight}>
        <TouchableOpacity style={styles.playButton} onPress={onPlayPauseToggle}>
          {isPlaying ? (
            <Pause color={color.colors.primary} size={32} />
          ) : (
            <Play color={color.colors.primary} size={32} />
          )}
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
  stepText: {
    borderBottomWidth: 1,
    borderBottomColor: color.colors.border,
    width: '90%',
    textAlign: 'center',
  },
});

export default VideoControls;

/** @format */

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  ForwardRefRenderFunction,
} from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import color from '@/app/theme/color';

type FrameNavigatorProps = {
  frames: any[];
  currentFrame: number;
  onFrameChange: (frameIndex: number) => void;
};

export interface FrameNavigatorRef {
  scrollToSelected: (index: number) => void;
}

const FrameNavigator: ForwardRefRenderFunction<
  FrameNavigatorRef,
  FrameNavigatorProps
> = ({ frames, currentFrame, onFrameChange }, ref) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToSelected = (index: number) => {
    if (scrollViewRef.current) {
      const itemWidth = 150; // Largeur approximative de chaque élément

      // Si on est vers la fin du tableau, s'assurer que nous voyons les derniers éléments
      if (index >= frames.length - 3) {
        // Pour les derniers éléments, faire défiler au maximum vers la droite
        scrollViewRef.current.scrollToEnd({ animated: true });
      } else if (index <= 2) {
        // Pour les premiers éléments, revenir au début
        scrollViewRef.current.scrollTo({ x: 0, animated: true });
      } else {
        // Pour les éléments au milieu, centrer l'élément sélectionné
        const position = Math.max(0, index * itemWidth - 100); // 100 pixels de marge pour centrer
        scrollViewRef.current.scrollTo({ x: position, animated: true });
      }
    }
  };

  // Exposer la fonction scrollToSelected via la ref
  useImperativeHandle(ref, () => ({
    scrollToSelected,
  }));

  const updateFrame = (newFrame: number): void => {
    onFrameChange(newFrame);
    setTimeout(() => scrollToSelected(newFrame), 100);
  };

  return (
    <ThemedView style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.navButton]}
        onPress={() => {
          const newFrame = Math.max(0, currentFrame - 1);
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
          {frames.map((frameData, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.positionItem,
                currentFrame === idx ? styles.activePositionItem : null,
              ]}
              onPress={() => updateFrame(idx)}
            >
              <ThemedText
                type="defaultSemiBold"
                style={currentFrame === idx ? styles.activePositionText : null}
              >
                {idx + 1}.{' '}
                {frameData.class_name ||
                  frameData.persons?.[0]?.step_position ||
                  '-'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <TouchableOpacity
        style={[styles.button, styles.navButton]}
        onPress={() => {
          const newFrame = Math.min(frames.length - 1, currentFrame + 1);
          updateFrame(newFrame);
        }}
      >
        <ThemedText type="defaultSemiBold">{'>'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
});

export default forwardRef(FrameNavigator);

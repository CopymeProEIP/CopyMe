import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnUI,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    // Il est important d'initialiser l'animation à l'intérieur du useEffect
    // Les animations doivent être lancées depuis le thread UI
    const startAnimation = () => {
      'worklet';
      rotationAnimation.value = withRepeat(
        withSequence(
          withTiming(25, { duration: 150 }),
          withTiming(0, { duration: 150 }),
        ),
        4,
      );
    };

    runOnUI(startAnimation)();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotate: `${rotationAnimation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});

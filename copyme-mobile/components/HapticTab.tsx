import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          ReactNativeHapticFeedback.trigger('impactLight');
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

import React from 'react';
import { TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ThemedTextInputProps extends TextInputProps {
}

export function TextInput(props: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const { style, ...otherProps } = props;

  const themeTextColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const themePlaceholderColor = colorScheme === 'dark'
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)';

  return (
    <RNTextInput
      style={[
        styles.input,
        { color: themeTextColor },
        style
      ]}
      placeholderTextColor={themePlaceholderColor}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    padding: 0,
  },
});

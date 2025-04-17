import { Text, type TextProps, StyleSheet, TextStyle } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'small'
    | 'description'
    | 'button'
    | 'error'
    | 'success';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getTypeStyle = (
    type: ThemedTextProps['type']
  ): TextStyle | undefined => {
    switch (type) {
      case 'default':
        return styles.default;
      case 'title':
        return styles.title;
      case 'defaultSemiBold':
        return styles.defaultSemiBold;
      case 'subtitle':
        return styles.subtitle;
      case 'link':
        return styles.link;
      case 'small':
        return { fontSize: 12 };
      case 'description':
        return styles.description;
      case 'button':
        return styles.button;
      case 'error':
        return styles.error;
      case 'success':
        return styles.success;
      default:
        return undefined;
    }
  };

  return <Text style={[{ color }, getTypeStyle(type), style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  error: {
    fontSize: 14,
    color: 'red',
    lineHeight: 20,
  },
  success: {
    fontSize: 14,
    color: 'green',
    lineHeight: 20,
  },
});

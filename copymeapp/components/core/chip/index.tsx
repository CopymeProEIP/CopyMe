import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface ChipProps {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined';
  color?: string;
  label: string;
}

function Chip(props: ChipProps) {
  const { colors } = useTheme();

  const getFontSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 10;
      case 'medium':
        return 13;
      case 'large':
        return 16;
      default:
        return 12;
    }
  };

  const getPadding = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return { paddingVertical: 2, paddingHorizontal: 8 };
      case 'medium':
        return { paddingVertical: 4, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 6, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 16 };
    }
  };

  const getBackgroundColor = (
    variant: 'filled' | 'outlined',
    color: string
  ) => {
    return variant === 'filled' ? color : 'transparent';
  };

  const getBorderColor = (variant: 'filled' | 'outlined', color: string) => {
    return variant === 'outlined' ? color : 'transparent';
  };

  const getTextColor = (
    variant: 'filled' | 'outlined',
    color: string,
    defaultTextColor: string
  ) => {
    return variant === 'filled' ? '#fff' : color || defaultTextColor;
  };

  const fontSize = getFontSize(props.size || 'medium');
  const padding = getPadding(props.size || 'medium');
  const backgroundColor = getBackgroundColor(
    props.variant || 'filled',
    props.color || colors.primary
  );
  const borderColor = getBorderColor(
    props.variant || 'outlined',
    props.color || colors.primary
  );
  const textColor = getTextColor(
    props.variant || 'filled',
    props.color || colors.primary,
    colors.text
  );

  return (
    <ThemedView
      style={[styles.container, padding, { backgroundColor, borderColor }]}
    >
      {props.startIcon && (
        <ThemedView style={styles.icon}>{props.startIcon}</ThemedView>
      )}
      <ThemedText
        type='defaultSemiBold'
        style={{
          color: textColor,
          fontSize,
        }}
      >
        {props.label}
      </ThemedText>
      {props.endIcon && (
        <ThemedView style={styles.icon}>{props.endIcon}</ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
});

export default Chip;

/** @format */

import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@react-navigation/native';

export type FilterOption = {
  id: string;
  label: string;
};

interface FilterChipsProps {
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function FilterChips({
  options,
  selectedIds,
  onToggle,
}: FilterChipsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onToggle(option.id)}
            activeOpacity={0.7}
          >
            <ThemedView
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? 'gold' : 'transparent',
                  borderColor: isSelected ? 'gold' : colors.border,
                },
              ]}
            >
              <ThemedText
                type='default'
                style={{ color: isSelected ? '#000' : colors.text }}
              >
                {option.label}
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/** @format */

import { StyleSheet, TextInput } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Search } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search exercises...',
}: SearchBarProps) {
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');

  const handleChange = (text: string) => {
    setSearchText(text);
    onSearch(text);
  };

  return (
    <ThemedView style={[styles.container, { borderColor: colors.border }]}>
      <Search size={20} color={colors.text} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor={colors.text + '80'}
        placeholder={placeholder}
        value={searchText}
        onChangeText={handleChange}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
});

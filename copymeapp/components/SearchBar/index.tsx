/** @format */

import { TextInput } from 'react-native';
import { ThemedView } from '../ThemedView';
import { Search } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { useState } from 'react';
import { styles } from './styles';

interface SearchBarProps {
	onSearch: (text: string) => void;
	placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search exercises...' }: SearchBarProps) {
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

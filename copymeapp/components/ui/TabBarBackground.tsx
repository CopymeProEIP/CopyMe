/** @format */

import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function TabBarBackground({ forceLight = false }) {
	const colorScheme = forceLight ? 'light' : useColorScheme();

	if (colorScheme === 'dark') {
		return <ThemedView style={StyleSheet.absoluteFill} />;
	}

	return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />;
}

export function useBottomTabOverflow() {
	return 0;
}

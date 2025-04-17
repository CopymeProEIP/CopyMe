/** @format */

import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

// Ajouter la prop forceLight pour permettre de forcer le mode clair
export default function TabBarBackground({ forceLight = false }) {
	// Si forceLight est vrai, utiliser toujours 'light', sinon utiliser la valeur de useColorScheme
	const colorScheme = forceLight ? 'light' : useColorScheme();

	if (colorScheme === 'dark') {
		return <ThemedView style={StyleSheet.absoluteFill} />;
	}

	// En mode clair (ou forcé en clair), utiliser un fond blanc
	return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF' }]} />;
}

export function useBottomTabOverflow() {
	return 0;
}

/** @format */

import { StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ReactNode } from 'react';
import { useTheme } from '@react-navigation/native';

interface CardProps {
	children: ReactNode;
	style?: any;
}

export function Card({ children, style }: CardProps) {
	const { colors } = useTheme();

	return (
		<ThemedView style={[styles.container, { borderColor: colors.border }, style]}>
			{children}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
});

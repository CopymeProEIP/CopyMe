/** @format */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import color from '@/app/theme/color';

interface ButtonProps {
	onPress: () => void;
	title: string;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function Button({ onPress, title, loading, style }: ButtonProps) {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.button, style]} disabled={loading}>
			{loading ? (
				<ActivityIndicator color='#fff' />
			) : (
				<Text style={styles.buttonText}>{title}</Text>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: color.colors.primary,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		height: 50,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

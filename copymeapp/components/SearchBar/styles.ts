/** @format */

import { StyleSheet } from 'react-native';
import { theme } from '@/styles/theme';

export const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: theme.spacing.md,
		paddingVertical: 14,
		borderWidth: 1,
		borderRadius: theme.borderRadius.pill,
		marginBottom: theme.spacing.md,
	},
	input: {
		flex: 1,
		marginLeft: theme.spacing.sm,
		fontSize: theme.typography.fontSize.default,
		padding: 0,
	},
});

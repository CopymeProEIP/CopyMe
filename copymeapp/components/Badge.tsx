/** @format */

import { ThemedText, ThemedTextProps } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';
import getTypeStyle from '@/app/theme/typeStyle';

export function Badge({
	text,
	type = 'default',
}: {
	text: string;
	type?: ThemedTextProps['type'];
}) {
	const badgeStyle = {
		...styles.levelBadge,
		borderColor: getTypeStyle(type)?.color || '#000',
	};

	return (
		<ThemedView style={badgeStyle}>
			<ThemedText type={type} style={{ fontSize: 12 }}>
				{text}
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	levelBadge: {
		borderWidth: 1,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 16,
	},
});

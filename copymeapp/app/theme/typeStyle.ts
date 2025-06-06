/** @format */

import { ThemedTextProps } from "@/components/ThemedText";
import { StyleSheet, TextStyle } from "react-native";
import color from "./color";

const getTypeStyle = (type: ThemedTextProps['type']): TextStyle | undefined => {
	switch (type) {
		case 'default':
			return styles.default;
		case 'title':
			return styles.title;
		case 'defaultSemiBold':
			return styles.defaultSemiBold;
		case 'subtitle':
			return styles.subtitle;
		case 'link':
			return styles.link;
		case 'small':
			return { fontSize: 12 };
		case 'description':
			return styles.description;
		case 'button':
			return styles.button;
		case 'error':
			return styles.error;
		case 'success':
			return styles.success;
		case 'primary':
			return styles.primary;
		default:
			return undefined;
	}
};

const styles = StyleSheet.create({
	default: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: 'Inter-Regular',
	},
	defaultSemiBold: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: 'Inter-SemiBold',
	},
	title: {
		fontSize: 32,
		lineHeight: 40,
		fontFamily: 'BarlowCondensed-Bold',
	},
	subtitle: {
		fontSize: 24,
		lineHeight: 32,
		fontFamily: 'BarlowCondensed-SemiBold',
	},
	link: {
		fontSize: 16,
		lineHeight: 30,
		fontFamily: 'Inter-Medium',
		textDecorationLine: 'underline',
		color: '#0a7ea4',
	},
	description: {
		fontSize: 14,
		lineHeight: 20,
		fontFamily: 'Inter-Regular',
	},
	button: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: 'Inter-SemiBold',
		color: '#FFFFFF',
		backgroundColor: '#FF6A00',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		textAlign: 'center',
	},
	error: {
		fontSize: 14,
		lineHeight: 20,
		fontFamily: 'Inter-Bold',
		color: '#FF4D4D',
	},
	success: {
		fontSize: 14,
		lineHeight: 20,
		fontFamily: 'Inter-Bold',
		color: '#2ECC71',
	},
	primary: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: 'Inter-SemiBold',
		color: color.colors.primary,
	},
});

export default getTypeStyle;

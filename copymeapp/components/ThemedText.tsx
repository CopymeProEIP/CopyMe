/** @format */

import { Text, TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import getTypeStyle from '@/app/theme/typeStyle';

export type ThemedTextProps = TextProps & {
	lightColor?: string;
	darkColor?: string;
	type?:
		| 'default'
		| 'title'
		| 'defaultSemiBold'
		| 'subtitle'
		| 'link'
		| 'small'
		| 'description'
		| 'button'
		| 'error'
		| 'success'
		| 'primary';
};

export function ThemedText({
	style,
	lightColor,
	darkColor,
	type = 'default',
	...rest
}: ThemedTextProps) {
	const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

	return <Text style={[{ color }, getTypeStyle(type), style]} {...rest} />;
}

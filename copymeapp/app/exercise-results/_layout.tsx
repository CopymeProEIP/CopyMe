/** @format */

import { RouteProp } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import color from '../theme/color';

export default function ExerciseResultsLayout() {
	return (
		<Stack
			screenOptions={({ navigation }) => ({
				headerStyle: {
					backgroundColor: color.colors.background,
					paddingBottom: 10,
				},
				headerTintColor: color.colors.textPrimary,
				headerTitleStyle: {
					fontWeight: '600',
				},
				contentStyle: {
					backgroundColor: color.colors.background,
				},
				animation: 'slide_from_right',
				headerShadowVisible: false,
				headerLeft: () => (
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={{ marginRight: 10, padding: 5 }}>
						<ChevronLeft size={24} color={color.colors.textPrimary} />
					</TouchableOpacity>
				),
			})}>
			<Stack.Screen
				name='[id]'
				options={({ route }: { route: RouteProp<any, string> }) => ({
					headerTitle: route.params?.title || 'Analysis Page',
				})}
			/>
		</Stack>
	);
}

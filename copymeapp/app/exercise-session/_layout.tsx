/** @format */

import { Stack } from 'expo-router';
import { RouteProp } from '@react-navigation/native';

export default function ExerciseSessionLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: '#FFFFFF',
					// Suppression de paddingBottom qui n'est pas une propriété valide
				},
				headerTintColor: '#000000',
				headerTitleStyle: {
					fontWeight: '600',
				},
				contentStyle: {
					backgroundColor: 'white',
				},
				animation: 'slide_from_right',
				headerShadowVisible: false,
			}}>
			<Stack.Screen
				name='[id]'
				options={({ route }: { route: RouteProp<any, string> }) => ({
					headerTitle: route.params?.title || 'Exercise Session',
				})}
			/>
		</Stack>
	);
}

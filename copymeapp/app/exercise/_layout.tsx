/** @format */

import { Stack } from 'expo-router';
import { RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function ExerciseLayout() {
	return (
		<Stack
			screenOptions={({ navigation }) => ({
				headerStyle: {
					backgroundColor: '#FFFFFF',
					paddingBottom: 10,
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
				headerLeft: () => (
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={{ marginRight: 10, padding: 5 }}>
						<ChevronLeft size={24} color='#000' />
					</TouchableOpacity>
				),
			})}>
			<Stack.Screen
				name='[id]'
				options={({ route }: { route: RouteProp<any, string> }) => ({
					headerTitle: 'Exercise Details',
				})}
			/>
		</Stack>
	);
}

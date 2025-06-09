/** @format */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Activity } from 'lucide-react-native';
import { useProtectedRoute } from '@/utils/auth';
import color from '../theme/color';

export default function TabLayout() {
	useProtectedRoute(true);
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: color.colors.primary,
				tabBarInactiveTintColor: Colors.light.tabIconDefault,
				tabBarButton: (props) => {
					const { ref, ...otherProps } = props;
					return <HapticTab {...otherProps} />;
				},
				tabBarStyle: {
					borderTopColor: color.colors.border,
					borderTopWidth: 1,
					...Platform.select({
						ios: {
							position: 'absolute',
						},
						default: {},
					}),
				},
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					headerShown: false,
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='house.fill' color={color} />,
				}}
			/>
			<Tabs.Screen
				name='exercises'
				options={{
					title: 'Train',
					headerShown: false,
					tabBarIcon: ({ color }) => <IconSymbol size={28} name='basketball' color={color} />,
				}}
			/>
			<Tabs.Screen
				name='analysis'
				options={{
					title: 'Analysis',
					headerShown: false,
					tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
				}}
			/>
		</Tabs>
	);
}

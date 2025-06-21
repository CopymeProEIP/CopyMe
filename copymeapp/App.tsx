import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Home, Dumbbell, BarChart3, User } from 'lucide-react-native';

import LoginScreen from '@/app/login';
import RegisterScreen from '@/app/register';
import HomeScreen from '@/app/(tabs)/index';
import ExercisesScreen from '@/app/(tabs)/exercises';
import AnalysisScreen from '@/app/(tabs)/analysis';
import ProfileScreen from '@/app/(tabs)/profile';
import ExerciseDetailScreen from '@/app/exercise/[id]';
import ExerciseSessionScreen from '@/app/exercise-session/[id]';
import ExerciseResultsScreen from '@/app/exercise-results/[id]';
import AnalyzeScreen from '@/app/analyze/[id]';
import NotFoundScreen from '@/app/+not-found';

import { AuthProvider } from '@/utils/auth';
import { useColorScheme } from '@/hooks/useColorScheme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          tabBarLabel: 'Exercices',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarLabel: 'Analyse',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AuthProvider>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
          />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
            <Stack.Screen name="ExerciseSession" component={ExerciseSessionScreen} />
            <Stack.Screen name="ExerciseResults" component={ExerciseResultsScreen} />
            <Stack.Screen name="Analyze" component={AnalyzeScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
          </Stack.Navigator>
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

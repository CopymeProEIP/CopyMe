import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Home,
  Dumbbell,
  BarChart3,
  User,
  ChevronLeft,
} from 'lucide-react-native';

import LoginScreen from '@/app/login';
import RegisterScreen from '@/app/register';
import HomeScreen from '@/app/(tabs)/index';
import ExercisesScreen from '@/app/(tabs)/exercises';
import AnalysisScreen from '@/app/(tabs)/analysis';
import ProfileScreen from '@/app/(tabs)/profile';
import ExerciseDetailScreen from '@/app/exercise/[id]';
import ExerciseSessionScreen from '@/app/exercise-session/[id]';
import ExerciseResultsScreen from '@/app/exercise-results/[id]';
import AnalyzeScreen from '@/app/analyze/ezaezz[id]';
import NotFoundScreen from '@/app/+not-found';

import { AuthProvider } from '@/utils/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import color from './app/theme/color';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeIcon = ({
  color: iconColor,
  size,
}: {
  color: string;
  size: number;
}) => <Home color={iconColor} size={size} />;

const DumbbellIcon = ({
  color: iconColor,
  size,
}: {
  color: string;
  size: number;
}) => <Dumbbell color={iconColor} size={size} />;

const BarChartIcon = ({
  color: iconColor,
  size,
}: {
  color: string;
  size: number;
}) => <BarChart3 color={iconColor} size={size} />;

const UserIcon = ({
  color: iconColor,
  size,
}: {
  color: string;
  size: number;
}) => <User color={iconColor} size={size} />;

// Composant de bouton de retour personnalisé pour l'écran d'analyse
const CustomBackButton = ({ navigation }: { navigation: any }) => (
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.navigate('Main', { screen: 'Analysis' })}
  >
    <ChevronLeft color={color.colors.textPrimary} size={24} />
  </TouchableOpacity>
);

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
        tabBarActiveTintColor: color.colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          tabBarLabel: 'Exercices',
          tabBarIcon: DumbbellIcon,
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarLabel: 'Analyse',
          tabBarIcon: BarChartIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: UserIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
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
            <Stack.Screen
              name="ExerciseDetail"
              component={ExerciseDetailScreen}
              options={{
                headerShown: true,
                title: "Détail de l'exercice",
                headerStyle: {
                  backgroundColor: color.colors.background,
                },
                headerTintColor: color.colors.textPrimary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="ExerciseSession"
              component={ExerciseSessionScreen}
              options={{
                headerShown: true,
                title: "Session d'exercice",
                headerStyle: {
                  backgroundColor: color.colors.background,
                },
                headerTintColor: color.colors.textPrimary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="ExerciseResults"
              component={ExerciseResultsScreen}
              options={{
                headerShown: true,
                title: 'Résultats',
                headerStyle: {
                  backgroundColor: color.colors.background,
                },
                headerTintColor: color.colors.textPrimary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="Analyze"
              component={AnalyzeScreen}
              options={({ navigation }) => ({
                headerShown: true,
                title: 'Analyse',
                headerStyle: {
                  backgroundColor: color.colors.background,
                },
                headerTintColor: color.colors.textPrimary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerLeft: () => <CustomBackButton navigation={navigation} />,
              })}
            />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
          </Stack.Navigator>
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: 10,
  },
});

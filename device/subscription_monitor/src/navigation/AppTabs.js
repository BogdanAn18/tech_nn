import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Подписки') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Аналитика') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen 
        name="Подписки" 
        component={HomeScreen} 
        options={{ title: 'Мои подписки' }}
      />
      <Tab.Screen 
        name="Аналитика" 
        component={AnalyticsScreen} 
        options={{ title: 'Аналитика' }}
      />
    </Tab.Navigator>
  );
}
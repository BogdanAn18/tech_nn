import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
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
        headerShown: false, // скрываем заголовок табов, так как заголовки будут внутри стеков
      })}
    >
      <Tab.Screen 
        name="Подписки" 
        component={HomeStack} 
        options={{ title: 'Подписки' }} // это название вкладки
      />
      <Tab.Screen 
        name="Аналитика" 
        component={AnalyticsScreen} 
        options={{ title: 'Аналитика' }}
      />
    </Tab.Navigator>
  );
}
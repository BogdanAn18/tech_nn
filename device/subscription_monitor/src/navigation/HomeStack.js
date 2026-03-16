import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SubscriptionFormScreen from '../screens/SubscriptionFormScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#667eea' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'Мои подписки' }}
      />
      <Stack.Screen 
        name="SubscriptionForm" 
        component={SubscriptionFormScreen} 
        options={({ route }) => ({ 
          title: route.params?.id ? 'Редактировать' : 'Добавить подписку'
        })}
      />
    </Stack.Navigator>
  );
}
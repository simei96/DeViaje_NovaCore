import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ProfileScreen from './profile';
import RegisterScreen from './register';
import { useLocalSearchParams } from 'expo-router';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const params = useLocalSearchParams();
  const returnTo = params.returnTo || null;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile-main" component={ProfileScreen} initialParams={{ returnTo }} />
      <Stack.Screen name="register" component={RegisterScreen} initialParams={{ returnTo }} />
      <Stack.Screen name="EditProfile" component={require('./editProfile').default} />
      <Stack.Screen name="Login" component={RegisterScreen} initialParams={{ returnTo }} />
    </Stack.Navigator>
  );
}

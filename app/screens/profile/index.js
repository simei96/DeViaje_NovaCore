import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ProfileScreen from './profile';
import RegisterScreen from './register';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile-main" component={ProfileScreen} />
      <Stack.Screen name="register" component={RegisterScreen} />
      <Stack.Screen name="EditProfile" component={require('./editProfile').default} />
      <Stack.Screen name="Login" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

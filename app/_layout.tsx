
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });
  const appBg = '#f6fafd';
  React.useEffect(() => { SystemUI.setBackgroundColorAsync(appBg).catch(()=>{}); }, []);

  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const adjustedTheme = {
    ...baseTheme,
    colors: { ...baseTheme.colors, background: appBg, card: appBg },
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={adjustedTheme}>
      <Stack initialRouteName="index" screenOptions={{
        headerShown:false,
  contentStyle:{ backgroundColor: appBg },
        statusBarTranslucent:true,
        statusBarStyle: colorScheme === 'dark' ? 'light' : 'dark',
        statusBarBackgroundColor:'transparent'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
  {/* Barra de estado realmente transparente y adaptativa */}
  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
    </ThemeProvider>
  );
}

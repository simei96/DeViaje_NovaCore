import React from 'react';
import { Text, View } from 'react-native';

export function HelloWave() {
  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <Text style={{ fontSize: 32 }}>👋</Text>
      <Text style={{ fontSize: 18, color: '#1976D2', fontWeight: 'bold' }}>¡Hola!</Text>
    </View>
  );
}

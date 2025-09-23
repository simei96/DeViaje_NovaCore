import React from 'react';
import { View, ViewProps } from 'react-native';

export function ThemedView(props: ViewProps) {
  // Puedes personalizar estilos según el tema aquí
  return <View {...props} />;
}

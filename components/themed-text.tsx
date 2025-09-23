import React from 'react';
import { Text, TextProps } from 'react-native';

export function ThemedText(props: TextProps) {
  // Puedes personalizar estilos según el tema aquí
  return <Text {...props} />;
}

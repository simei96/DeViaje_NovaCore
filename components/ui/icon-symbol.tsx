import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

type IconSymbolProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconSymbol({ name, size = 24, color = '#000', style }: IconSymbolProps) {
  // Puedes personalizar este componente para mostrar íconos reales
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', width: size, height: size, backgroundColor: 'transparent' }, style]}>
      <Text style={{ color, fontSize: size * 0.8 }}>{name}</Text>
    </View>
  );
}

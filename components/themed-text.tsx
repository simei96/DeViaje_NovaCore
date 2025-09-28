import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'button';

interface Props extends TextProps {
  variant?: Variant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const fontMap: Record<NonNullable<Props['weight']>, string> = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semibold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
};

const variantStyles: Record<Variant, any> = {
  title: { fontSize: 28, lineHeight: 32, fontFamily: fontMap.bold },
  subtitle: { fontSize: 16, lineHeight: 22, fontFamily: fontMap.semibold },
  body: { fontSize: 14, lineHeight: 20, fontFamily: fontMap.regular },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontMap.regular },
  button: { fontSize: 15, lineHeight: 18, fontFamily: fontMap.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
};

export function ThemedText({ variant = 'body', weight, style, children, ...rest }: Props) {
  const base = variantStyles[variant];
  const overrideWeight = weight ? { fontFamily: fontMap[weight] } : null;
  return (
    <Text {...rest} style={StyleSheet.flatten([base, overrideWeight, style])}>
      {children}
    </Text>
  );
}


import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type ParallaxScrollViewProps = {
  children: React.ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
  headerImage?: React.ReactNode;
};

export default function ParallaxScrollView({ children, headerBackgroundColor, headerImage }: ParallaxScrollViewProps) {
  // Aquí puedes agregar lógica de parallax si lo necesitas
  return (
    <ScrollView style={[styles.container, headerBackgroundColor ? { backgroundColor: headerBackgroundColor.light } : {}]}>
      {headerImage}
      <View>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

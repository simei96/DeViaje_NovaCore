
import React from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

type SkeletonLoaderProps = {
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ height = 20, width = '100%', borderRadius = 8, style }) => (
  <View style={[styles.skeleton, { height, width, borderRadius }, style]} />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
    marginVertical: 8,
    shadowColor: '#bdbdbd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default SkeletonLoader;

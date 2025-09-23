import React from 'react';
import { Linking, Text, TouchableOpacity } from 'react-native';

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)}>
      <Text style={{ color: '#1976D2', textDecorationLine: 'underline' }}>{children}</Text>
    </TouchableOpacity>
  );
}

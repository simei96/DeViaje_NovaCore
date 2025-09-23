import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginVertical: 8 }}>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      </TouchableOpacity>
      {open && <View style={{ marginTop: 6 }}>{children}</View>}
    </View>
  );
}

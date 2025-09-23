import React from 'react';
import { Text, View } from 'react-native';

export default function Home() {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
			<Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222' }}>Home</Text>
		</View>
	);
}

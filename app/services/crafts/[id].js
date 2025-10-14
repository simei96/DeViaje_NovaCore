import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SAMPLE_DATA = [
	{ id: '1', title: 'Cerámica de San Juan', image: 'https://images.unsplash.com/photo-1560184897-6b8f7f6f3f6f?auto=format&fit=crop&w=1200&q=80', category: 'Cerámica', rating: 4.4, price: 'C$ 250', desc: 'Piezas hechas a mano, esmaltadas tradicionalmente por familias de la zona.' },
	{ id: '2', title: 'Textiles de Masaya', image: 'https://images.unsplash.com/photo-1520975698516-2f7f4b7a0a7b?auto=format&fit=crop&w=1200&q=80', category: 'Textiles', rating: 4.6, price: 'C$ 180', desc: 'Coloridos tejidos tradicionales, perfectos para decoración y regalos.' },
	{ id: '3', title: 'Joyería Artesanal', image: 'https://images.unsplash.com/photo-1522441815192-6a4c2a6f8b6b?auto=format&fit=crop&w=1200&q=80', category: 'Joyería', rating: 4.7, price: 'C$ 520', desc: 'Collares y pulseras elaboradas por artesanos locales con materiales autóctonos.' },
	{ id: '4', title: 'Cestas de Mimbre', image: 'https://images.unsplash.com/photo-1505842465776-3a1433f1b8b6?auto=format&fit=crop&w=1200&q=80', category: 'Otros', rating: 4.3, price: 'C$ 90', desc: 'Cestas utilitarias y decorativas hechas a mano.' },
];

export default function Detail() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const item = SAMPLE_DATA.find(i => i.id === id) || SAMPLE_DATA[0];

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
			<Image source={{ uri: item.image }} style={styles.hero} resizeMode="cover" />
			<View style={styles.content}>
				<View style={styles.rowTop}>
					<Text style={styles.title}>{item.title}</Text>
					<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
						<MaterialCommunityIcons name="arrow-left" size={20} color="#283593" />
					</TouchableOpacity>
				</View>

				<View style={styles.metaRow}>
					<Text style={styles.cat}>{item.category}</Text>
					<View style={styles.ratingWrap}>
						<MaterialCommunityIcons name="star" size={14} color="#FFD700" />
						<Text style={styles.rating}>{item.rating}</Text>
					</View>
				</View>

				<Text style={styles.price}>{item.price}</Text>

				<Text style={styles.desc}>{item.desc}</Text>

				{/* ...agregar galería, contacto del artesano, botón de reservar/comprar, etc. */}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f6fafd' },
	hero: { width: '100%', height: 300, backgroundColor: '#ddd' },
	content: { padding: 16 },
	rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	title: { fontSize: 22, fontWeight: '700', color: '#283593', flex: 1 },
	backBtn: { marginLeft: 12, padding: 6 },
	metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
	cat: { color: '#666', fontSize: 13 },
	ratingWrap: { flexDirection: 'row', alignItems: 'center' },
	rating: { marginLeft: 6, color: '#444', fontWeight: '700' },
	price: { marginTop: 12, color: '#1976d2', fontWeight: '700', fontSize: 18 },
	desc: { marginTop: 12, color: '#444', lineHeight: 20 },
});

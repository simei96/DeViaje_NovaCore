import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
function SearchBar({ value, onChange, placeholder = 'Buscar...', compact = false, containerStyle }) {
	return (
		<View style={[{ paddingHorizontal: 12, paddingVertical: compact ? 6 : 12, backgroundColor: 'transparent' }, containerStyle]}>
			<View style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}>
				<MaterialCommunityIcons name="magnify" size={18} color="#666" />
				<TextInput
					value={value}
					onChangeText={onChange}
					placeholder={placeholder}
					style={{ marginLeft: 8, flex: 1, padding: 0 }}
					returnKeyType="search"
				/>
			</View>
		</View>
	);
}

import { ScrollView } from 'react-native';
import { db } from '../../firebaseConfig';
function FilterBar({ selected, onSelect }) {
	const options = [
		{ key: null, label: 'Todas' },
		{ key: 'free', label: 'Gratis' },
		{ key: 'price_low', label: 'Precio ↑' },
		{ key: 'price_high', label: 'Precio ↓' },
		{ key: 'rating', label: 'Mejor valorados' },
	];
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}>
			{options.map(opt => (
				<TouchableOpacity
					key={String(opt.key)}
					onPress={() => onSelect(opt.key)}
					style={{
						marginRight: 8,
						paddingHorizontal: 12,
						paddingVertical: 6,
						borderRadius: 18,
						backgroundColor: selected === opt.key ? '#283593' : '#fff',
						borderWidth: 1,
						borderColor: '#e0e0e0',
						elevation: 1,
						shadowColor: '#000',
						shadowOpacity: 0.06,
						shadowOffset: { width: 0, height: 1 },
					}}
				>
					<Text style={{ color: selected === opt.key ? '#fff' : '#222', fontSize: 13 }}>{opt.label}</Text>
				</TouchableOpacity>
			))}
		</ScrollView>
	);
}

export default function PlayasScreen(){
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState(null);
	const [places, setPlaces] = useState([]);

	useEffect(() => {
		const col = collection(db, 'Lugares');
		let unsub = null;
		const tryServerQuery = async () => {
			try {
				const q1 = query(col, where('Categoria', '==', 'Playa'));
				const snap1 = await getDocs(q1);
				if (!snap1.empty) {
					const mapped = snap1.docs.map(d => {
						const v = d.data();
						return {
							id: d.id,
							nombre: v.Nombre || v.nombre || v.name || '',
							lugar: v.Lugar || v.LugarDestino || v.lugar || v.place || '',
							precio: typeof v.Precio === 'number' ? v.Precio : (typeof v.precio === 'number' ? v.precio : (v.Precio && parseFloat(v.Precio)) || 0),
							rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
							duracion: v.Duracion || v.duracion || v.duration || '',
							img: v.ImagenURL || v.Imagen || v.img || (v.Fotos && v.Fotos[0]) || null,
							tags: v.Tags || v.tags || [],
							categoria: (v.Categoria || v.categoria || v.Tipo || '').toString(),
							descripcion: v.Descripcion || v.descripcion || v.desc || '',
						};
					});
					setPlaces(mapped);
					return;
				}
				const q2 = query(col, where('categoria', '==', 'Playa'));
				const snap2 = await getDocs(q2);
				if (!snap2.empty) {
					const mapped = snap2.docs.map(d => {
						const v = d.data();
						return {
							id: d.id,
							nombre: v.Nombre || v.nombre || v.name || '',
							lugar: v.Lugar || v.LugarDestino || v.lugar || v.place || '',
							precio: typeof v.Precio === 'number' ? v.Precio : (typeof v.precio === 'number' ? v.precio : (v.Precio && parseFloat(v.Precio)) || 0),
							rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
							duracion: v.Duracion || v.duracion || v.duration || '',
							img: v.ImagenURL || v.Imagen || v.img || (v.Fotos && v.Fotos[0]) || null,
							tags: v.Tags || v.tags || [],
							categoria: (v.Categoria || v.categoria || v.Tipo || '').toString(),
							descripcion: v.Descripcion || v.descripcion || v.desc || '',
						};
					});
					setPlaces(mapped);
					return;
				}
			} catch (e) {
				console.error('Query error playas:', e);
			}
			unsub = onSnapshot(col, (snap) => {
				try {
					const mapped = snap.docs.map(d => {
						const v = d.data();
						return {
							id: d.id,
							nombre: v.Nombre || v.nombre || v.name || '',
							lugar: v.Lugar || v.LugarDestino || v.lugar || v.place || '',
							precio: typeof v.Precio === 'number' ? v.Precio : (typeof v.precio === 'number' ? v.precio : (v.Precio && parseFloat(v.Precio)) || 0),
							rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
							duracion: v.Duracion || v.duracion || v.duration || '',
							img: v.ImagenURL || v.Imagen || v.img || (v.Fotos && v.Fotos[0]) || null,
							tags: v.Tags || v.tags || [],
							categoria: (v.Categoria || v.categoria || v.Tipo || '').toString(),
							descripcion: v.Descripcion || v.descripcion || v.desc || '',
						};
					}).filter(p => (p.categoria || '').toLowerCase().includes('playa'));
					setPlaces(mapped);
				} catch (e) { console.error('Lugares snapshot error (playas fallback):', e); }
			}, (err) => console.error('Snapshot playas error:', err));
		};
		tryServerQuery();
		return () => {
			if (unsub) unsub();
		};
	}, []);

	const filtered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		let list = q ? places.filter(d => (d.nombre || '').toLowerCase().includes(q) || (d.lugar || '').toLowerCase().includes(q)) : [...places];
		if (filter === 'free') list = list.filter(i => !i.precio || i.precio === 0);
		if (filter === 'price_high') list = list.slice().sort((a,b) => (b.precio || 0) - (a.precio || 0));
		if (filter === 'price_low') list = list.slice().sort((a,b) => (a.precio || 0) - (b.precio || 0));
		if (filter === 'rating') list = list.slice().sort((a,b) => (b.rating || 0) - (a.rating || 0));
		return list;
	}, [searchQuery, filter, places]);

	const onPressItem = (item) => {
		try { router.push({ pathname: '/experiences/detail', params: { id: item.id } }); } catch(e){ router.push(`/experiences/detail?id=${item.id}`); }
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
			<View style={styles.headerOrange}>
				<TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
					<MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
				</TouchableOpacity>
				<View style={{ flex: 1, paddingLeft: 16 }}>
					<Text style={styles.headerTitle}>Playas</Text>
					<Text style={styles.headerSub}>Explora playas y actividades</Text>
				</View>
			</View>

			<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar playa, lugar..." compact containerStyle={{ marginTop: -16 }} />
			<View style={{ marginTop: -2 }}>
				<FilterBar selected={filter} onSelect={setFilter} />
			</View>

			<FlatList
				data={filtered}
				keyExtractor={i => i.id}
				contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.cardInline} onPress={() => onPressItem(item)} activeOpacity={0.9}>
						{item.img ? <Image source={{ uri: item.img }} style={styles.cardInlineImg} /> : null}
						<View style={{ padding: 12 }}>
							<Text style={styles.cardInlineTitle}>{item.nombre}</Text>
							<Text style={styles.cardInlinePlace}>{item.lugar}</Text>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
								<TouchableOpacity style={styles.btnPrimaryInline} onPress={() => onPressItem(item)}><Text style={{ color: '#fff' }}>Ver Detalles</Text></TouchableOpacity>
							</View>
						</View>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	headerOrange: { backgroundColor: '#ff6b3c', paddingTop: 36, paddingBottom: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
	headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
	headerSub: { color: '#fff', fontSize: 12, marginTop: 4 },

	cardInline: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 14, overflow: 'hidden', elevation: 2 },
	cardInlineImg: { width: '100%', height: 160 },
	cardInlineTitle: { fontWeight: '700', fontSize: 16 },
	cardInlinePlace: { color: '#666', marginTop: 4 },
	btnPrimaryInline: { backgroundColor: '#0ba4e0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
});

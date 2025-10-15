import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from 'react-native';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';


export default function RiosScreen(){
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState(null);
	const [places, setPlaces] = useState([]);

	useEffect(() => {
		const col = collection(db, 'Lugares');
		let unsub = null;
		const tryServerQuery = async () => {
			try {
				const q1 = query(col, where('Categoria', '==', 'Río'));
				const snap1 = await getDocs(q1);
				if (!snap1.empty) {
					const mapped = snap1.docs.map(d => {
						const v = d.data();
						return {
							id: d.id,
							nombre: v.Nombre || v.nombre || '',
							lugar: v.Lugar || v.lugar || '',
							precio: typeof v.Precio === 'number' ? v.Precio : (typeof v.precio === 'number' ? v.precio : (v.Precio && parseFloat(v.Precio)) || 0),
							rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
							duracion: v.Duracion || v.duracion || '',
							img: v.ImagenURL || v.Imagen || v.img || (v.Fotos && v.Fotos[0]) || null,
							tags: v.Tags || v.tags || [],
							categoria: (v.Categoria || v.categoria || v.Tipo || '').toString(),
							descripcion: v.Descripcion || v.descripcion || '',
						};
					});
					setPlaces(mapped);
					return;
				}
				const q2 = query(col, where('categoria', '==', 'Río'));
				const snap2 = await getDocs(q2);
				if (!snap2.empty) {
					const mapped = snap2.docs.map(d => {
						const v = d.data();
						return {
							id: d.id,
							nombre: v.Nombre || v.nombre || '',
							lugar: v.Lugar || v.lugar || '',
							precio: typeof v.Precio === 'number' ? v.Precio : (typeof v.precio === 'number' ? v.precio : (v.Precio && parseFloat(v.Precio)) || 0),
							rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
							duracion: v.Duracion || v.duracion || '',
							img: v.ImagenURL || v.Imagen || v.img || (v.Fotos && v.Fotos[0]) || null,
							tags: v.Tags || v.tags || [],
							categoria: (v.Categoria || v.categoria || v.Tipo || '').toString(),
							descripcion: v.Descripcion || v.descripcion || '',
						};
					});
					setPlaces(mapped);
					return;
				}
			} catch (e) {
				console.error('Query error rios:', e);
			}
			unsub = onSnapshot(col, (snap) => {
				try {
					const mapped = snap.docs.map(d => {
						const v = d.data();
						return {
							id: d.id,
							nombre: v.Nombre || v.nombre || '',
							lugar: v.Lugar || v.lugar || '',
							precio: typeof v.Precio === 'number' ? v.Precio : (typeof v.precio === 'number' ? v.precio : (v.Precio && parseFloat(v.Precio)) || 0),
							rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
							duracion: v.Duracion || v.duracion || '',
							img: v.ImagenURL || v.Imagen || v.img || (v.Fotos && v.Fotos[0]) || null,
							tags: v.Tags || v.tags || [],
							categoria: (v.Categoria || v.categoria || v.Tipo || '').toString(),
							descripcion: v.Descripcion || v.descripcion || '',
						};
					}).filter(p => (p.categoria || '').toLowerCase().includes('rio') || (p.nombre || '').toLowerCase().includes('río'));
					setPlaces(mapped);
				} catch (e) { console.error('Lugares snapshot error (rios fallback):', e); }
			}, (err) => console.error('Snapshot rios error:', err));
		};
		tryServerQuery();
		return () => { if (unsub) unsub(); };
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

	const minPrice = filtered.length ? Math.min(...filtered.map(f => f.precio)) : 0;

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
					<Text style={styles.headerTitle}>Ríos</Text>
					<Text style={styles.headerSub}>Ríos y actividades acuáticas</Text>
				</View>
			</View>

			<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar río, lugar..." compact containerStyle={{ marginTop: -16 }} />
			<FilterBar selected={filter} onSelect={setFilter} />

			<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
				{filtered.map(item => (
					<TouchableOpacity key={item.id} style={styles.card} onPress={() => onPressItem(item)} activeOpacity={0.9}>
						<View style={{ position: 'relative' }}>
							<Image source={{ uri: item.img }} style={styles.cardImg} />
							<View style={styles.priceBadge}><Text style={{ color: '#fff', fontWeight: '700' }}>C$ {item.precio}.00</Text></View>
							<View style={styles.ratingBadge}><Text style={{ color: '#fff', fontWeight: '700' }}>{item.rating}</Text></View>
						</View>
						<View style={{ padding: 12 }}>
							<Text style={styles.cardTitle}>{item.nombre}</Text>
							<Text style={styles.cardPlace}>{item.lugar}</Text>
							<Text style={styles.cardDesc}>Actividad acuática y recorrido. {item.duracion}</Text>
							<View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
								{item.tags.map(t => <View key={t} style={styles.tag}><Text style={{ fontSize: 12 }}>{t}</Text></View>)}
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
								<TouchableOpacity style={styles.btnPrimary}><Text style={{ color: '#fff', fontWeight: '700' }}>Ver Detalles</Text></TouchableOpacity>
								<TouchableOpacity style={styles.btnIcon}><MaterialCommunityIcons name="send" size={18} color="#1976d2" /></TouchableOpacity>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	headerOrange: { backgroundColor: '#ff6b3c', paddingTop: 36, paddingBottom: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
	headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
	headerSub: { color: '#fff', fontSize: 12, marginTop: 4 },
	searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: -24, padding: 10, borderRadius: 12, elevation: 3, gap: 8 },
	searchInput: { marginLeft: 8, flex: 1, height: 36 },
	card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 14, overflow: 'hidden', elevation: 2 },
	cardImg: { width: '100%', height: 180 },
	priceBadge: { position: 'absolute', left: 12, top: 12, backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 },
	ratingBadge: { position: 'absolute', right: 12, bottom: 12, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 20 },
	cardTitle: { fontWeight: '700', fontSize: 16 },
	cardPlace: { color: '#666', marginTop: 4 },
	cardDesc: { color: '#444', marginTop: 6 },
	tag: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
	btnPrimary: { backgroundColor: '#0ba4e0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
	btnIcon: { backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e6eef7' },
});

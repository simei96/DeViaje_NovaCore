import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import ExperienceCard from '../../components/ExperienceCard';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function VolcanesScreen(){
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [filter, setFilter] = useState(null);
	const [places, setPlaces] = useState([]);

	useEffect(() => {
		const col = collection(db, 'Lugares');
		let unsub = null;
		const tryServerQuery = async () => {
			try {
				const q1 = query(col, where('Categoria', '==', 'Volcán'));
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
				const q2 = query(col, where('categoria', '==', 'Volcán'));
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
				console.error('Query error volcanes:', e);
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
					}).filter(p => (p.categoria || '').toLowerCase().includes('volc'));
					setPlaces(mapped);
				} catch (e) { console.error('Lugares snapshot error (volcanes fallback):', e); }
			}, (err) => console.error('Snapshot volcanes error:', err));
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
					<Text style={[styles.headerTitle, { color: '#fff', fontWeight: '700' }]}>Volcanes</Text>
					<Text style={[styles.headerSub, { color: '#fff' }]}>Explora volcanes y actividades</Text>
				</View>
			</View>

			<SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar volcán, lugar..." compact containerStyle={{ marginTop: -16 }} />
			<FilterBar selected={filter} onSelect={setFilter} />

			<FlatList
				data={filtered}
				keyExtractor={i => i.id}
				contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
				renderItem={({ item }) => (
					<ExperienceCard item={item} onPress={onPressItem} onShare={(it)=>{ /* share */ }} />
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	headerOrange: { backgroundColor: '#ff6b3c', paddingTop: 36, paddingBottom: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
});

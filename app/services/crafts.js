import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SAMPLE_DATA = [
	{ id: 'c-1', nombre: 'Cerámica de San Juan', tipo: 'Cerámica', ciudad: 'Granada', precio: 250, imagenes: ['https://images.unsplash.com/photo-1560184897-6b8f7f6f3f6f?auto=format&fit=crop&w=800&q=80'], fotos: 3, desc: 'Piezas hechas a mano, esmaltadas tradicionalmente.', rating: 4.4 },
	{ id: 'c-2', nombre: 'Textiles de Masaya', tipo: 'Textiles', ciudad: 'Masaya', precio: 180, imagenes: ['https://images.unsplash.com/photo-1520975698516-2f7f4b7a0a7b?auto=format&fit=crop&w=800&q=80'], fotos: 2, desc: 'Coloridos tejidos tradicionales, ideales para regalos.', rating: 4.6 },
	{ id: 'c-3', nombre: 'Joyería Artesanal', tipo: 'Joyería', ciudad: 'León', precio: 520, imagenes: ['https://images.unsplash.com/photo-1522441815192-6a4c2a6f8b6b?auto=format&fit=crop&w=800&q=80'], fotos: 4, desc: 'Collares y pulseras elaboradas por artesanos locales.', rating: 4.7 },
	{ id: 'c-4', nombre: 'Cestas de Mimbre', tipo: 'Otros', ciudad: 'Managua', precio: 90, imagenes: ['https://images.unsplash.com/photo-1505842465776-3a1433f1b8b6?auto=format&fit=crop&w=800&q=80'], fotos: 1, desc: 'Cestas utilitarias y decorativas hechas a mano.', rating: 4.3 },
];

const FILTROS = ['Todos', 'Cerámica', 'Textiles', 'Joyería', 'Otros'];
const OFERTAS = [
	{ id: 'a-off-1', titulo: 'Descuento Feria', desc: '10% en compras mayores a C$ 1000', descuento: 10, precioNuevo: 900, precioAnterior: 1000 },
	{ id: 'a-off-2', titulo: 'Paquete Artesano', desc: 'Combo 3 piezas', descuento: 15, precioNuevo: 510, precioAnterior: 600 },
];

export default function Crafts() {
	const router = useRouter();
	const [activeFilter, setActiveFilter] = useState('Todos');
	const [search, setSearch] = useState('');
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [items, setItems] = useState(SAMPLE_DATA);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const scrollRef = useRef(null);

	useEffect(()=>{ const it = setInterval(()=> setCarouselIndex(p=> (p+1)%OFERTAS.length), 3800); return ()=> clearInterval(it); },[]);
	useEffect(()=>{ if(scrollRef.current){ scrollRef.current.scrollTo({ x: carouselIndex*300, animated:true }); } },[carouselIndex]);

	const onRefresh = () => { setRefreshing(true); setTimeout(()=> setRefreshing(false),700); };

	const filtrados = items.filter(i=> (
		(activeFilter==='Todos' || i.tipo.toLowerCase() === activeFilter.toLowerCase()) &&
		i.nombre.toLowerCase().includes(search.toLowerCase())
	));

	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={()=> router.push(`/services/crafts/${item.id}`)} activeOpacity={0.85} style={styles.card}>
			<View style={styles.galleryWrapper}>
				<View style={{ flexDirection:'row', gap:4, flex:1 }}>
					{Array.from({ length: 3 }).map((_, idx) => {
						const src = item.imagenes && item.imagenes[idx];
						const source = src ? { uri: src } : { uri: 'https://firebasestorage.googleapis.com/v0/b/deviaje-75dbd.appspot.com/o/imagen_de_prueba.jpg?alt=media' };
						return <Image key={idx} source={source} style={styles.hotelImgSmall} />;
					})}
				</View>
				<View style={styles.tipoBadge}><Text style={styles.tipoBadgeText}>{item.tipo}</Text></View>
				<View style={styles.fotosBadge}><MaterialCommunityIcons name="image-multiple" size={14} color="#fff" style={{ marginRight:4 }} /><Text style={styles.fotosBadgeText}>{item.fotos}</Text></View>
				<View style={styles.ratingBadge}>
					<MaterialCommunityIcons name="star" size={13} color="#ffeb3b" />
					<Text style={styles.ratingBadgeText}>{typeof item.rating === 'number' ? item.rating.toFixed(1) : 'N/D'}</Text>
				</View>
			</View>
			<View style={{ padding:14 }}>
				<Text style={styles.hotelTitle}>{item.nombre}</Text>
				<View style={{ flexDirection:'row', alignItems:'center', marginTop:2 }}>
					<MaterialCommunityIcons name="map-marker" size={14} color="#607d8b" style={{ marginRight:4 }} />
					<Text style={styles.hotelLoc}>{item.ciudad}</Text>
				</View>
				<Text style={styles.hotelDesc} numberOfLines={2}>{item.desc}</Text>
				<Text style={styles.hotelPrecio}>C$ {item.precio} <Text style={styles.hotelModalidad}>por pieza</Text></Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={{ flex:1, backgroundColor:'#f6fafd' }}>
			<Stack.Screen options={{ title:'Artesanías', headerTitleAlign:'center' }} />
			<ScrollView
				contentContainerStyle={{ paddingBottom:40 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			>
				<View style={styles.hero}>
					<Text style={styles.heroTitle}>Artesanías</Text>
					<Text style={styles.heroSubtitle}>Productos hechos a mano - Precios en córdobas</Text>
					<View style={styles.searchBox}>
						<TextInput
							style={styles.searchInput}
							placeholder="Buscar artesanías, mercados..."
							placeholderTextColor="#b0bec5"
							value={search}
							onChangeText={setSearch}
						/>
					</View>
				</View>
				<View style={styles.filtrosWrap}>
					<Text style={styles.filtrosTitle}>Categoría</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
						{FILTROS.map(f => (
							<TouchableOpacity key={f} onPress={()=> setActiveFilter(f)} style={[styles.filtroBtn, activeFilter===f && styles.filtroBtnActive]}>
								<Text style={[styles.filtroText, activeFilter===f && styles.filtroTextActive]}>{f}</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				<View style={{ marginTop:18 }}>
					<View style={styles.sectionHeaderRow}><MaterialCommunityIcons name="gift" size={18} color="#c77800" style={{ marginRight:6 }} /><Text style={styles.sectionTitle}>Ofertas</Text></View>
					<ScrollView
						ref={scrollRef}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						snapToInterval={300}
						decelerationRate="fast"
						contentContainerStyle={{ paddingHorizontal:16 }}
					>
						{OFERTAS.map((o, idx) => (
							<View key={o.id} style={[styles.offerCard,{ marginRight: idx===OFERTAS.length-1?0:14 }]}>
								<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
									<Text style={styles.offerTitle}>{o.titulo}</Text>
									<View style={styles.badgeDescuento}><Text style={styles.badgeDescuentoText}>{o.descuento}% OFF</Text></View>
								</View>
								<Text style={styles.offerDesc}>{o.desc}</Text>
								<View style={{ flexDirection:'row', alignItems:'flex-end', marginTop:6 }}>
									<Text style={styles.ofertaPrecioNuevo}>C$ {o.precioNuevo}</Text>
									<Text style={styles.ofertaPrecioAnterior}>C$ {o.precioAnterior}</Text>
								</View>
								<View style={styles.offerAccent} />
							</View>
						))}
					</ScrollView>
					<View style={styles.dotsRow}>{OFERTAS.map((_,i)=>(<View key={i} style={[styles.dot, i===carouselIndex && styles.dotActive]} />))}</View>
				</View>

				<View style={{ marginTop:26, paddingHorizontal:16 }}>
					<Text style={styles.sectionTitle}>Opciones ({loading? '...' : filtrados.length})</Text>
				</View>
				<View style={{ paddingHorizontal:16, marginTop:4 }}>
					{loading && <ActivityIndicator style={{ marginTop:20 }} color="#0086b3" />}
					{!loading && error && <Text style={{ color:'#b71c1c', textAlign:'center', marginTop:20 }}>{error}</Text>}
					{!loading && !error && (
						<FlatList
							data={filtrados}
							keyExtractor={item=>item.id}
							renderItem={renderItem}
							scrollEnabled={false}
							ItemSeparatorComponent={()=> <View style={{ height:16 }} />}
							ListEmptyComponent={<Text style={{ textAlign:'center', color:'#888', marginTop:32 }}>Sin resultados</Text>}
						/>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	hero:{ backgroundColor:'#0086b3', paddingTop:22, paddingBottom:24, paddingHorizontal:16, borderBottomLeftRadius:20, borderBottomRightRadius:20 },
	heroTitle:{ color:'#fff', fontSize:20, fontFamily:'Montserrat-Bold', textAlign:'center', marginBottom:6 },
	heroSubtitle:{ color:'#e0f7fa', fontSize:12, fontFamily:'Montserrat-Medium', textAlign:'center', lineHeight:16, marginBottom:14 },
	searchBox:{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, paddingHorizontal:14, paddingVertical:10 },
	searchInput:{ color:'#fff', fontSize:14, fontFamily:'Montserrat-Medium', padding:0 },
	filtrosWrap:{ backgroundColor:'#fff', marginTop:16, paddingTop:12, paddingBottom:4, borderTopWidth:1, borderBottomWidth:1, borderColor:'#e0e3ea' },
	filtrosTitle:{ fontSize:14, fontFamily:'Montserrat-SemiBold', color:'#37474f', paddingHorizontal:16, marginBottom:8 },
	filtrosRow:{ paddingHorizontal:16, paddingRight:24, gap:8 },
	filtroBtn:{ backgroundColor:'#f1f5f8', paddingHorizontal:14, paddingVertical:6, borderRadius:20 },
	filtroBtnActive:{ backgroundColor:'#0086b3' },
	filtroText:{ fontSize:13, fontFamily:'Montserrat-Medium', color:'#0086b3' },
	filtroTextActive:{ color:'#fff', fontFamily:'Montserrat-SemiBold' },
	sectionTitle:{ fontSize:15, fontFamily:'Montserrat-SemiBold', color:'#004d60' },
	sectionHeaderRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, marginBottom:10 },
	offerCard:{ width:300, backgroundColor:'#fff', borderRadius:18, padding:16, position:'relative', borderWidth:1, borderColor:'#e0e3ea' },
	offerTitle:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#37474f' },
	offerDesc:{ fontSize:12, fontFamily:'Montserrat-Regular', color:'#607d8b', marginTop:4 },
	ofertaPrecioNuevo:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#c77800' },
	ofertaPrecioAnterior:{ fontSize:11, fontFamily:'Montserrat-Regular', color:'#b0bec5', textDecorationLine:'line-through', marginLeft:8, marginBottom:2 },
	badgeDescuento:{ backgroundColor:'#ffb300', borderRadius:8, paddingHorizontal:8, paddingVertical:2, marginLeft:8 },
	badgeDescuentoText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-Bold' },
	offerAccent:{ position:'absolute', right:0, top:0, bottom:0, width:6, backgroundColor:'#00c49a', borderTopRightRadius:18, borderBottomRightRadius:18 },
	dotsRow:{ flexDirection:'row', justifyContent:'center', marginTop:12, gap:6 },
	dot:{ width:8, height:8, borderRadius:4, backgroundColor:'#cfd8dc', opacity:0.6 },
	dotActive:{ backgroundColor:'#0086b3', opacity:1, width:16 },
	card:{ backgroundColor:'#fff', borderRadius:18, overflow:'hidden', borderWidth:1, borderColor:'#e0e3ea' },
	galleryWrapper:{ position:'relative', width:'100%' },
	hotelImgSmall:{ flex:1, height:110, borderRadius:8, backgroundColor:'#eceff1' },
	tipoBadge:{ position:'absolute', top:8, left:8, backgroundColor:'#0086b3', borderRadius:6, paddingHorizontal:8, paddingVertical:2 },
	tipoBadgeText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
	fotosBadge:{ position:'absolute', bottom:8, left:8, backgroundColor:'rgba(0,0,0,0.55)', borderRadius:6, paddingHorizontal:8, paddingVertical:2 },
	fotosBadgeText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-Medium' },
	ratingBadge:{ position:'absolute', top:8, right:8, backgroundColor:'#263238', borderRadius:14, paddingHorizontal:10, paddingVertical:4 },
	ratingBadgeText:{ color:'#ffeb3b', fontSize:11, fontFamily:'Montserrat-Bold' },
	hotelTitle:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#263238' },
	hotelLoc:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#607d8b', marginTop:2 },
	hotelDesc:{ fontSize:11, fontFamily:'Montserrat-Regular', color:'#546e7a', marginTop:6, lineHeight:14 },
	hotelPrecio:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#c77800', marginTop:10 },
	hotelModalidad:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#607d8b' },
});

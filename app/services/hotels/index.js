import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

const OFERTAS = [
  { id:'h-off-1', titulo:'Escapada Romántica', desc:'2 noches + cena + spa', descuento:30, precioNuevo:5740, precioAnterior:8200 },
  { id:'h-off-2', titulo:'Semana Familiar', desc:'Habitación + piscina + tour', descuento:22, precioNuevo:8120, precioAnterior:10400 },
  { id:'h-off-3', titulo:'Negocios Premium', desc:'Suite ejecutiva + cowork', descuento:18, precioNuevo:9320, precioAnterior:11370 },
];

const FILTROS = ['Todos','Hotel','Hostal','Apartamento','Resort'];

function normalizeHotel(d){
  const data = d.data() || {};
  return {
    id: d.id,
    nombre: data.Nombre || 'Hotel',
    tipo: data.Tipo || 'Hotel',
    ciudad: data.Ubicacion || 'Ciudad',
    precio: data.PrecioPorNoche || 0,
    modalidad: 'por noche',
    imagenes: data.ImagenURL ? [data.ImagenURL] : [],
    fotos: data.ImagenURL ? 1 : 0,
    desc: data['Descripción'] || '',
  };
}

export default function HotelsListScreen(){
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hospedajes, setHospedajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(()=>{
  const colRef = collection(db,'Hoteles');
    const unsub = onSnapshot(colRef, snap => {
      setHospedajes(snap.docs.map(normalizeHotel));
      setLoading(false);
    }, err => { setError(err.message); setLoading(false); });
    return () => unsub();
  },[]);

  useEffect(()=>{ const it = setInterval(()=> setCarouselIndex(p=> (p+1)%OFERTAS.length), 3800); return ()=> clearInterval(it); },[]);
  useEffect(()=>{ if(scrollRef.current){ scrollRef.current.scrollTo({ x:carouselIndex*300, animated:true }); } },[carouselIndex]);

  const onRefresh = useCallback(()=>{ setRefreshing(true); setTimeout(()=> setRefreshing(false),700); },[]);

  const filtrados = hospedajes.filter(h => (
    (activeFilter==='Todos' || h.tipo.toLowerCase() === activeFilter.toLowerCase()) &&
    h.nombre.toLowerCase().includes(search.toLowerCase())
  ));

  const renderHospedaje = ({ item }) => (
    <TouchableOpacity onPress={()=> router.push(`/services/hotels/${item.id}`)} activeOpacity={0.85} style={styles.hotelCard}>
      <View style={styles.galleryWrapper}>
        <View style={{ flexDirection:'row', gap:4, flex:1 }}>
          {Array.from({ length:3 }).map((_, idx) => {
            const imgs = item.imagenes || [];
            const src = imgs[idx];
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
        <Text style={styles.hotelDesc} numberOfLines={2}>{item.desc || 'Hospedaje turístico'}</Text>
        <Text style={styles.hotelPrecio}>{formatCordoba(item.precio)} <Text style={styles.hotelModalidad}>{item.modalidad}</Text></Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Hospedaje', headerTitleAlign:'center' }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom:40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Hospedaje</Text>
          <Text style={styles.heroSubtitle}>Lugares para hospedarte - Precios en córdobas</Text>
          <View style={styles.searchBox}> 
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar hoteles, hostales..."
              placeholderTextColor="#b0bec5"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
        <View style={styles.filtrosWrap}> 
          <Text style={styles.filtrosTitle}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
            {FILTROS.map(f => (
              <TouchableOpacity key={f} onPress={()=> setActiveFilter(f)} style={[styles.filtroBtn, activeFilter===f && styles.filtroBtnActive]}>
                <Text style={[styles.filtroText, activeFilter===f && styles.filtroTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Carrusel */}
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
                  <Text style={styles.ofertaPrecioNuevo}>{formatCordoba(o.precioNuevo)}</Text>
                  <Text style={styles.ofertaPrecioAnterior}>{formatCordoba(o.precioAnterior)}</Text>
                </View>
                <View style={styles.offerAccent} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsRow}>{OFERTAS.map((_,i)=>(<View key={i} style={[styles.dot, i===carouselIndex && styles.dotActive]} />))}</View>
        </View>
        {/* Lista */}
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
              renderItem={renderHospedaje}
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
  hotelCard:{ backgroundColor:'#fff', borderRadius:18, overflow:'hidden', borderWidth:1, borderColor:'#e0e3ea' },
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

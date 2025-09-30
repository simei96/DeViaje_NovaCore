import { doc, setDoc } from 'firebase/firestore';

export async function actualizarComida002() {
  await setDoc(doc(db, 'Restaurantes', 'Comida_002'), {
    Nombre: "Gallo Pinto",
    Categoria: "Nicaragüense",
    Ubicacion: "Mercado Oriental",
    ImagenURL: "https://i.imgur.com/bdZAUm6.jpeg",
    Rating: 4.4,
    PrecioMin: 90,
    PrecioMax: 150,
    RangosPrecios: {
      "Entradas": { min: 48, max: 72 },
      "Platos principales": { min: 90, max: 150 },
      "Comida ejecutiva": { min: 150, max: 150 },
      "Postres": { min: 32, max: 56 },
      "Bebidas": { min: 24, max: 64 }
    },
    Descripcion: "Autentico sabor nicaraguense. Menú variado, ambiente familiar y atención de calidad.",
    Horario: "6:00 AM - 8:00 PM",
    Disponible: true,
    Especialidades: [
      { nombre: "Gallo pinto con café", descripcion: "Preparado con ingredientes frescos", precio: 90 },
      { nombre: "Comida ejecutiva", descripcion: "Plato completo con bebida", precio: 150 },
      { nombre: "Nacatamal completo", descripcion: "Preparado con ingredientes frescos", precio: 90 },
      { nombre: "Quesillo con tortilla", descripcion: "Preparado con ingredientes frescos", precio: 90 }
    ],
    Servicios: [
      { nombre: "Servicio a la mesa", icono: "silverware-fork-knife" },
      { nombre: "WiFi gratis", icono: "wifi" },
      { nombre: "Estacionamiento", icono: "car" },
      { nombre: "Ideal para familias", icono: "account-group" }
    ],
    MetodosPago: [
      { nombre: "Efectivo", icono: "cash" },
      { nombre: "Tarjeta", icono: "credit-card" },
      { nombre: "Tigo Money", icono: "cellphone" },
      { nombre: "Banpro Wallet", icono: "wallet" }
    ],
    Politicas: [
      "Reservas recomendadas para grupos de 6+ personas",
      "Menú infantil disponible",
      "Opciones vegetarianas y veganas",
      "Ambiente familiar y acogedor"
    ],
    Seguridad: [
      "Certificación sanitaria vigente",
      "Ingredientes frescos diariamente",
      "Personal capacitado en manipulación de alimentos",
      "Protocolos de limpieza estrictos"
    ],
    Telefono: "+50522225555",
    FechaCreacion: serverTimestamp()
  });
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

export async function agregarRestauranteDemo() {
  await addDoc(collection(db, 'Restaurantes'), {
    Nombre: "Gallo Pinto Tradicional",
    Categoria: "Nicaragüense",
    Ubicacion: "Mercado Central",
    ImagenURL: "https://images.unsplash.com/photo-restaurant-demo.jpg",
    Rating: 4.4,
    PrecioMin: 80,
    PrecioMax: 250,
    RangosPrecios: {
      "Entradas": { min: 48, max: 72 },
      "Platos principales": { min: 80, max: 250 },
      "Postres": { min: 32, max: 56 },
      "Bebidas": { min: 24, max: 64 }
    },
    Descripcion: "Auténtica comida nicaragüense en el corazón de Granada. Ambiente familiar, menú variado y atención de calidad.",
    Horario: "6:00 AM - 8:00 PM",
    Disponible: true,
    Especialidades: [
      { nombre: "Gallo pinto con café", descripcion: "Preparado con ingredientes frescos", precio: 64 },
      { nombre: "Nacatamal completo", descripcion: "Preparado con ingredientes frescos", precio: 64 },
      { nombre: "Quesillo con tortilla", descripcion: "Preparado con ingredientes frescos", precio: 64 }
    ],
    Servicios: [
      { nombre: "Servicio a la mesa", icono: "silverware-fork-knife" },
      { nombre: "WiFi gratis", icono: "wifi" },
      { nombre: "Estacionamiento", icono: "car" },
      { nombre: "Ideal para familias", icono: "account-group" }
    ],
    MetodosPago: [
      { nombre: "Efectivo", icono: "cash" },
      { nombre: "Tarjeta", icono: "credit-card" },
      { nombre: "Tigo Money", icono: "cellphone" },
      { nombre: "Banpro Wallet", icono: "wallet" }
    ],
    Politicas: [
      "Reservas recomendadas para grupos de 6+ personas",
      "Menú infantil disponible",
      "Opciones vegetarianas y veganas",
      "Ambiente familiar y acogedor"
    ],
    Seguridad: [
      "Certificación sanitaria vigente",
      "Ingredientes frescos diariamente",
      "Personal capacitado en manipulación de alimentos",
      "Protocolos de limpieza estrictos"
    ],
    Telefono: "+50522225555",
    FechaCreacion: serverTimestamp()
  });
}

const FILTROS = ['Todos','Tradicional','Internacional','Mariscos','Café','Comida Rápida'];
const OFERTAS = [
  { id:'r-off-1', titulo:'Tour Gastronómico', desc:'3 restaurantes + bebidas + postre', descuento:20, precioNuevo:1480, precioAnterior:1850, vence:'Hasta 31 Dic 2025' },
  { id:'r-off-2', titulo:'Menú Ejecutivo', desc:'Entrada + plato fuerte + bebida', descuento:18, precioNuevo:340, precioAnterior:415, vence:'Hasta 15 Ene 2026' },
  { id:'r-off-3', titulo:'Festival Marisco', desc:'Buffet degustación premium', descuento:25, precioNuevo:1890, precioAnterior:2520, vence:'Hasta 30 Nov 2025' },
];

function normalizeRest(d){
  const data = d.data() || {};
  return {
    id: d.id,
    nombre: data.Nombre || 'Restaurante',
    categoria: data.Categoria || 'Tradicional',
    rating: data.Rating || null,
    precioMin: data.PrecioMin || 0,
    precioMax: data.PrecioMax || 0,
    ciudad: data.Ubicacion || 'Ciudad',
    especialidades: data.Especialidades || [],
    horario: data.Horario || '',
    disponible: data.Disponible || false,
    imagen: data.ImagenURL || null,
  };
}

export default function RestaurantsListScreen(){
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(()=>{
    const colRef = collection(db,'Restaurantes');
    const unsub = onSnapshot(colRef, snap => {
      setRestaurantes(snap.docs.map(normalizeRest));
      setLoading(false);
    }, err => { setError(err.message); setLoading(false); });
    return () => unsub();
  },[]);

  useEffect(()=>{ const i = setInterval(()=> setCarouselIndex(p=> (p+1)%OFERTAS.length), 3800); return ()=> clearInterval(i); }, []);
  useEffect(()=>{ if(scrollRef.current){ scrollRef.current.scrollTo({ x: carouselIndex*300, animated:true }); } }, [carouselIndex]);

  const onRefresh = useCallback(()=>{ setRefreshing(true); setTimeout(()=> setRefreshing(false),700); },[]);

  const filtered = restaurantes.filter(r => {
    const categoria = typeof r.categoria === 'string' ? r.categoria : '';
    const nombre = typeof r.nombre === 'string' ? r.nombre : '';
    return (
      (activeFilter==='Todos' || categoria.toLowerCase() === activeFilter.toLowerCase()) &&
      nombre.toLowerCase().includes(search.toLowerCase())
    );
  });

  const renderRest = ({ item }) => (
    <TouchableOpacity onPress={()=> router.push(`/services/restaurants/${item.id}`)} activeOpacity={0.85} style={styles.restCard}>
      <View style={styles.restTop}> 
        <View style={styles.restTag}><Text style={styles.restTagText}>{item.categoria}</Text></View>
        <View style={styles.restActions}> 
          <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="heart-outline" size={16} color="#444" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="share-variant" size={16} color="#444" /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.restImageBox}>
        {item.imagen ? <Image source={{ uri:item.imagen }} style={styles.restImg} /> : <MaterialCommunityIcons name="image" size={40} color="#b0bec5" />}
        <View style={styles.ratingBadge}><MaterialCommunityIcons name="star" size={13} color="#ffeb3b" /><Text style={styles.ratingBadgeText}>{typeof item.rating === 'number' ? item.rating.toFixed(1) : 'N/D'}</Text></View>
      </View>
      <View style={styles.restBody}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Text style={styles.restTitle}>{item.nombre}</Text>
          <Text style={styles.priceRange}>{formatCordoba(item.precioMin)} - {formatCordoba(item.precioMax)}{' '}<Text style={styles.priceRangeUnit}>por persona</Text></Text>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', marginTop:4 }}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#607d8b" style={{ marginRight:4 }} />
          <Text style={styles.restLoc}>{item.ciudad}</Text>
        </View>
        <View style={styles.tagsWrap}>
          {item.especialidades.slice(0,4).map((es, idx) => (
            (es && typeof es === 'object' && typeof es.nombre === 'string') ? (
              <View key={es.nombre} style={styles.specTag}>
                <Text style={styles.specTagText}>{es.nombre}</Text>
              </View>
            ) : null
          ))}
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#607d8b" style={{ marginRight:4 }} />
            <Text style={styles.restSchedule}>{item.horario}</Text>
          </View>
          <Text style={[styles.disponible, { color: item.disponible ? '#007e33' : '#b71c1c' }]}>{item.disponible ? 'Mesa disponible' : 'No disponible'}</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.outlineBtn}><MaterialCommunityIcons name="phone" size={16} color="#008c5a" /><Text style={styles.outlineBtnText}>Llamar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn}><MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#fff" style={{ marginRight:6 }} /><Text style={styles.primaryBtnText}>Reservar Mesa</Text></TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Restaurantes', headerTitleAlign:'center' }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom:40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Restaurantes</Text>
          <Text style={styles.heroSubtitle}>Descubre los mejores lugares para comer en Managua</Text>
          <View style={styles.searchBox}> 
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar restaurante..."
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
          <Text style={styles.sectionTitle}>Opciones ({loading? '...' : filtered.length})</Text>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:4 }}>
          {loading && <ActivityIndicator style={{ marginTop:20 }} color="#0086b3" />}
          {!loading && error && <Text style={{ color:'#b71c1c', textAlign:'center', marginTop:20 }}>{error}</Text>}
          {!loading && !error && (
            <FlatList
              data={filtered}
              keyExtractor={item=>item.id}
              renderItem={renderRest}
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
  restCard:{ backgroundColor:'#fff', borderRadius:18, overflow:'hidden', borderWidth:1, borderColor:'#e0e3ea' },
  restTop:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:12 },
  restTag:{ backgroundColor:'#43a047', borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  restTagText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
  restActions:{ flexDirection:'row', gap:8 },
  iconBtn:{ backgroundColor:'#f1f5f8', borderRadius:8, padding:6 },
  restImageBox:{ alignItems:'center', justifyContent:'center', height:90, backgroundColor:'#eceff1' },
  restImg:{ width:90, height:90, borderRadius:12 },
  ratingBadge:{ position:'absolute', top:8, right:8, backgroundColor:'#263238', borderRadius:14, paddingHorizontal:10, paddingVertical:4, flexDirection:'row', alignItems:'center' },
  ratingBadgeText:{ color:'#ffeb3b', fontSize:11, fontFamily:'Montserrat-Bold', marginLeft:4 },
  restBody:{ padding:14 },
  restTitle:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#263238' },
  priceRange:{ fontSize:13, fontFamily:'Montserrat-Bold', color:'#c77800' },
  priceRangeUnit:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#607d8b' },
  restLoc:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#607d8b', marginTop:2 },
  restDesc:{ fontSize:11, fontFamily:'Montserrat-Regular', color:'#546e7a', marginTop:6, lineHeight:14 },
  tagsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:8 },
  specTag:{ backgroundColor:'#e0f7fa', borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  specTagText:{ color:'#008c5a', fontSize:11, fontFamily:'Montserrat-Medium' },
  restSchedule:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#607d8b' },
  disponible:{ fontSize:12, fontFamily:'Montserrat-Bold' },
  actionsRow:{ flexDirection:'row', gap:14, marginTop:18 },
  outlineBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#008c5a', paddingVertical:12, borderRadius:10 },
  outlineBtnText:{ color:'#008c5a', fontSize:13, fontFamily:'Montserrat-SemiBold', marginLeft:6 },
  primaryBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#ff9800', paddingVertical:12, borderRadius:10 },
  primaryBtnText:{ color:'#fff', fontSize:13, fontFamily:'Montserrat-Bold' },
});

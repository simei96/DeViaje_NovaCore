import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

const OFERTAS = [
  { id:'offer-1', titulo:'Combo Turístico', desc:'Taxi + Entrada a museo + Almuerzo', descuento:20, precioNuevo:1020, precioAnterior:1275, tipo:'Taxi' },
  { id:'offer-2', titulo:'Pase Diario Rutas', desc:'Uso ilimitado de buses urbanos', descuento:15, precioNuevo:120, precioAnterior:140, tipo:'Bus' },
  { id:'offer-3', titulo:'Tour en Bicicleta', desc:'Centro histórico + Mirador', descuento:18, precioNuevo:650, precioAnterior:790, tipo:'Bicicleta' }
];

const FILTROS = ['Todos','Taxis','Buses','Carros','Bicicletas'];

function normalizeDoc(d){
  const data = d.data() || {};
  return {
    id: d.id,
    nombre: data.Nombre || 'Transporte',
    descripcion: data.Descripcion || '',
    empresa: data.Empresa || '',
    horarios: data.Horarios || {},
    precios: data.Precios || {},
    capacidad: data.Capacidad || 'N/D',
    imagen: data.ImagenURL || null,
    tipo: data.Tipo || 'General',
    rutas: data.Rutas || [],
    metodosPago: data.MetodosPago || [],
    seguridad: data.Seguridad || [],
    lat: data.Lat || null,
    lng: data.Lng || null,
  };
}

export default function TransportListScreen(){
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [transportes, setTransportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
  const colRef = collection(db, 'Transportes');
    const unsub = onSnapshot(colRef, snap => {
      const list = snap.docs.map(normalizeDoc);
      setTransportes(list);
      setLoading(false);
    }, err => { setError(err.message); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    const it = setInterval(()=> setCarouselIndex(p=> (p+1)%OFERTAS.length), 3800);
    return ()=> clearInterval(it);
  }, []);

  useEffect(() => { if(scrollRef.current){ scrollRef.current.scrollTo({ x: carouselIndex*300, animated:true }); } }, [carouselIndex]);

  const onRefresh = useCallback(()=>{
    setRefreshing(true);
    setTimeout(()=> setRefreshing(false), 700);
  },[]);

  const opcionesFiltradas = transportes.filter(o => {
    const tipo = typeof o.tipo === 'string' ? o.tipo : '';
    const nombre = typeof o.nombre === 'string' ? o.nombre : '';
    return (
      (activeFilter==='Todos' || tipo.toLowerCase() === activeFilter.slice(0,-1).toLowerCase() || tipo.toLowerCase()===activeFilter.toLowerCase()) &&
      nombre.toLowerCase().includes(search.toLowerCase())
    );
  });

  const renderOpcion = ({ item }) => (
  <TouchableOpacity onPress={() => router.push({ pathname:'/services/transport/'+item.id })} activeOpacity={0.85} style={styles.transpCard}>
      <View style={{ position:'relative' }}>
        <Image source={item.imagen ? { uri:item.imagen } : require('../../assets/images/imagen_de_prueba.jpg')} style={styles.transpImg} />
        <View style={styles.tipoBadge}><Text style={styles.tipoBadgeText}>{item.tipo}</Text></View>
  <Text style={styles.transpPrecio}>{formatCordoba(item.precio)}</Text>
      </View>
      <View style={{ padding:14 }}>
        <Text style={styles.transpTitle}>{item.titulo}</Text>
        <Text style={styles.transpSub} numberOfLines={2}>{item.descripcion || 'Transporte turístico confiable'}</Text>
        <View style={{ flexDirection:'row', marginTop:8 }}>
          <View style={{ marginRight:24, flexDirection:'row', alignItems:'flex-start' }}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#0086b3" style={{ marginRight:6, marginTop:2 }} />
            <View>
              <Text style={styles.metaLabel}>Horario</Text>
              <Text style={styles.metaValue}>{item.espera}</Text>
            </View>
          </View>
          <View style={{ flexDirection:'row', alignItems:'flex-start' }}>
            <MaterialCommunityIcons name="account-group" size={16} color="#0086b3" style={{ marginRight:6, marginTop:2 }} />
            <View>
              <Text style={styles.metaLabel}>Capacidad</Text>
              <Text style={styles.metaValue}>{item.capacidad}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Transporte', headerTitleAlign:'center' }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom:40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Transporte</Text>
          <Text style={styles.heroSubtitle}>Opciones seguras y confiables - Precios en córdobas</Text>
          <View style={styles.searchBox}> 
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar transporte..."
              placeholderTextColor="#b0bec5"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
        <View style={styles.filtrosWrap}> 
          <Text style={styles.filtrosTitle}>Filtros</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
            {FILTROS.map(f => (
              <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filtroBtn, activeFilter === f && styles.filtroBtnActive]}>
                <Text style={[styles.filtroText, activeFilter === f && styles.filtroTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Carrusel */}
        <View style={{ marginTop:18 }}>
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
        {/* Lista */}
        <View style={{ marginTop:26, paddingHorizontal:16 }}>
          <Text style={styles.sectionTitle}>Opciones de Transporte ({loading? '...' : opcionesFiltradas.length})</Text>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:4 }}>
          {loading && <ActivityIndicator style={{ marginTop:20 }} color="#0086b3" />}
          {!loading && error && <Text style={{ color:'#b71c1c', textAlign:'center', marginTop:20 }}>{error}</Text>}
          {!loading && !error && (
            <FlatList
              data={opcionesFiltradas}
              keyExtractor={item=>item.id}
              renderItem={renderOpcion}
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
  transpCard:{ backgroundColor:'#fff', borderRadius:18, overflow:'hidden', borderWidth:1, borderColor:'#e0e3ea' },
  transpImg:{ width:'100%', height:140 },
  tipoBadge:{ position:'absolute', top:8, left:8, backgroundColor:'#0086b3', borderRadius:6, paddingHorizontal:8, paddingVertical:2 },
  tipoBadgeText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
  transpTitle:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#263238' },
  transpSub:{ fontSize:12, fontFamily:'Montserrat-Regular', color:'#607d8b', marginTop:2 },
  metaLabel:{ fontSize:10, fontFamily:'Montserrat-Medium', color:'#78909c', textTransform:'uppercase' },
  metaValue:{ fontSize:11, fontFamily:'Montserrat-SemiBold', color:'#37474f', marginTop:2 },
  transpPrecio:{ position:'absolute', top:14, right:14, fontSize:15, fontFamily:'Montserrat-Bold', color:'#c77800' }
});

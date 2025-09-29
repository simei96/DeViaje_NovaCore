import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Datos estáticos de ejemplo (luego se pueden reemplazar por Firestore)
const OFERTAS = [
  {
    id: 'offer-1',
    titulo: 'Combo Turístico',
    desc: 'Taxi + Entrada a museo + Almuerzo',
    descuento: 20,
    precioNuevo: 1020,
    precioAnterior: 1275,
    tipo: 'Taxi',
  },
  {
    id: 'offer-2',
    titulo: 'Pase Diario Rutas',
    desc: 'Uso ilimitado de buses urbanos',
    descuento: 15,
    precioNuevo: 120,
    precioAnterior: 140,
    tipo: 'Bus',
  },
  {
    id: 'offer-3',
    titulo: 'Tour en Bicicleta',
    desc: 'Centro histórico + Mirador',
    descuento: 18,
    precioNuevo: 650,
    precioAnterior: 790,
    tipo: 'Bicicleta',
  },
];

const OPCIONES = [
  { id: 'tr-1', titulo: 'Ruta Urbana Centro', tipo: 'Bus', precio: 15, espera: '5:00 AM - 10:00 PM', capacidad: 'Múltiple', imagen: null },
  { id: 'tr-2', titulo: 'Taxi Express', tipo: 'Taxi', precio: 120, espera: '24/7', capacidad: '4 pax', imagen: null },
  { id: 'tr-3', titulo: 'Sedán Ejecutivo', tipo: 'Carro', precio: 480, espera: 'Reserva', capacidad: '4 pax', imagen: null },
  { id: 'tr-4', titulo: 'Bici Urbana Alquiler', tipo: 'Bicicleta', precio: 60, espera: '8:00 AM - 6:00 PM', capacidad: '1 pax', imagen: null },
  { id: 'tr-5', titulo: 'Minibús Turístico', tipo: 'Bus', precio: 95, espera: 'Programado', capacidad: '12 pax', imagen: null },
];

const FILTROS = ['Todos', 'Taxis', 'Buses', 'Carros', 'Bicicletas'];

export default function TransportScreen(){
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const scrollRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % OFERTAS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: carouselIndex * 300, animated: true });
    }
  }, [carouselIndex]);

  const ofertasRender = (
    <View style={{ marginTop: 18 }}>
      <View style={styles.sectionHeaderRow}>
        <MaterialCommunityIcons name="gift" size={18} color="#c77800" style={{ marginRight:6 }} />
        <Text style={styles.sectionTitle}>Ofertas Especiales</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={300}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {OFERTAS.map((o, idx) => (
          <View key={o.id} style={[styles.offerCard, { marginRight: idx === OFERTAS.length - 1 ? 0 : 14 }]}> 
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
      <View style={styles.dotsRow}>
        {OFERTAS.map((_, i) => (
          <View key={i} style={[styles.dot, i === carouselIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );

  const opcionesFiltradas = OPCIONES.filter(o => (
    (activeFilter === 'Todos' || o.tipo.toLowerCase() === activeFilter.slice(0, -1).toLowerCase() || o.tipo === activeFilter.slice(0, -1)) &&
    (o.titulo.toLowerCase().includes(search.toLowerCase()))
  ));

  const renderOpcion = ({ item }) => (
    <View style={styles.transpCard}>
      <View style={{ position:'relative' }}>
        <Image source={item.imagen ? { uri:item.imagen } : require('../assets/images/imagen_de_prueba.jpg')} style={styles.transpImg} />
        <View style={styles.tipoBadge}><Text style={styles.tipoBadgeText}>{item.tipo}</Text></View>
      </View>
      <View style={{ padding:14 }}>
        <Text style={styles.transpTitle}>{item.titulo}</Text>
        <Text style={styles.transpSub}>Bus urbano que recorre el centro histórico</Text>
        <View style={{ flexDirection:'row', marginTop:8 }}>
          <View style={{ marginRight:24, flexDirection:'row', alignItems:'flex-start' }}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#0086b3" style={{ marginRight:6, marginTop:2 }} />
            <View>
              <Text style={styles.metaLabel}>Tiempo de espera</Text>
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
        <Text style={styles.transpPrecio}>C$ {item.precio}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Transporte', headerTitleAlign:'center' }} />
      <ScrollView contentContainerStyle={{ paddingBottom:40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Transporte</Text>
          <Text style={styles.heroSubtitle}>Opciones de transporte seguro y confiable en Managua - Precios en córdobas</Text>
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
        {ofertasRender}
        <View style={{ marginTop:26, paddingHorizontal:16 }}>
          <Text style={styles.sectionTitle}>Opciones de Transporte ({opcionesFiltradas.length})</Text>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:4 }}>
          <FlatList
            data={opcionesFiltradas}
            keyExtractor={item => item.id}
            renderItem={renderOpcion}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height:16 }} />}
            ListEmptyComponent={<Text style={{ textAlign:'center', color:'#888', marginTop:32 }}>Sin resultados</Text>}
          />
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

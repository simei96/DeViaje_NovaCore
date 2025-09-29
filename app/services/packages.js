import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Datos estáticos de ejemplo (luego se van reemplazar por Firestore)
const FILTROS = ['Todas','Histórico','Gastronómico','Cultural','Natural','Rural'];
const TIPO_CAMBIO = 36.5;
const RUTAS = [
  {
    id:'ruta-1',
    titulo:'Ruta Histórica Colonial',
    categoria:'Histórico',
    rating:4.8,
    duracionHoras:4,
    distanciaKm:8,
    dificultad:'Fácil',
    costoUSD:25,
    paradas:['Catedral Nueva','Palacio Nacional','Teatro Nacional','Casa Presidencial'],
    descripcion:'Recorre los sitios históricos más importantes del centro de Managua',
    totalParadas:4
  },
  {
    id:'ruta-2',
    titulo:'Sabores de Managua',
    categoria:'Gastronómico',
    rating:4.6,
    duracionHoras:5,
    distanciaKm:6,
    dificultad:'Media',
    costoUSD:38,
    paradas:['Mercado Central','Café Artesanal','Restaurante Fusión','Heladería local'],
    descripcion:'Degustación guiada por platos y bebidas típicas y gourmet urbanos',
    totalParadas:5
  },
  {
    id:'ruta-3',
    titulo:'Arte y Cultura Viva',
    categoria:'Cultural',
    rating:4.5,
    duracionHoras:3,
    distanciaKm:5,
    dificultad:'Fácil',
    costoUSD:18,
    paradas:['Galería Popular','Murales Barrio','Centro Artesanal'],
    descripcion:'Explora expresiones artísticas, murales y artesanías locales auténticas',
    totalParadas:3
  },
  {
    id:'ruta-4',
    titulo:'Sendero Natural Laguna',
    categoria:'Natural',
    rating:4.7,
    duracionHoras:6,
    distanciaKm:12,
    dificultad:'Media',
    costoUSD:42,
    paradas:['Mirador Este','Bosque Secundario','Playita','Mirador Oeste'],
    descripcion:'Caminata guiada alrededor de la laguna con vistas panorámicas y biodiversidad',
    totalParadas:4
  },
  {
    id:'ruta-5',
    titulo:'Experiencia Rural Campesina',
    categoria:'Rural',
    rating:4.4,
    duracionHoras:7,
    distanciaKm:10,
    dificultad:'Media',
    costoUSD:55,
    paradas:['Finca Orgánica','Trapiche','Huerto Comunitario','Mirador Valle'],
    descripcion:'Vive costumbres rurales: cultivo, gastronomía y paisajes del interior',
    totalParadas:4
  }
];

export default function PackagesScreen(){
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const filtered = RUTAS.filter(r => (
    (activeFilter === 'Todas' || r.categoria === activeFilter) &&
    r.titulo.toLowerCase().includes(search.toLowerCase())
  ));

  const renderRuta = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        <View style={styles.badgeCategoriaWrapper}>
          <View style={[styles.badgeCategoria, styles[`cat_${item.categoria}`] || styles.cat_Default]}>
            <Text style={styles.badgeCategoriaText}>{item.categoria}</Text>
          </View>
          <View style={styles.badgeRating}> 
            <MaterialCommunityIcons name="star" size={12} color="#ffeb3b" />
            <Text style={styles.badgeRatingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.badgeParadas}><Text style={styles.badgeParadasText}>{item.totalParadas} paradas</Text></View>
        {/* Placeholder de imagen: se puede reemplazar por <Image /> */}
        <MaterialCommunityIcons name="image-multiple" size={42} color="#ffffffaa" />
        <View style={styles.imageDotsRow}>
          <View style={[styles.imgDot, styles.imgDotActive]} />
          <View style={styles.imgDot} />
          <View style={styles.imgDot} />
        </View>
      </View>
      <View style={styles.body}> 
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <View style={styles.metaRowWrap}>
          <View style={styles.metaRow}> 
            <MaterialCommunityIcons name="clock-outline" size={14} color="#546e7a" style={styles.metaIcon} />
            <Text style={styles.metaText}>{item.duracionHoras} horas</Text>
          </View>
          <View style={styles.metaRow}> 
            <MaterialCommunityIcons name="map-marker-distance" size={14} color="#546e7a" style={styles.metaIcon} />
            <Text style={styles.metaText}>{item.distanciaKm} km</Text>
          </View>
          <View style={styles.metaRow}> 
            <MaterialCommunityIcons name="human-greeting-variant" size={14} color="#546e7a" style={styles.metaIcon} />
            <Text style={styles.metaText}>{item.dificultad}</Text>
          </View>
          <View style={styles.metaRow}> 
            <MaterialCommunityIcons name="cash" size={14} color="#546e7a" style={styles.metaIcon} />
            <Text style={styles.metaText}>C$ {Math.round(item.costoUSD * TIPO_CAMBIO)}</Text>
          </View>
        </View>
        <Text style={styles.paradasLabel}>Paradas principales:</Text>
        <View style={styles.paradasChipsWrap}>
          {item.paradas.slice(0,5).map(p => (
            <View key={p} style={styles.paradaChip}><Text style={styles.paradaChipText}>{p}</Text></View>
          ))}
        </View>
        <View style={styles.actionsRow}> 
          <TouchableOpacity style={styles.mapBtn}>
            <MaterialCommunityIcons name="map" size={15} color="#0288d1" style={{ marginRight:6 }} />
            <Text style={styles.mapBtnText}>Ver en Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.planBtn}>
            <MaterialCommunityIcons name="plus" size={16} color="#fff" style={{ marginRight:6 }} />
            <Text style={styles.planBtnText}>Añadir a Mi Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Rutas Turísticas', headerTitleAlign:'center' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:60 }}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Rutas Turísticas</Text>
            <Text style={styles.heroSubtitle}>Descubre Managua paso a paso - Precios en córdobas</Text>
            <View style={styles.searchBox}> 
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar rutas, palabras clave..."
                placeholderTextColor="#b0bec5"
                value={search}
                onChangeText={setSearch}
              />
              <MaterialCommunityIcons name="magnify" size={18} color="#ffffffcc" />
            </View>
        </View>
        <View style={styles.filtrosWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
            {FILTROS.map(f => (
              <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filtroBtn, activeFilter===f && styles.filtroBtnActive]}>
                <Text style={[styles.filtroText, activeFilter===f && styles.filtroTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:18 }}>
          <Text style={styles.sectionTitle}>Rutas ({filtered.length})</Text>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:8 }}>
          <FlatList
            data={filtered}
            keyExtractor={i=>i.id}
            renderItem={renderRuta}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height:16 }} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay rutas</Text>}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:{ backgroundColor:'#0288d1', paddingHorizontal:16, paddingTop:24, paddingBottom:26, borderBottomLeftRadius:20, borderBottomRightRadius:20 },
  heroTitle:{ color:'#fff', fontSize:20, fontFamily:'Montserrat-Bold', textAlign:'center' },
  heroSubtitle:{ color:'#e1f5fe', fontSize:12, fontFamily:'Montserrat-Medium', textAlign:'center', marginTop:6 },
  searchBox:{ marginTop:14, backgroundColor:'rgba(255,255,255,0.18)', flexDirection:'row', alignItems:'center', paddingHorizontal:12, borderRadius:12 },
  searchInput:{ flex:1, color:'#fff', fontSize:14, fontFamily:'Montserrat-Medium', paddingVertical:10, paddingRight:8 },
  filtrosWrap:{ backgroundColor:'#fff', paddingVertical:12, borderBottomWidth:1, borderTopWidth:1, borderColor:'#e0e3ea', marginTop:14 },
  filtrosRow:{ paddingHorizontal:16, paddingRight:24, gap:8 },
  filtroBtn:{ backgroundColor:'#f1f5f8', paddingHorizontal:14, paddingVertical:6, borderRadius:20 },
  filtroBtnActive:{ backgroundColor:'#0288d1' },
  filtroText:{ fontSize:13, fontFamily:'Montserrat-Medium', color:'#0288d1' },
  filtroTextActive:{ color:'#fff', fontFamily:'Montserrat-SemiBold' },
  sectionTitle:{ fontSize:15, fontFamily:'Montserrat-SemiBold', color:'#01579b' },
  emptyText:{ textAlign:'center', marginTop:28, color:'#90a4ae', fontFamily:'Montserrat-Medium' },
  card:{ backgroundColor:'#fff', borderRadius:18, borderWidth:1, borderColor:'#e0e3ea', overflow:'hidden' },
  imageBox:{ height:150, backgroundColor:'#1e4f6d', alignItems:'center', justifyContent:'center', position:'relative' },
  badgeCategoriaWrapper:{ position:'absolute', top:10, left:10, right:10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  badgeCategoria:{ paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeCategoriaText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-Bold' },
  cat_Histórico:{ backgroundColor:'#1565c0' },
  cat_Gastronómico:{ backgroundColor:'#c77800' },
  cat_Cultural:{ backgroundColor:'#6a1b9a' },
  cat_Natural:{ backgroundColor:'#2e7d32' },
  cat_Rural:{ backgroundColor:'#795548' },
  cat_Default:{ backgroundColor:'#455a64' },
  badgeRating:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.55)', paddingHorizontal:8, paddingVertical:4, borderRadius:20 },
  badgeRatingText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-Bold', marginLeft:4 },
  badgeParadas:{ position:'absolute', bottom:10, right:10, backgroundColor:'rgba(0,0,0,0.55)', borderRadius:14, paddingHorizontal:10, paddingVertical:4 },
  badgeParadasText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
  imageDotsRow:{ position:'absolute', bottom:10, left:14, flexDirection:'row', gap:6 },
  imgDot:{ width:8, height:8, borderRadius:4, backgroundColor:'#ffffff55' },
  imgDotActive:{ backgroundColor:'#fff', width:16 },
  body:{ paddingHorizontal:14, paddingVertical:16 },
  titulo:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#263238' },
  descripcion:{ fontSize:11.5, fontFamily:'Montserrat-Regular', color:'#546e7a', marginTop:6, lineHeight:16 },
  metaRowWrap:{ flexDirection:'row', flexWrap:'wrap', marginTop:10, rowGap:8 },
  metaRow:{ flexDirection:'row', alignItems:'center', width:'50%', marginBottom:4 },
  metaIcon:{ marginRight:6 },
  metaText:{ fontSize:11.5, fontFamily:'Montserrat-Medium', color:'#455a64' },
  paradasLabel:{ fontSize:11.5, fontFamily:'Montserrat-SemiBold', color:'#37474f', marginTop:10 },
  paradasChipsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:6 },
  paradaChip:{ backgroundColor:'#e3f2fd', paddingHorizontal:10, paddingVertical:4, borderRadius:14 },
  paradaChipText:{ fontSize:10.5, fontFamily:'Montserrat-Medium', color:'#0d47a1' },
  actionsRow:{ flexDirection:'row', marginTop:16, gap:14 },
  mapBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#0288d1', paddingVertical:10, borderRadius:10 },
  mapBtnText:{ color:'#0288d1', fontSize:13, fontFamily:'Montserrat-SemiBold' },
  planBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#0288d1', paddingVertical:10, borderRadius:10 },
  planBtnText:{ color:'#fff', fontSize:13, fontFamily:'Montserrat-Bold' }
});

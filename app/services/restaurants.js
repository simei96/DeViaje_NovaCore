import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const FILTROS = ['Todos','Tradicional','Internacional','Mariscos','Café','Comida Rápida'];
const OFERTAS = [
  { id:'r-off-1', titulo:'Tour Gastronómico', desc:'3 restaurantes + bebidas + postre', descuento:20, precioNuevo:1480, precioAnterior:1850, vence:'Hasta 31 Dic 2025' },
  { id:'r-off-2', titulo:'Menú Ejecutivo', desc:'Entrada + plato fuerte + bebida', descuento:18, precioNuevo:340, precioAnterior:415, vence:'Hasta 15 Ene 2026' },
  { id:'r-off-3', titulo:'Festival Marisco', desc:'Buffet degustación premium', descuento:25, precioNuevo:1890, precioAnterior:2520, vence:'Hasta 30 Nov 2025' },
];
const RESTAURANTES = [
  { id:'res-1', nombre:'Gallo Pinto Tradicional', categoria:'Nicaragüense', rating:4.4, precioMin:80, precioMax:250, ciudad:'Mercado Central', especialidades:['Gallo pinto con café','Nacatamal completo','Quesillo con tortilla','Vigorón tradicional'], horario:'6:00 AM - 8:00 PM', disponible:true, imagen:null },
  { id:'res-2', nombre:'La Terraza Internacional', categoria:'Internacional', rating:4.7, precioMin:240, precioMax:720, ciudad:'Boulevard Gourmet', especialidades:['Risotto de mar','Filete en salsa','Tostadas mediterráneas'], horario:'12:00 PM - 11:00 PM', disponible:false, imagen:null },
  { id:'res-3', nombre:'Café Aroma Artesanal', categoria:'Café', rating:4.5, precioMin:90, precioMax:180, ciudad:'Zona Colonial', especialidades:['Capuccino cacao','Latte especiado','Pan artesanal'], horario:'7:00 AM - 9:00 PM', disponible:true, imagen:null },
  { id:'res-4', nombre:'Mar y Fuego', categoria:'Mariscos', rating:4.8, precioMin:320, precioMax:950, ciudad:'Malecón', especialidades:['Ceviche mixto','Langosta grill','Pulpo a la brasa'], horario:'11:00 AM - 11:30 PM', disponible:true, imagen:null },
];
const PLACEHOLDER = require('../assets/images/imagen_de_prueba.jpg');

export default function RestaurantsScreen(){
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => { const i = setInterval(()=> setCarouselIndex(p=> (p+1)%OFERTAS.length), 3800); return ()=> clearInterval(i); }, []);
  useEffect(() => { if(scrollRef.current){ scrollRef.current.scrollTo({ x: carouselIndex*300, animated:true }); } }, [carouselIndex]);

  const filtered = RESTAURANTES.filter(r => (
    (activeFilter==='Todos' || r.categoria.toLowerCase() === activeFilter.toLowerCase()) &&
    r.nombre.toLowerCase().includes(search.toLowerCase())
  ));

  const renderRest = ({ item }) => (
    <View style={styles.restCard}>
      <View style={styles.restTop}> 
        <View style={styles.restTag}><Text style={styles.restTagText}>{item.categoria}</Text></View>
        <View style={styles.restActions}> 
          <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="heart-outline" size={16} color="#444" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><MaterialCommunityIcons name="share-variant" size={16} color="#444" /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.restImageBox}>
        <MaterialCommunityIcons name="image" size={40} color="#b0bec5" />
        <View style={styles.ratingBadge}><MaterialCommunityIcons name="star" size={13} color="#ffeb3b" /><Text style={styles.ratingBadgeText}>{item.rating}</Text></View>
      </View>
      <View style={styles.restBody}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
          <Text style={styles.restTitle}>{item.nombre}</Text>
          <Text style={styles.priceRange}>C$ {item.precioMin} - C$ {item.precioMax}{' '}<Text style={styles.priceRangeUnit}>por persona</Text></Text>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', marginTop:4 }}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#607d8b" style={{ marginRight:4 }} />
          <Text style={styles.restLoc}>{item.ciudad}</Text>
        </View>
        <Text style={styles.restDesc}>Auténtica comida nicaragüense</Text>
        <View style={styles.tagsWrap}>
          {item.especialidades.slice(0,4).map(es => (
            <View key={es} style={styles.specTag}><Text style={styles.specTagText}>{es}</Text></View>
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
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Restaurantes', headerTitleAlign:'center' }} />
      <ScrollView contentContainerStyle={{ paddingBottom:50 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}> 
          <Text style={styles.heroTitle}>Restaurantes</Text>
          <Text style={styles.heroSubtitle}>Los mejores sabores de Nicaragua - Precios en córdobas</Text>
          <View style={styles.searchBox}> 
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar restaurantes, comida..."
              placeholderTextColor="#b0bec5"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
        <View style={styles.filtrosWrap}> 
          <Text style={styles.filtrosTitle}>Tipo de Cocina</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
            {FILTROS.map(f => (
              <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filtroBtn, activeFilter === f && styles.filtroBtnActive]}>
                <Text style={[styles.filtroText, activeFilter === f && styles.filtroTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Ofertas */}
        <View style={{ marginTop:22 }}>
          <View style={styles.sectionHeaderRow}> 
            <MaterialCommunityIcons name="food-fork-drink" size={18} color="#c77800" style={{ marginRight:6 }} />
            <Text style={styles.sectionTitle}>Ofertas Gastronómicas</Text>
          </View>
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
                <Text style={styles.offerVence}>{o.vence}</Text>
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
        {/* Lista restaurantes */}
        <View style={{ marginTop:26, paddingHorizontal:16 }}>
          <Text style={styles.sectionTitle}>Restaurantes ({filtered.length})</Text>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:4 }}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderRest}
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
  hero:{ backgroundColor:'#159447', paddingTop:22, paddingBottom:24, paddingHorizontal:16, borderBottomLeftRadius:20, borderBottomRightRadius:20 },
  heroTitle:{ color:'#fff', fontSize:20, fontFamily:'Montserrat-Bold', textAlign:'center', marginBottom:6 },
  heroSubtitle:{ color:'#e0f7ea', fontSize:12, fontFamily:'Montserrat-Medium', textAlign:'center', lineHeight:16, marginBottom:14 },
  searchBox:{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:10, paddingHorizontal:14, paddingVertical:10 },
  searchInput:{ color:'#fff', fontSize:14, fontFamily:'Montserrat-Medium', padding:0 },
  filtrosWrap:{ backgroundColor:'#fff', marginTop:16, paddingTop:12, paddingBottom:4, borderTopWidth:1, borderBottomWidth:1, borderColor:'#e0e3ea' },
  filtrosTitle:{ fontSize:14, fontFamily:'Montserrat-SemiBold', color:'#37474f', paddingHorizontal:16, marginBottom:8 },
  filtrosRow:{ paddingHorizontal:16, paddingRight:24, gap:8 },
  filtroBtn:{ backgroundColor:'#f1f5f8', paddingHorizontal:14, paddingVertical:6, borderRadius:20 },
  filtroBtnActive:{ backgroundColor:'#159447' },
  filtroText:{ fontSize:13, fontFamily:'Montserrat-Medium', color:'#159447' },
  filtroTextActive:{ color:'#fff', fontFamily:'Montserrat-SemiBold' },
  sectionTitle:{ fontSize:15, fontFamily:'Montserrat-SemiBold', color:'#0b593d', marginBottom:10 },
  sectionHeaderRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, marginBottom:10 },
  offerCard:{ width:300, backgroundColor:'#fff', borderRadius:18, padding:16, position:'relative', borderWidth:1, borderColor:'#e0e3ea' },
  offerTitle:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#37474f' },
  offerDesc:{ fontSize:12, fontFamily:'Montserrat-Regular', color:'#607d8b', marginTop:4 },
  ofertaPrecioNuevo:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#c77800' },
  ofertaPrecioAnterior:{ fontSize:11, fontFamily:'Montserrat-Regular', color:'#b0bec5', textDecorationLine:'line-through', marginLeft:8, marginBottom:2 },
  offerVence:{ fontSize:10, fontFamily:'Montserrat-Medium', color:'#78909c', marginTop:4 },
  badgeDescuento:{ backgroundColor:'#ffb300', borderRadius:8, paddingHorizontal:8, paddingVertical:2, marginLeft:8 },
  badgeDescuentoText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-Bold' },
  offerAccent:{ position:'absolute', right:0, top:0, bottom:0, width:6, backgroundColor:'#00c49a', borderTopRightRadius:18, borderBottomRightRadius:18 },
  dotsRow:{ flexDirection:'row', justifyContent:'center', marginTop:12, gap:6 },
  dot:{ width:8, height:8, borderRadius:4, backgroundColor:'#cfd8dc', opacity:0.6 },
  dotActive:{ backgroundColor:'#159447', opacity:1, width:16 },
  restCard:{ backgroundColor:'#fff', borderRadius:18, borderWidth:1, borderColor:'#e0e3ea', overflow:'hidden' },
  restTop:{ position:'absolute', top:10, left:10, right:10, zIndex:2, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  restTag:{ backgroundColor:'#159447', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  restTagText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
  restActions:{ flexDirection:'row', gap:8 },
  iconBtn:{ backgroundColor:'rgba(0,0,0,0.35)', padding:6, borderRadius:20 },
  restImageBox:{ backgroundColor:'#f5f7f8', height:130, alignItems:'center', justifyContent:'center' },
  ratingBadge:{ position:'absolute', bottom:8, right:8, backgroundColor:'#424242', borderRadius:14, paddingHorizontal:10, paddingVertical:4, flexDirection:'row', alignItems:'center' },
  ratingBadgeText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-Bold', marginLeft:4 },
  restBody:{ padding:14, paddingTop:16 },
  restTitle:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#263238', flex:1, paddingRight:8 },
  priceRange:{ fontSize:13, fontFamily:'Montserrat-Bold', color:'#c77800', textAlign:'right' },
  priceRangeUnit:{ fontSize:10, fontFamily:'Montserrat-Medium', color:'#607d8b' },
  restLoc:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#607d8b' },
  restDesc:{ fontSize:11, fontFamily:'Montserrat-Regular', color:'#546e7a', marginTop:6 },
  tagsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:8 },
  specTag:{ backgroundColor:'#e0f7ea', paddingHorizontal:10, paddingVertical:4, borderRadius:16 },
  specTagText:{ color:'#0b593d', fontSize:10, fontFamily:'Montserrat-Medium' },
  restSchedule:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#37474f' },
  disponible:{ fontSize:11, fontFamily:'Montserrat-SemiBold' },
  actionsRow:{ flexDirection:'row', marginTop:14, gap:14 },
  outlineBtn:{ flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#008c5a', paddingVertical:10, borderRadius:10, gap:6, backgroundColor:'#fff' },
  outlineBtnText:{ color:'#008c5a', fontSize:13, fontFamily:'Montserrat-SemiBold' },
  primaryBtn:{ flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor:'#ff9800', paddingVertical:10, borderRadius:10 },
  primaryBtnText:{ color:'#fff', fontSize:13, fontFamily:'Montserrat-Bold' },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Datos mock (reemplazables por Firestore después)
const OFERTAS = [
  { id: 'h-off-1', titulo: 'Escapada Romántica', desc: '2 noches + cena romántica + spa', descuento: 30, precioNuevo: 5740, precioAnterior: 8200, vence: 'Hasta 31 Dic 2025' },
  { id: 'h-off-2', titulo: 'Semana Familiar', desc: 'Desayunos + piscina + tour volcán', descuento: 22, precioNuevo: 8120, precioAnterior: 10400, vence: 'Hasta 15 Ene 2026' },
  { id: 'h-off-3', titulo: 'Negocios Premium', desc: 'Suite + cowork + transporte', descuento: 18, precioNuevo: 9320, precioAnterior: 11370, vence: 'Hasta 30 Nov 2025' },
];

const PLACEHOLDER = require('../assets/images/imagen_de_prueba.jpg');
const HOSPEDAJES = [
  { id:'hot-1', nombre:'Hotel Managua Colonial', tipo:'Hotel', ciudad:'Centro Histórico', rating:4.6, precio:1250, modalidad:'por noche', fotos:3, imagenes:[null,null,null], desc:'Hotel boutique en el corazón histórico de Managua' },
  { id:'hot-2', nombre:'Hostal Ruta Pacífica', tipo:'Hostal', ciudad:'Zona Universitaria', rating:4.2, precio:480, modalidad:'por noche', fotos:3, imagenes:[null,null,null], desc:'Ambiente juvenil y económico' },
  { id:'hot-3', nombre:'Aparta Suites Real', tipo:'Apartamento', ciudad:'Distrito Financiero', rating:4.8, precio:2100, modalidad:'por noche', fotos:3, imagenes:[null,null,null], desc:'Suites equipadas para estadías largas' },
  { id:'hot-4', nombre:'Resort Laguna Azul', tipo:'Resort', ciudad:'Laguna de Apoyo', rating:4.9, precio:3250, modalidad:'por noche', fotos:3, imagenes:[null,null,null], desc:'Resort con vista panorámica y actividades acuáticas' },
];

const FILTROS = ['Todos', 'Hoteles', 'Hostales', 'Apartamentos', 'Resort'];

export default function HotelsScreen(){
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

  const filteredHospedajes = HOSPEDAJES.filter(h => (
    (activeFilter === 'Todos' || h.tipo.toLowerCase() === activeFilter.toLowerCase().slice(0, -1) || h.tipo.toLowerCase() === activeFilter.toLowerCase()) &&
    h.nombre.toLowerCase().includes(search.toLowerCase())
  ));

  const renderHospedaje = ({ item }) => (
    <View style={styles.hotelCard}>
      <View style={styles.galleryWrapper}>
        <View style={{ flexDirection:'row', gap:4, flex:1 }}>
          {Array.from({ length:3 }).map((_, idx) => {
            const imgs = item.imagenes || [];
            const src = imgs[idx];
            const source = src ? { uri: src } : PLACEHOLDER;
            return <Image key={idx} source={source} style={styles.hotelImgSmall} />;
          })}
        </View>
        <View style={styles.tipoBadge}><Text style={styles.tipoBadgeText}>{item.tipo}</Text></View>
        <View style={styles.fotosBadge}><MaterialCommunityIcons name="image-multiple" size={14} color="#fff" style={{ marginRight:4 }} /><Text style={styles.fotosBadgeText}>{item.fotos}</Text></View>
        <View style={styles.ratingBadge}><MaterialCommunityIcons name="star" size={13} color="#ffeb3b" /><Text style={styles.ratingBadgeText}>{item.rating}</Text></View>
      </View>
      <View style={{ padding:14 }}>
        <Text style={styles.hotelTitle}>{item.nombre}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', marginTop:2 }}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#607d8b" style={{ marginRight:4 }} />
              <Text style={styles.hotelLoc}>{item.ciudad}</Text>
            </View>
        <Text style={styles.hotelDesc}>{item.desc}</Text>
        <Text style={styles.hotelPrecio}>C$ {item.precio} <Text style={styles.hotelModalidad}>{item.modalidad}</Text></Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ title:'Hospedaje', headerTitleAlign:'center' }} />
      <ScrollView contentContainerStyle={{ paddingBottom:50 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Hospedaje</Text>
          <Text style={styles.heroSubtitle}>Los mejores lugares para hospedarse en Managua - Precios en córdobas</Text>
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
          <Text style={styles.filtrosTitle}>Tipo de Hospedaje</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
            {FILTROS.map(f => (
              <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filtroBtn, activeFilter === f && styles.filtroBtnActive]}>
                <Text style={[styles.filtroText, activeFilter === f && styles.filtroTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Carrusel Ofertas */}
        <View style={{ marginTop:22 }}>
          <View style={styles.sectionHeaderRow}> 
            <MaterialCommunityIcons name="gift" size={18} color="#c77800" style={{ marginRight:6 }} />
            <Text style={[styles.sectionTitle, styles.sectionTitleInline]}>Ofertas de Hospedaje</Text>
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
        {/* Lista Hospedaje */}
        <View style={{ marginTop:26, paddingHorizontal:16 }}>
          <Text style={styles.sectionTitle}>Opciones de Hospedaje ({filteredHospedajes.length})</Text>
        </View>
        <View style={{ paddingHorizontal:16, marginTop:4 }}>
          <FlatList
            data={filteredHospedajes}
            keyExtractor={item => item.id}
            renderItem={renderHospedaje}
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
  sectionTitle:{ fontSize:15, fontFamily:'Montserrat-SemiBold', color:'#004d60', marginBottom:10 },
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
  dotActive:{ backgroundColor:'#0086b3', opacity:1, width:16 },
  sectionHeaderRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, marginBottom:10 },
  hotelCard:{ backgroundColor:'#fff', borderRadius:18, overflow:'hidden', borderWidth:1, borderColor:'#e0e3ea' },
  galleryWrapper:{ position:'relative', width:'100%' },
  hotelImg:{ width:'100%', height:160 },
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
  sectionTitleInline:{ marginBottom:0, lineHeight:18, paddingTop:1 }
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

const USER_ID_PLACEHOLDER = 'anon';
const precioBase = 1000;

export default function RutaTuristicaDetailScreen(){
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [bebes, setBebes] = useState(0);
  const [serviciosAdicionales, setServiciosAdicionales] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const ref = doc(db, 'Paquetes', String(id));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setData({ id: snap.id, ...snap.data() });
      } else {
        setError('No encontrado');
      }
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(()=> { fetchData(); }, [fetchData]);

  const precioAdulto = data?.PrecioAdulto || precioBase;
  const precioNino = data?.PrecioNino || Math.round(precioAdulto * 0.7);
  const precioBebe = 0;
  const totalPersonas = adultos + ninos + bebes;
  const totalServiciosAdicionales = serviciosAdicionales.reduce((acc, s) => acc + (s.precio || 0), 0);
  const total = adultos * precioAdulto + ninos * precioNino + bebes * precioBebe + totalServiciosAdicionales;

  // Reservar
  const reservar = async () => {
    if(!data) return; 
    try {
      setSaving(true);
      await addDoc(collection(db,'Reservas'), {
        Titulo: data.Nombre || 'Ruta Turística',
        Tipo: 'Paquete',
        Precio: total,
        Estado: 'pendiente',
        UsuarioId: USER_ID_PLACEHOLDER,
        FechaReserva: serverTimestamp(),
        Adultos: adultos,
        Ninos: ninos,
        Bebes: bebes,
        ServiciosAdicionales: serviciosAdicionales.map(s=>s.nombre),
      });
      Alert.alert('Reserva','Reserva creada correctamente');
    } catch (e) {
      Alert.alert('Error','No se pudo crear la reserva');
    } finally { setSaving(false); }
  };

  // Servicios incluidos/adicionales
  const incluidos = data?.ServiciosIncluidos || [];
  const adicionales = data?.ServiciosAdicionales || [];

  // Recorrido
  const recorrido = data?.Recorrido || {};

  const imagen = data?.ImagenURL || null;

  // Rating
  const rating = typeof data?.Rating === 'number' ? data.Rating.toFixed(1) : null;

  // Handlers adicionales
  const toggleAdicional = (serv) => {
    setServiciosAdicionales(prev => {
      const exists = prev.find(s => s.nombre === serv.nombre);
      if(exists){
        return prev.filter(s => s.nombre !== serv.nombre);
      } else {
        return [...prev, serv];
      }
    });
  };

  return (
    <View style={{ flex:1, backgroundColor:'#f6fafd' }}>
      <Stack.Screen options={{ headerShown:false }} />
      {loading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator color="#0b593d" size="large" /></View>
      ) : error ? (
        <View style={{ padding:24 }}><Text style={{ color:'#b71c1c', fontFamily:'Montserrat-SemiBold' }}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom:40 }}>
          <View style={styles.heroWrapper}>
            {imagen ? <Image source={{ uri: imagen }} style={styles.heroImg} /> : <View style={styles.heroImgPlaceholder}><MaterialCommunityIcons name="image" size={60} color="#b0bec5" /></View>}
            <View style={styles.heroOverlay} />
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={20} color="#fff" /></TouchableOpacity>
              <View style={{ flexDirection:'row', gap:10 }}>
                <TouchableOpacity style={styles.roundBtn}><MaterialCommunityIcons name="star" size={18} color="#ffeb3b" /></TouchableOpacity>
                {rating && <Text style={styles.ratingBadge}>{rating}</Text>}
              </View>
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>{data.Nombre || 'Ruta Turística'}</Text>
              <Text style={styles.heroSub}>{data.Descripcion || ''}</Text>
              <View style={{ flexDirection:'row', gap:10, marginTop:6 }}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#0b593d" />
                <Text style={styles.heroMeta}>{data.Ubicacion || ''}</Text>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#0b593d" />
                <Text style={styles.heroMeta}>{data.Duracion || ''}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.sectionHead}>Cantidad de personas</Text>
          <View style={styles.personaRow}><Text style={styles.personaLabel}>Adultos</Text><Text style={styles.personaDesc}>Mayores de 12 años</Text>
            <View style={styles.counterWrap}>
              <TouchableOpacity style={styles.counterBtn} onPress={()=> setAdultos(Math.max(1, adultos-1))}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.counterValue}>{adultos}</Text>
            </View>
          </View>
          <View style={styles.personaRow}><Text style={styles.personaLabel}>Niños</Text><Text style={styles.personaDesc}>3-12 años (30% descuento)</Text>
            <View style={styles.counterWrap}>
              <TouchableOpacity style={styles.counterBtn} onPress={()=> setNinos(Math.max(0, ninos-1))}><Text style={styles.counterBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.counterValue}>{ninos}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={()=> setNinos(ninos+1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.personaRow}><Text style={styles.personaLabel}>Bebés</Text><Text style={styles.personaDesc}>0-2 años (gratis)</Text>
            <View style={styles.counterWrap}>
              <Text style={styles.counterValue}>{bebes}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={()=> setBebes(bebes+1)}><Text style={styles.counterBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
          <Text style={styles.personaResumen}>Total personas: {adultos} adultos{ninos>0?`, ${ninos} niños`:''}{bebes>0?`, ${bebes} bebés`:''}</Text>
          <View style={styles.serviciosIncluidosBox}>
            {incluidos.map((s,i)=>(<View key={i} style={styles.servicioIncluidoRow}><MaterialCommunityIcons name="check-circle" size={18} color="#0b593d" style={{ marginRight:6 }} /><Text style={styles.servicioIncluidoNombre}>{s.nombre}</Text><Text style={styles.servicioIncluidoPrecio}>{formatCordoba(s.precio)}</Text></View>))}
          </View>
          {adicionales.length>0 && <View style={styles.serviciosAdicionalesBox}>
            <Text style={styles.sectionHead}>Servicios adicionales:</Text>
            {adicionales.map((s,i)=>(<View key={i} style={styles.servicioAdicionalRow}>
              <TouchableOpacity style={styles.servicioAdicionalBtn} onPress={()=> toggleAdicional(s)}>
                <MaterialCommunityIcons name={serviciosAdicionales.find(a=>a.nombre===s.nombre)?'checkbox-marked':'checkbox-blank-outline'} size={18} color="#0b593d" />
              </TouchableOpacity>
              <Text style={styles.servicioAdicionalPrecio}>{formatCordoba(s.precio)}</Text>
            </View>))}
          </View>}
          {recorrido && <View style={styles.recorridoBox}>
            <Text style={styles.sectionHead}>Recorrido del Paquete</Text>
            <View style={styles.recorridoMetaRow}>
              <Text style={styles.recorridoMeta}>Distancia total <Text style={styles.recorridoMetaValue}>{recorrido.distancia || '--'}</Text></Text>
              <Text style={styles.recorridoMeta}>Tiempo estimado <Text style={styles.recorridoMetaValue}>{recorrido.tiempo || '--'}</Text></Text>
            </View>
            {recorrido.puntos && recorrido.puntos.length>0 && <View style={styles.recorridoPuntosRow}>
              {recorrido.puntos.map((p,i)=>(<View key={i} style={styles.recorridoPunto}><MaterialCommunityIcons name="map-marker" size={18} color="#0b593d" /><Text style={styles.recorridoPuntoText}>{p}</Text></View>))}
            </View>}
            <View style={styles.recorridoBtnsRow}>
              <TouchableOpacity style={styles.outlineBtn}><MaterialCommunityIcons name="directions" size={16} color="#0b593d" style={{ marginRight:6 }} /><Text style={styles.outlineBtnText}>Direcciones</Text></TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn}><MaterialCommunityIcons name="share-variant" size={16} color="#0b593d" style={{ marginRight:6 }} /><Text style={styles.outlineBtnText}>Compartir ubicación</Text></TouchableOpacity>
            </View>
          </View>}
          <View style={styles.resumenBox}>
            <Text style={styles.sectionHead}>Resumen de precios</Text>
            <Text style={styles.resumenItem}>Adultos: {adultos} x {formatCordoba(precioAdulto)}</Text>
            <Text style={styles.resumenItem}>Niños: {ninos} x {formatCordoba(precioNino)}</Text>
            <Text style={styles.resumenItem}>Bebés: {bebes} x {formatCordoba(precioBebe)}</Text>
            {serviciosAdicionales.length>0 && <Text style={styles.resumenItem}>Servicios adicionales: {formatCordoba(totalServiciosAdicionales)}</Text>}
            <Text style={styles.resumenTotal}>Total: {formatCordoba(total)} NIO</Text>
          </View>
          <TouchableOpacity style={styles.reservarBtn} onPress={reservar} disabled={saving}>
            <Text style={styles.reservarBtnText}>{saving? 'Guardando...' : `Reservar por ${formatCordoba(total)} NIO`}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper:{ backgroundColor:'#fff', borderBottomLeftRadius:20, borderBottomRightRadius:20, overflow:'hidden' },
  heroImg:{ width:'100%', height:160, borderRadius:20 },
  heroImgPlaceholder:{ width:'100%', height:160, alignItems:'center', justifyContent:'center', backgroundColor:'#eceff1', borderRadius:20 },
  heroOverlay:{ position:'absolute', left:0, right:0, top:0, height:160, backgroundColor:'rgba(0,0,0,0.18)', borderTopLeftRadius:20, borderTopRightRadius:20 },
  topBar:{ position:'absolute', top:14, left:14, right:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  roundBtn:{ backgroundColor:'rgba(0,0,0,0.45)', width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  ratingBadge:{ backgroundColor:'#fff', color:'#0b593d', fontWeight:'bold', fontSize:13, borderRadius:12, paddingHorizontal:8, paddingVertical:2, marginLeft:8 },
  heroTextBlock:{ position:'absolute', left:16, bottom:14, right:16 },
  heroTitle:{ color:'#0b593d', fontSize:20, fontFamily:'Montserrat-Bold' },
  heroSub:{ color:'#37474f', fontSize:13, fontFamily:'Montserrat-Medium', marginTop:4 },
  heroMeta:{ color:'#607d8b', fontSize:12, fontFamily:'Montserrat-Medium', marginRight:10 },
  personasBox:{ backgroundColor:'#fff', borderRadius:14, padding:14, marginTop:18 },
  sectionHead:{ fontSize:14, fontFamily:'Montserrat-SemiBold', color:'#0b593d', marginBottom:8 },
  personaRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  personaLabel:{ fontSize:13, fontFamily:'Montserrat-Bold', color:'#263238' },
  personaDesc:{ fontSize:11, color:'#607d8b', marginLeft:8 },
  counterWrap:{ flexDirection:'row', alignItems:'center', gap:6 },
  counterBtn:{ backgroundColor:'#e0f7fa', borderRadius:8, paddingHorizontal:10, paddingVertical:2 },
  counterBtnText:{ color:'#0b593d', fontSize:16, fontWeight:'bold' },
  counterValue:{ fontSize:15, fontFamily:'Montserrat-Bold', color:'#0b593d', marginHorizontal:8 },
  personaResumen:{ fontSize:12, color:'#37474f', marginTop:8, textAlign:'right' },
  serviciosIncluidosBox:{ backgroundColor:'#f6fafd', borderRadius:14, padding:14, marginTop:18 },
  servicioIncluidoRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  servicioIncluidoNombre:{ fontSize:13, color:'#0b593d', fontFamily:'Montserrat-Medium' },
  servicioIncluidoPrecio:{ fontSize:13, color:'#263238', fontFamily:'Montserrat-Bold' },
  serviciosAdicionalesBox:{ backgroundColor:'#f6fafd', borderRadius:14, padding:14, marginTop:18 },
  servicioAdicionalRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  servicioAdicionalBtn:{ marginRight:8 },
  servicioAdicionalNombre:{ fontSize:13, color:'#0b593d', fontFamily:'Montserrat-Medium' },
  servicioAdicionalPrecio:{ fontSize:13, color:'#263238', fontFamily:'Montserrat-Bold' },
  recorridoBox:{ backgroundColor:'#fff', borderRadius:14, padding:14, marginTop:18 },
  recorridoMetaRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  recorridoMeta:{ fontSize:12, color:'#607d8b' },
  recorridoMetaValue:{ fontWeight:'bold', color:'#0b593d' },
  recorridoPuntosRow:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:8 },
  recorridoPunto:{ flexDirection:'row', alignItems:'center', gap:4 },
  recorridoPuntoText:{ fontSize:12, color:'#37474f' },
  recorridoBtnsRow:{ flexDirection:'row', gap:14, marginTop:12 },
  outlineBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#0b593d', paddingVertical:10, borderRadius:10 },
  outlineBtnText:{ color:'#0b593d', fontSize:13, fontFamily:'Montserrat-SemiBold' },
  resumenBox:{ backgroundColor:'#f6fafd', borderRadius:14, padding:14, marginTop:18 },
  resumenItem:{ fontSize:12, color:'#37474f', marginBottom:4 },
  resumenTotal:{ fontSize:15, color:'#0b593d', fontFamily:'Montserrat-Bold', marginTop:8, textAlign:'right' },
  reservarBtn:{ backgroundColor:'#0b593d', borderRadius:14, marginTop:18, paddingVertical:16, alignItems:'center' },
  reservarBtnText:{ color:'#fff', fontSize:16, fontFamily:'Montserrat-Bold' },
});

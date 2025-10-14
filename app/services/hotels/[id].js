import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

const USER_ID_PLACEHOLDER = 'anon'; 

export default function HotelDetailScreen(){
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
  const ref = doc(db, 'Hoteles', String(id));
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

  const reservar = async () => {
    if(!data) return; 
    try {
      setSaving(true);
      const userId = auth.currentUser?.uid || USER_ID_PLACEHOLDER;
      await addDoc(collection(db,'Reservas'), {
        Titulo: data.Nombre || 'Hotel',
        Tipo: data.Tipo || 'Hotel',
        Precio: data.PrecioPorNoche || 0,
        Lugar: data.Ubicacion || 'Ciudad',
        Estado: 'pendiente',
        UsuarioId: userId,
        FechaReserva: serverTimestamp(),
      });
      Alert.alert('Reserva','Reserva creada correctamente');
    } catch (e) {
      Alert.alert('Error','No se pudo crear la reserva');
    } finally { setSaving(false); }
  };

  const abrirMapa = () => {
    if(!data) return;
    const lat = data.Lat || data.lat;
    const lng = data.Lng || data.lng;
    const query = (lat && lng) ? `${lat},${lng}` : encodeURIComponent((data.Nombre||data.nombre||'Hotel') + ' Nicaragua');
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(()=> Alert.alert('Mapa','No se pudo abrir el mapa'));
  };

  const servicios = data? (data.Servicios || data.servicios || []) : [];
  const metodos = data? (data.MetodosPago || data.metodosPago || []) : [];
  const politicas = data? (data.Politicas || data.politicas || []) : [];
  const imagenPrincipal = data?.ImagenURL || null;

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <Stack.Screen options={{ headerShown:false }} />
      {loading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator color="#0086b3" size="large" /></View>
      ) : error ? (
        <View style={{ padding:24 }}><Text style={{ color:'#b71c1c', fontFamily:'Montserrat-SemiBold' }}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom:40 }}>
          {/* Hero */}
          <View style={styles.heroWrapper}>
            <Image source={imagenPrincipal ? { uri: imagenPrincipal } : { uri: 'https://firebasestorage.googleapis.com/v0/b/deviaje-75dbd.appspot.com/o/imagen_de_prueba.jpg?alt=media' }} style={styles.heroImg} />
            <View style={styles.heroOverlay} />
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={20} color="#fff" /></TouchableOpacity>
              <View style={{ flexDirection:'row', gap:10 }}>
                <TouchableOpacity style={styles.roundBtn}><MaterialCommunityIcons name="heart-outline" size={18} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={styles.roundBtn}><MaterialCommunityIcons name="share-variant" size={18} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={styles.roundBtn}><MaterialCommunityIcons name="star" size={18} color="#ffeb3b" /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroTextBlock}>
              <View style={styles.badgeTipo}><Text style={styles.badgeTipoText}>{data.Tipo || 'Hotel'}</Text></View>
              <Text style={styles.heroTitle}>{data.Nombre || 'Hotel'}</Text>
              <Text style={styles.heroSub}>{data.Ubicacion || 'Ciudad'}</Text>
              <Text style={styles.heroPrice}>{formatCordoba(data.PrecioPorNoche || 0)} <Text style={{ fontSize:12, color:'#fff' }}>por noche</Text></Text>
            </View>
          </View>
          <View style={{ paddingHorizontal:18, paddingTop:18 }}>
            {data.Descripcion || data.descripcion ? (
              <Text style={styles.descText}>{data['Descripción']}</Text>
            ) : <Text style={styles.descText}>Hospedaje turístico</Text>}
            <View style={styles.infoRow}> 
              <View style={styles.infoItem}>
                <View style={[styles.iconCircle,{ backgroundColor:'#e8f5e9' }]}><MaterialCommunityIcons name="star" size={18} color="#2e7d32" /></View>
                <View style={{ flex:1 }}>
                  <Text style={styles.infoLabel}>Rating</Text>
                  <Text style={styles.infoValue}>{(data.Rating || data.rating) ? (data.Rating || data.rating).toFixed(1) : 'N/D'}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.iconCircle,{ backgroundColor:'#e0f2fe' }]}><MaterialCommunityIcons name="wifi" size={18} color="#0277bd" /></View>
                <View style={{ flex:1 }}>
                  <Text style={styles.infoLabel}>WiFi</Text>
                  <Text style={styles.infoValue}>{servicios.includes('WiFi') ? 'Sí' : '—'}</Text>
                </View>
              </View>
            </View>
            <View style={{ marginTop:22 }}>
              <Text style={styles.sectionHead}>Servicios</Text>
              {servicios.length>0 ? (
                <View style={styles.chipsWrap}>
                  {servicios.map(s => <View key={s} style={styles.payChip}><Text style={styles.payChipText}>{s}</Text></View>)}
                </View>
              ) : <Text style={styles.emptyMini}>No registrados</Text>}
            </View>
            <View style={{ marginTop:22 }}>
              <Text style={styles.sectionHead}>Métodos de Pago</Text>
              {metodos.length>0 ? (
                <View style={styles.chipsWrap}>
                  {metodos.map(m => <View key={m} style={styles.payChipAlt}><Text style={styles.payChipAltText}>{m}</Text></View>)}
                </View>
              ) : <Text style={styles.emptyMini}>No registrados</Text>}
            </View>
            <View style={{ marginTop:24, backgroundColor:'#fff8e1', borderRadius:14, padding:14 }}>
              <Text style={styles.secTitle}>Políticas</Text>
              {politicas.length>0 ? politicas.map(p => (
                <View key={p} style={{ flexDirection:'row', alignItems:'flex-start', marginTop:6 }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#ff9800" style={{ marginRight:6, marginTop:2 }} />
                  <Text style={styles.secItem}>{p}</Text>
                </View>
              )) : <Text style={styles.emptyMini}>Sin políticas registradas</Text>}
            </View>
            <View style={styles.actionsRow}> 
              {(data.Lat || data.lat) && (data.Lng || data.lng) ? (
                <TouchableOpacity style={styles.outlineBtn} onPress={abrirMapa}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#0277bd" style={{ marginRight:6 }} />
                  <Text style={styles.outlineBtnText}>Ver en Mapa</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.outlineBtn,{ opacity:0.5 }]}>
                  <MaterialCommunityIcons name="map-marker-off" size={16} color="#78909c" style={{ marginRight:6 }} />
                  <Text style={[styles.outlineBtnText,{ color:'#78909c' }]}>Sin Ubicación</Text>
                </View>
              )}
              <TouchableOpacity style={styles.primaryBtn} onPress={reservar} disabled={saving}>
                <MaterialCommunityIcons name="calendar-check" size={16} color="#fff" style={{ marginRight:6 }} />
                <Text style={styles.primaryBtnText}>{saving? 'Guardando...' : 'Reservar'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>¿Dudas? Llama al <Text style={{ color:'#0277bd' }}>+505 2222-3333</Text></Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper:{ height:260, backgroundColor:'#000', borderBottomLeftRadius:24, borderBottomRightRadius:24, overflow:'hidden' },
  heroImg:{ width:'100%', height:'100%' },
  heroOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.35)' },
  topBar:{ position:'absolute', top:16, left:14, right:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  roundBtn:{ backgroundColor:'rgba(0,0,0,0.45)', width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  heroTextBlock:{ position:'absolute', left:16, bottom:14, right:16 },
  badgeTipo:{ backgroundColor:'#0086b3', alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, borderRadius:8, marginBottom:8 },
  badgeTipoText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
  heroTitle:{ color:'#fff', fontSize:20, fontFamily:'Montserrat-Bold' },
  heroSub:{ color:'#e0f7fa', fontSize:12, fontFamily:'Montserrat-Medium', marginTop:4 },
  heroPrice:{ color:'#ffeb3b', fontSize:16, fontFamily:'Montserrat-Bold', marginTop:8 },
  descText:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#455a64', lineHeight:17 },
  infoRow:{ flexDirection:'row', gap:14, marginTop:18 },
  infoItem:{ flex:1, flexDirection:'row', alignItems:'flex-start' },
  iconCircle:{ width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  infoLabel:{ fontSize:11, fontFamily:'Montserrat-SemiBold', color:'#37474f' },
  infoValue:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#263238', marginTop:2 },
  sectionHead:{ fontSize:13, fontFamily:'Montserrat-SemiBold', color:'#01579b' },
  chipsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:10 },
  payChip:{ backgroundColor:'#f1f5f8', paddingHorizontal:12, paddingVertical:6, borderRadius:14 },
  payChipText:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#01579b' },
  payChipAlt:{ backgroundColor:'#e3f2fd', paddingHorizontal:12, paddingVertical:6, borderRadius:14 },
  payChipAltText:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#01579b' },
  secTitle:{ fontSize:13, fontFamily:'Montserrat-Bold', color:'#9c6500' },
  secItem:{ fontSize:11.5, fontFamily:'Montserrat-Medium', color:'#5d4630' },
  actionsRow:{ flexDirection:'row', gap:14, marginTop:28 },
  outlineBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#0277bd', paddingVertical:12, borderRadius:10 },
  outlineBtnText:{ color:'#0277bd', fontSize:13, fontFamily:'Montserrat-SemiBold' },
  primaryBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#ff9800', paddingVertical:12, borderRadius:10 },
  primaryBtnText:{ color:'#fff', fontSize:13, fontFamily:'Montserrat-Bold' },
  helpText:{ textAlign:'center', fontSize:11, fontFamily:'Montserrat-Medium', color:'#607d8b', marginTop:16, marginBottom:4 }
});

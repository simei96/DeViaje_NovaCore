import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

const USER_ID_PLACEHOLDER = 'anon'; 

export default function TransportDetailScreen(){
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
  const ref = doc(db, 'Transportes', String(id));
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

  const openMap = () => {
    if(!data) return;
    const lat = data.Lat || data.lat;
    const lng = data.Lng || data.lng;
    const query = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(data.Titulo || data.titulo || 'Destino');
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(()=> Alert.alert('Mapa','No se pudo abrir el mapa'));
  };

  const reservar = async () => {
    if(!data) return; 
    try {
      setSaving(true);
      await addDoc(collection(db,'Reservas'), {
        Titulo: data.Nombre || 'Transporte',
        Tipo: data.Tipo || 'Transporte',
        Precio: (data.Precios && data.Precios.Adulto) ? data.Precios.Adulto : 0,
        Lugar: data.Empresa || 'Transporte',
        Estado: 'pendiente',
        UsuarioId: USER_ID_PLACEHOLDER,
        FechaReserva: serverTimestamp(),
      });
      Alert.alert('Reserva','Reserva creada correctamente');
    } catch (e) {
      Alert.alert('Error','No se pudo crear la reserva');
    } finally { setSaving(false); }
  };

  const metodo = data?.MetodosPago || [];
  const seguridad = data?.Seguridad || [];
  const rutas = data?.Rutas || [];

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
            <Image source={data.ImagenURL ? { uri:data.ImagenURL } : { uri: 'https://firebasestorage.googleapis.com/v0/b/deviaje-75dbd.appspot.com/o/imagen_de_prueba.jpg?alt=media' }} style={styles.heroImg} />
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
              <View style={styles.badgeTipo}><Text style={styles.badgeTipoText}>{data.Tipo || data.tipo || 'Transporte'}</Text></View>
              <Text style={styles.heroTitle}>{data.Titulo || data.titulo}</Text>
              <Text style={styles.heroSub}>{data.Descripcion || data.descripcion || 'Servicio turístico'}</Text>
              <Text style={styles.heroPrice}>{formatCordoba(data.Precio || data.precio || 0)}</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal:18, paddingTop:18 }}>
            <View style={styles.infoRow}> 
              <View style={styles.infoItem}>
                <View style={[styles.iconCircle,{ backgroundColor:'#e0f2fe' }]}><MaterialCommunityIcons name="clock-outline" size={18} color="#0277bd" /></View>
                <View style={{ flex:1 }}>
                  <Text style={styles.infoLabel}>Tiempo de espera</Text>
                  <Text style={styles.infoValue}>{data.Espera || data.espera || data.Horario || '--'}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.iconCircle,{ backgroundColor:'#e8f5e9' }]}><MaterialCommunityIcons name="account-group" size={18} color="#2e7d32" /></View>
                <View style={{ flex:1 }}>
                  <Text style={styles.infoLabel}>Capacidad</Text>
                  <Text style={styles.infoValue}>{data.Capacidad || data.capacidad || 'N/D'}</Text>
                </View>
              </View>
            </View>
            {rutas.length>0 ? (
              <Text style={styles.rutasText}>{rutas.join(', ')}</Text>
            ) : (
              <Text style={styles.rutasText}>Sin rutas listadas</Text>
            )}
            {data.Frecuencia || data.frecuencia ? (
              <View style={{ marginTop:16 }}>
                <Text style={styles.sectionHead}>Información Adicional</Text>
                <View style={{ flexDirection:'row', alignItems:'flex-start', marginTop:8 }}>
                  <MaterialCommunityIcons name="timer-sand" size={16} color="#455a64" style={{ marginRight:6, marginTop:2 }} />
                  <View style={{ flex:1 }}>
                    <Text style={styles.infoSubLabel}>Frecuencia</Text>
                    <Text style={styles.infoSubValue}>{data.Frecuencia || data.frecuencia}</Text>
                  </View>
                </View>
              </View>
            ): null}
            <View style={{ marginTop:22 }}>
              <Text style={styles.sectionHead}>Métodos de Pago Aceptados</Text>
              {metodo.length>0 ? (
                <View style={styles.chipsWrap}>
                  {metodo.map(m => <View key={m} style={styles.payChip}><Text style={styles.payChipText}>{m}</Text></View>)}
                </View>
              ) : (
                <Text style={styles.emptyMini}>No registrados</Text>
              )}
            </View>
            <View style={{ marginTop:26, backgroundColor:'#e9f8f0', borderRadius:14, padding:14 }}>
              <Text style={styles.secTitle}>Seguridad y Confianza</Text>
              {seguridad.length>0 ? seguridad.map(s => (
                <View key={s} style={{ flexDirection:'row', alignItems:'flex-start', marginTop:6 }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#159447" style={{ marginRight:6, marginTop:2 }} />
                  <Text style={styles.secItem}>{s}</Text>
                </View>
              )) : <Text style={styles.emptyMini}>Sin información de seguridad</Text>}
            </View>
            <View style={styles.actionsRow}> 
              {(data.Lat || data.lat) && (data.Lng || data.lng) ? (
                <TouchableOpacity style={styles.outlineBtn} onPress={openMap}>
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
                <Text style={styles.primaryBtnText}>{saving? 'Guardando...' : 'Reservar Ahora'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>¿Necesitas ayuda? Llama al <Text style={{ color:'#0277bd' }}>+505 2222-3333</Text></Text>
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
  infoRow:{ flexDirection:'row', gap:14 },
  infoItem:{ flex:1, flexDirection:'row', alignItems:'flex-start' },
  iconCircle:{ width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  infoLabel:{ fontSize:11, fontFamily:'Montserrat-SemiBold', color:'#37474f' },
  infoValue:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#263238', marginTop:2 },
  rutasText:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#607d8b', marginTop:12 },
  sectionHead:{ fontSize:13, fontFamily:'Montserrat-SemiBold', color:'#01579b' },
  infoSubLabel:{ fontSize:11, fontFamily:'Montserrat-SemiBold', color:'#455a64' },
  infoSubValue:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#263238', marginTop:2 },
  chipsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:10 },
  payChip:{ backgroundColor:'#f1f5f8', paddingHorizontal:12, paddingVertical:6, borderRadius:14 },
  payChipText:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#01579b' },
  secTitle:{ fontSize:13, fontFamily:'Montserrat-Bold', color:'#0b593d' },
  secItem:{ fontSize:11.5, fontFamily:'Montserrat-Medium', color:'#2e463d' },
  actionsRow:{ flexDirection:'row', gap:14, marginTop:28 },
  outlineBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#0277bd', paddingVertical:12, borderRadius:10 },
  outlineBtnText:{ color:'#0277bd', fontSize:13, fontFamily:'Montserrat-SemiBold' },
  primaryBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#ff9800', paddingVertical:12, borderRadius:10 },
  primaryBtnText:{ color:'#fff', fontSize:13, fontFamily:'Montserrat-Bold' },
  helpText:{ textAlign:'center', fontSize:11, fontFamily:'Montserrat-Medium', color:'#607d8b', marginTop:16, marginBottom:4 }
});

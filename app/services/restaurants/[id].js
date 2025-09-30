import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { formatCordoba } from '../../../utils/format';

const USER_ID_PLACEHOLDER = 'anon'; 

export default function RestaurantDetailScreen(){
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const ref = doc(db, 'Restaurantes', String(id));
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
      await addDoc(collection(db,'Reservas'), {
        Titulo: data.Nombre || 'Restaurante',
        Tipo: 'Restaurante',
        Precio: data.PrecioMin || 0,
        Estado: 'pendiente',
        UsuarioId: USER_ID_PLACEHOLDER,
        FechaReserva: serverTimestamp(),
        RestauranteId: data.id,
      });
      Alert.alert('Reserva','Reserva creada correctamente');
    } catch (e) {
      Alert.alert('Error','No se pudo crear la reserva');
    } finally { setSaving(false); }
  };

  const llamar = () => {
    if(data?.Telefono){
      Linking.openURL(`tel:${data.Telefono}`);
    } else {
      Alert.alert('Teléfono','No disponible');
    }
  };

  // Secciones
  const especialidades = data?.Especialidades || [];
  const politicas = data?.Politicas || [];
  const seguridad = data?.Seguridad || [];
  const servicios = data?.Servicios || [];
  const metodos = data?.MetodosPago || [];
  const rangos = data?.RangosPrecios || {};
  const imagen = data?.ImagenURL || null;

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
            {imagen ? <Image source={{ uri: imagen }} style={styles.heroImg} /> : <View style={styles.heroImgPlaceholder}><MaterialCommunityIcons name="image" size={60} color="#b0bec5" /></View>}
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
              <View style={styles.badgeTipo}><Text style={styles.badgeTipoText}>{data.Categoria || 'Restaurante'}</Text></View>
              <Text style={styles.heroTitle}>{data.Nombre || 'Restaurante'}</Text>
              <Text style={styles.heroSub}>{data.Ubicacion || 'Ciudad'}</Text>
              <Text style={styles.heroPrice}>{formatCordoba(data.PrecioMin || 0)} - {formatCordoba(data.PrecioMax || 0)} <Text style={{ fontSize:12, color:'#fff' }}>por persona</Text></Text>
              {typeof data.Rating === 'number' && <View style={styles.ratingBadge}><MaterialCommunityIcons name="star" size={16} color="#ffeb3b" /><Text style={styles.ratingBadgeText}>{data.Rating.toFixed(1)}</Text></View>}
            </View>
          </View>
          <View style={{ paddingHorizontal:18, paddingTop:18 }}>
            {data.Descripcion && <Text style={styles.descText}>{data.Descripcion}</Text>}
            {/* Horarios y disponibilidad */}
            <View style={{ flexDirection:'row', gap:14, marginTop:12 }}>
              <View style={styles.infoItem}><MaterialCommunityIcons name="clock-outline" size={18} color="#43a047" style={{ marginRight:6 }} /><Text style={styles.infoLabel}>Horarios</Text><Text style={styles.infoValue}>{data.Horario || '--'}</Text></View>
              <View style={styles.infoItem}><MaterialCommunityIcons name="check-circle" size={18} color="#008c5a" style={{ marginRight:6 }} /><Text style={styles.infoLabel}>Disponibilidad</Text><Text style={styles.infoValue}>{data.Disponible ? 'Mesa disponible' : 'No disponible'}</Text></View>
            </View>
            {/* Especialidades */}
            {especialidades.length>0 && <View style={{ marginTop:18 }}>
              <Text style={styles.sectionHead}>Especialidades de la Casa</Text>
              {especialidades.map((es,i)=>(
                es && typeof es === 'object' && typeof es.nombre === 'string' ? (
                  <View key={es.nombre} style={styles.specCard}><Text style={styles.specTitle}>{es.nombre}</Text></View>
                ) : null
              ))}
            </View>}
            {/* Rangos de precios */}
            {rangos && Object.keys(rangos).length>0 && <View style={styles.rangosBox}>
              <Text style={styles.sectionHead}>Rangos de Precios</Text>
              {Object.entries(rangos).map(([k,v]) => (
                <Text key={k} style={styles.rangoItem}>
                  {k}: <Text style={styles.rangoValue}>{typeof v === 'object' && v !== null ? `${formatCordoba(v.min || v.Min || 0)} - ${formatCordoba(v.max || v.Max || 0)}` : String(v)}</Text>
                </Text>
              ))}
            </View>}
            {/* Políticas */}
            {politicas.length>0 && <View style={styles.politicasBox}>
              <Text style={styles.sectionHead}>Políticas del Restaurante</Text>
              {politicas.map((p,i)=>(<View key={i} style={styles.politicaItem}><MaterialCommunityIcons name="check-circle" size={16} color="#ff9800" style={{ marginRight:6 }} /><Text style={styles.politicaText}>{p}</Text></View>))}
            </View>}
            {/* Seguridad */}
            {seguridad.length>0 && <View style={styles.seguridadBox}>
              <Text style={styles.sectionHead}>Seguridad Alimentaria</Text>
              {seguridad.map((s,i)=>(<View key={i} style={styles.seguridadItem}><MaterialCommunityIcons name="shield-check" size={16} color="#43a047" style={{ marginRight:6 }} /><Text style={styles.seguridadText}>{s}</Text></View>))}
            </View>}
            {/* Servicios */}
            {servicios.length>0 && <View style={styles.serviciosBox}>
              <Text style={styles.sectionHead}>Ambiente y Servicios</Text>
              <View style={styles.chipsWrap}>{servicios.map((s,i)=>{
                if(typeof s === 'string') {
                  return <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>;
                } else if(s && typeof s === 'object' && typeof s.Nombre === 'string') {
                  return <View key={i} style={styles.chip}><Text style={styles.chipText}>{s.Nombre}</Text></View>;
                } else {
                  return null;
                }
              })}</View>
            </View>}
            {/* Métodos de pago */}
            {metodos.length>0 && <View style={styles.metodosBox}>
              <Text style={styles.sectionHead}>Métodos de Pago Aceptados</Text>
              <View style={styles.chipsWrap}>{metodos.map((m,i)=>(<View key={i} style={styles.chipAlt}><Text style={styles.chipAltText}>{m}</Text></View>))}</View>
            </View>}
            {/* Botones */}
            <View style={styles.actionsRow}> 
              <TouchableOpacity style={styles.outlineBtn} onPress={llamar}>
                <MaterialCommunityIcons name="phone" size={16} color="#008c5a" style={{ marginRight:6 }} />
                <Text style={styles.outlineBtnText}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={reservar} disabled={saving}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#fff" style={{ marginRight:6 }} />
                <Text style={styles.primaryBtnText}>{saving? 'Guardando...' : 'Reservar Mesa'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>¿Necesitas ayuda? Llama al <Text style={{ color:'#008c5a' }}>+505 2222-5555</Text></Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper:{ height:220, backgroundColor:'#000', borderBottomLeftRadius:24, borderBottomRightRadius:24, overflow:'hidden' },
  heroImg:{ width:'100%', height:'100%' },
  heroImgPlaceholder:{ width:'100%', height:'100%', alignItems:'center', justifyContent:'center', backgroundColor:'#eceff1' },
  heroOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.35)' },
  topBar:{ position:'absolute', top:16, left:14, right:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  roundBtn:{ backgroundColor:'rgba(0,0,0,0.45)', width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  heroTextBlock:{ position:'absolute', left:16, bottom:14, right:16 },
  badgeTipo:{ backgroundColor:'#43a047', alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, borderRadius:8, marginBottom:8 },
  badgeTipoText:{ color:'#fff', fontSize:11, fontFamily:'Montserrat-SemiBold' },
  heroTitle:{ color:'#fff', fontSize:20, fontFamily:'Montserrat-Bold' },
  heroSub:{ color:'#e0f7fa', fontSize:12, fontFamily:'Montserrat-Medium', marginTop:4 },
  heroPrice:{ color:'#ffeb3b', fontSize:16, fontFamily:'Montserrat-Bold', marginTop:8 },
  ratingBadge:{ flexDirection:'row', alignItems:'center', marginTop:6 },
  ratingBadgeText:{ color:'#ffeb3b', fontSize:13, fontFamily:'Montserrat-Bold', marginLeft:4 },
  descText:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#455a64', lineHeight:17 },
  infoItem:{ flex:1 },
  infoLabel:{ fontSize:11, fontFamily:'Montserrat-SemiBold', color:'#37474f' },
  infoValue:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#263238', marginTop:2 },
  sectionHead:{ fontSize:13, fontFamily:'Montserrat-SemiBold', color:'#43a047', marginBottom:6 },
  specCard:{ backgroundColor:'#e0f7fa', borderRadius:8, padding:10, marginBottom:6 },
  specTitle:{ color:'#008c5a', fontSize:13, fontFamily:'Montserrat-Bold' },
  rangosBox:{ backgroundColor:'#fff8e1', borderRadius:14, padding:14, marginTop:18 },
  rangoItem:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#b77800', marginBottom:4 },
  rangoValue:{ fontFamily:'Montserrat-Bold', color:'#c77800' },
  politicasBox:{ backgroundColor:'#fffde7', borderRadius:14, padding:14, marginTop:18 },
  politicaItem:{ flexDirection:'row', alignItems:'center', marginTop:6 },
  politicaText:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#b77800' },
  seguridadBox:{ backgroundColor:'#e8f5e9', borderRadius:14, padding:14, marginTop:18 },
  seguridadItem:{ flexDirection:'row', alignItems:'center', marginTop:6 },
  seguridadText:{ fontSize:12, fontFamily:'Montserrat-Medium', color:'#43a047' },
  serviciosBox:{ marginTop:18 },
  chipsWrap:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:10 },
  chip:{ backgroundColor:'#e0f7fa', paddingHorizontal:12, paddingVertical:6, borderRadius:14 },
  chipText:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#008c5a' },
  metodosBox:{ marginTop:18 },
  chipAlt:{ backgroundColor:'#e3f2fd', paddingHorizontal:12, paddingVertical:6, borderRadius:14 },
  chipAltText:{ fontSize:11, fontFamily:'Montserrat-Medium', color:'#01579b' },
  actionsRow:{ flexDirection:'row', gap:14, marginTop:28 },
  outlineBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#008c5a', paddingVertical:12, borderRadius:10 },
  outlineBtnText:{ color:'#008c5a', fontSize:13, fontFamily:'Montserrat-SemiBold' },
  primaryBtn:{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#ff9800', paddingVertical:12, borderRadius:10 },
  primaryBtnText:{ color:'#fff', fontSize:13, fontFamily:'Montserrat-Bold' },
  helpText:{ textAlign:'center', fontSize:11, fontFamily:'Montserrat-Medium', color:'#607d8b', marginTop:16, marginBottom:4 }
});

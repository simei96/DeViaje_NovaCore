import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Dimensions, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../../firebaseConfig';

export default function PromotionDetails() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const ref = doc(db, 'Promociones', id);
        const snap = await getDoc(ref);
        if (snap.exists()) setPromo(snap.data());
      } catch (e) {
        console.error('Error loading promotion', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const windowWidth = Dimensions.get('window').width;
  const carouselWidth = windowWidth;

  useEffect(() => {
    if (!promo) return;
    const imgs = Array.isArray(promo.Images) ? promo.Images : Array.isArray(promo.Imagenes) ? promo.Imagenes : Array.isArray(promo.Gallery) ? promo.Gallery : Array.isArray(promo.Galeria) ? promo.Galeria : (promo.ImagenURLs || promo.ImageURLs || []);
    const realImgs = (imgs && imgs.length) ? imgs : (promo.ImagenURL || promo.ImageURL ? [promo.ImagenURL || promo.ImageURL] : []);
    if (!realImgs || realImgs.length <= 1) return;
    const idInterval = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % realImgs.length;
        if (scrollRef.current && scrollRef.current.scrollTo) {
          scrollRef.current.scrollTo({ x: next * carouselWidth, animated: true });
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(idInterval);
  }, [promo]);

  

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!promo) return <View style={styles.center}><Text>No se encontró la promoción.</Text></View>;
  const title = promo.Titulo || promo.Nombre || 'Promoción';
  const desc = promo.Descripcion || promo.DescripcionCorta || promo.descripcion || '';
  const price = promo.Precio || promo.Price || null;
  const duration = promo.Duracion || promo.Tiempo || promo.DuracionHoras || '3 horas';
  const includes = promo.Incluye || promo.incluye || promo.queIncluye || ['Guía experto incluido', 'Transporte desde hotel', 'Fotografía profesional', 'Refrigerios incluidos'];
  const important = promo.InformacionImportante || promo.info || promo.infoImportante || { horarios: 'Lunes a domingo: 8:00 AM y 2:00 PM', grupo: '4 personas (máximo 15)' };
  const category = promo.Categoria || promo.categoria || 'Cultural';
  const rating = promo.Rating || promo.RatingValue || 4.8;
  const reviews = promo.Reviews || promo.Reseñas || 324;
  const startDateStr = promo.FechaInicio || promo.FechaDesde || promo.Inicio || promo.fechaInicio || promo.startDate;
  const endDateStr = promo.FechaFin || promo.FechaHasta || promo.Fin || promo.fechaFin || promo.endDate;
  const parseDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const parts = String(s).split('-');
    if (parts.length === 3) {
      const [y, m, dd] = parts.map(p => parseInt(p, 10));
      return new Date(y, m - 1, dd);
    }
    return null;
  };
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  const provider = promo.OfrecidoPor || promo.Proveedor || promo.Local || promo.Organizador || 'Agencia DeViaje (Ejemplo)';
  const images = Array.isArray(promo.Images) ? promo.Images : Array.isArray(promo.Imagenes) ? promo.Imagenes : Array.isArray(promo.Gallery) ? promo.Gallery : Array.isArray(promo.Galeria) ? promo.Galeria : (promo.ImagenURLs || promo.ImageURLs || []);
  if ((!images || images.length === 0) && (promo.ImagenURL || promo.ImageURL)) {
    images.push(promo.ImagenURL || promo.ImageURL);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
  <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 0, paddingBottom: 24 }}>
        {images && images.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={scrollRef}
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const idx = Math.round(x / carouselWidth);
                setActiveIdx(idx);
              }}
            >
              {images.map((uri, i) => (
                <View key={i} style={{ width: carouselWidth }}>
                  <Image source={{ uri }} style={[styles.image, { width: '100%', marginHorizontal: 0, marginTop: -24 }]} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
              {images.map((_, i) => (
                <View key={i} style={{ width: i === activeIdx ? 14 : 8, height: 8, borderRadius: 4, backgroundColor: i === activeIdx ? '#283593' : '#c5cae9', marginHorizontal: 4 }} />
              ))}
            </View>
          </View>
        ) : null}

  <View style={styles.cardInner}>
    <Text style={[styles.title, { fontFamily: 'Montserrat-Bold' }]}>{title}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={styles.categoryBadge}><Text style={styles.categoryText}>{category}</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
              <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
              <Text style={{ marginLeft: 6, fontWeight: '700' }}>{rating} <Text style={{ color: '#888', fontWeight: '400' }}>({reviews})</Text></Text>
            </View>
          </View>

          <Text style={{ marginTop: 6, color: '#666', fontSize: 13, fontFamily: 'Montserrat-Regular' }}>Ofrecido por: {provider}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#1976d2" />
            <Text style={{ marginLeft: 8, color: '#444', fontFamily: 'Montserrat-Regular' }}>{duration}</Text>
          </View>

          <Text style={[styles.desc, { marginTop: 12, fontFamily: 'Montserrat-Regular' }]}>{desc}</Text>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>¿Qué incluye?</Text>
            <View style={styles.includesGrid}>
              {Array.isArray(includes) ? includes.map((it, idx) => (
                <View key={idx} style={styles.includeItem}>
                  <View style={styles.includeDot} />
                  <Text style={styles.includeText}>{it}</Text>
                </View>
              )) : null}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat-Bold' }]}>Información importante</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#1976d2" />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.infoTitle, { fontFamily: 'Montserrat-Bold' }]}>Horarios de salida</Text>
                <Text style={[styles.infoText, { fontFamily: 'Montserrat-Regular' }]}>{important.horarios}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-group" size={18} color="#31ad4b" />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.infoTitle, { fontFamily: 'Montserrat-Bold' }]}>Grupo mínimo</Text>
                <Text style={[styles.infoText, { fontFamily: 'Montserrat-Regular' }]}>{important.grupo}</Text>
              </View>
            </View>
          </View>

          
          <View style={{ marginTop: 18 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 12, fontFamily: 'Montserrat-Bold' }]}>¿Tienes preguntas?</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.contactBtn, { marginRight: 12 }]} onPress={() => Linking.openURL(`tel:${promo.Telefono || '+50512345678'}`)}>
                <MaterialCommunityIcons name="phone" size={18} color="#1976d2" />
                <Text style={{ color: '#1976d2', marginLeft: 8, fontFamily: 'Montserrat-Medium' }}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactBtn, styles.contactBtnWhats]} onPress={() => Linking.openURL(`https://wa.me/${promo.Whatsapp || '50512345678'}`)}>
                <MaterialCommunityIcons name="whatsapp" size={18} color="#2e7d32" />
                <Text style={{ color: '#2e7d32', marginLeft: 8, fontFamily: 'Montserrat-Medium' }}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 12, borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', backgroundColor: '#fff' }}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            const address = promo.Direccion || promo.DireccionCompleta || promo.address;
            const lat = promo.Latitud || promo.lat || promo.latitude;
            const lng = promo.Longitud || promo.lng || promo.longitude;
            let url = null;
            if (address) {
              const q = encodeURIComponent(address);
              url = Platform.OS === 'ios' ? `maps://?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
            } else if (lat && lng) {
              url = Platform.OS === 'ios' ? `http://maps.apple.com/?ll=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}`;
            }
            if (url) Linking.openURL(url).catch(e => console.warn('Could not open maps', e));
          }}
        >
          <MaterialCommunityIcons name="map-marker" size={16} color="#1976d2" />
          <Text style={{ color: '#1976d2', marginLeft: 8, fontFamily: 'Montserrat-Medium' }}>Ver en Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn, { marginLeft: 12 }]} onPress={() => router.push(`/promotions/${id}/reserve`)}>
          <Text style={{ color: '#fff', fontWeight: '700', fontFamily: 'Montserrat-Bold' }}>Reservar ahora</Text>
        </TouchableOpacity>
      </View>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 440, borderRadius: 0, marginBottom: 0 },
  carouselContainer: { overflow: 'hidden' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  mapBtnText: { marginLeft: 8, color: '#1976d2', fontFamily: 'Montserrat-Medium' },
  badge: { backgroundColor: '#ffcc00', padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  desc: { fontSize: 14, marginBottom: 8 },
  meta: { color: '#666', marginBottom: 6 },
  cardInner: {
    backgroundColor: '#fff',
  marginTop: -120,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  sectionTitle: {
    color: '#1976d2',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  includesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  includeItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  includeDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    marginRight: 8,
  },
  includeText: {
    color: '#444',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontWeight: '700',
  },
  infoText: {
    color: '#666',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#FFD400',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: '#fff',
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#1976d2',
    fontWeight: '700',
    fontSize: 12,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: '#fff',
  },
  contactBtnWhats: {
    borderColor: '#2e7d32',
  },
});

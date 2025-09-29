import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { db } from '../../../firebaseConfig';

const FILTERS = [
  { label: 'Todos', color: '#1976d2' },
  { label: 'Cultural', color: '#039be5' },
  { label: 'Aventura', color: '#ffb300' },
  { label: 'Ecoturismo', color: '#43a047' },
];
const PLACES = [
  {
    name: 'Catedral de Granada',
    type: 'Cultural',
    desc: 'Hermosa catedral colonial en el corazón de Granada',
    rating: 4.8,
    distance: '0.5 km',
    lat: 11.92844,
    lng: -85.95513,
  },
  {
    name: 'Volcán Masaya',
    type: 'Aventura',
    desc: 'Volcán activo con cráter visible de lava',
    rating: 4.9,
    distance: '25 km',
    lat: 11.9843,
    lng: -86.1610,
  },
  {
    name: 'Reserva Natural Laguna de Apoyo',
    type: 'Ecoturismo',
    desc: 'Laguna volcánica rodeada de naturaleza',
    rating: 4.7,
    distance: '12 km',
    lat: 11.9224,
    lng: -86.0540,
  },
];

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const mapRef = useRef(null);
  useEffect(() => {
    const ref = collection(db, 'Lugares');
    const unsub = onSnapshot(ref, (snap) => {
      try {
        const mapped = snap.docs.map(d => {
          const v = d.data();
            const rawLat = v.Lat ?? v.lat;
            const rawLng = v.Lng ?? v.lng;
            const latNum = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat);
            const lngNum = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng);
          return {
            id: d.id,
            name: v.Nombre || v.name || 'Sin nombre',
            type: v.Tipo || v.type || 'Otro',
            desc: v.Descripcion || v.desc || '',
            rating: typeof v.Rating === 'number' ? v.Rating : (typeof v.rating === 'number' ? v.rating : 0),
            distance: v.Distancia || v.distance || '',
            lat: !isNaN(latNum) ? latNum : undefined,
            lng: !isNaN(lngNum) ? lngNum : undefined,
          };
        });
        const valid = mapped.filter(m => typeof m.lat === 'number' && typeof m.lng === 'number');
        setLugares(valid);
      } catch (e) {
        console.error('Error procesando snapshot Lugares:', e);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Snapshot Lugares falló:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  const sourcePlaces = lugares.length ? lugares : PLACES;

  const filteredPlaces = sourcePlaces.filter(
    p => (activeFilter === 'Todos' || p.type === activeFilter) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const goToPlace = (p) => {
    if (!mapRef.current || !p.lat || !p.lng) return;
    setSelectedPlace(p);
    mapRef.current.animateCamera({
      center: { latitude: p.lat, longitude: p.lng },
      pitch: 55,
      heading: 45,
      zoom: 14,
    }, { duration: 1200 });
  };

  const initialRegion = {
    latitude: filteredPlaces[0]?.lat || 12.1364, 
    longitude: filteredPlaces[0]?.lng || -86.2514,
    latitudeDelta: 1,
    longitudeDelta: 1,
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permiso de ubicación denegado');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        if (mapRef.current) {
          mapRef.current.animateCamera({ center: coords, zoom: 12, pitch: 40 }, { duration: 1200 });
        }
      } catch (e) {
        console.error('Location error:', e);
      }
    })();
  }, []);
  const fetchRoute = async () => {
    if (!userLocation || !selectedPlace) return;
    try {
      setRouteLoading(true);
      setRouteCoords([]);
      const from = `${userLocation.longitude},${userLocation.latitude}`;
      const to = `${selectedPlace.lng},${selectedPlace.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.routes?.[0]?.geometry?.coordinates) {
        const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
        if (coords.length && mapRef.current) {
          mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, bottom: 60, left: 40, right: 40 }, animated: true });
        }
      }
    } catch (e) {
      console.error('Error obteniendo ruta:', e);
    } finally {
      setRouteLoading(false);
    }
  };

  const openExternalNavigation = () => {
    if (!selectedPlace) return;
    const scheme = Platform.select({ ios: 'maps://app', android: 'geo:' });
    if (Platform.OS === 'ios') {
      const url = `${scheme}?daddr=${selectedPlace.lat},${selectedPlace.lng}`;
      Linking.openURL(url);
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Mapa</Text>
        <Text style={styles.subtitle}>Explora lugares cercanos</Text>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#1976d2" style={styles.locationIcon} />
            <Text style={styles.locationText}>Tu ubicación actual</Text>
            <Text style={styles.locationCity}>Managua, Nicaragua</Text>
          </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar lugares..."
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.label}
              style={[styles.filterBtn, activeFilter === f.label && { backgroundColor: f.color }]}
              onPress={() => setActiveFilter(f.label)}
            >
              <Text style={[styles.filterText, activeFilter === f.label && { color: '#fff' }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            pitchEnabled
            rotateEnabled
            showsCompass
            toolbarEnabled={false}
          >
            {userLocation && (
              <Marker coordinate={userLocation} title="Tu ubicación" pinColor="#1a237e" />
            )}
            {filteredPlaces.filter(p => p.lat && p.lng).map(p => {
              let pinColor = '#1976d2';
              if (p.type?.toLowerCase().includes('cultural')) pinColor = '#039be5';
              else if (p.type?.toLowerCase().includes('avent')) pinColor = '#ffb300';
              else if (p.type?.toLowerCase().includes('eco')) pinColor = '#43a047';
              return (
                <Marker
                  key={p.id || p.name}
                  coordinate={{ latitude: p.lat, longitude: p.lng }}
                  title={p.name}
                  description={p.desc}
                  pinColor={pinColor}
                  onPress={() => { setSelectedPlace(p); }}
                />
              );
            })}
            {routeCoords.length > 1 && (
              <Polyline coordinates={routeCoords} strokeColor="#283593" strokeWidth={4} />
            )}
          </MapView>
          {loading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="small" color="#1976d2" />
              <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
            </View>
          )}
          {selectedPlace && (
            <View style={styles.directionsPanel}>
              <Text style={styles.directionsTitle}>{selectedPlace.name}</Text>
              <View style={styles.directionsBtnsRow}>
                <TouchableOpacity style={styles.dirBtn} onPress={fetchRoute} disabled={routeLoading}>
                  <MaterialCommunityIcons name="route" size={18} color="#fff" />
                  <Text style={styles.dirBtnText}>{routeLoading ? 'Calculando...' : 'Ruta'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dirBtn, { backgroundColor:'#455a64' }]} onPress={openExternalNavigation}>
                  <MaterialCommunityIcons name="navigation-variant" size={18} color="#fff" />
                  <Text style={styles.dirBtnText}>Abrir Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dirBtn, { backgroundColor:'#9e9e9e' }]} onPress={() => { setSelectedPlace(null); setRouteCoords([]); }}>
                  <MaterialCommunityIcons name="close" size={18} color="#fff" />
                  <Text style={styles.dirBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Lugares cercanos ({filteredPlaces.length})</Text>
        {filteredPlaces.map((p, idx) => (
          <TouchableOpacity key={idx} style={styles.placeCard} activeOpacity={0.85} onPress={() => goToPlace(p)}>
            <View style={styles.placeRow}>
              <Text style={styles.placeName}>{p.name}</Text>
              <Text style={[styles.placeType, styles[`type${p.type}`]]}>{p.type}</Text>
            </View>
            <Text style={styles.placeDesc}>{p.desc}</Text>
            <View style={styles.placeInfoRow}>
           <MaterialCommunityIcons name="star" size={14} color="#FFD700" style={{ marginRight: 2 }} />
           <Text style={styles.placeStar}>{p.rating}</Text>
           <MaterialCommunityIcons name="map-marker-distance" size={14} color="#888" style={{ marginLeft: 10, marginRight: 2 }} />
           <Text style={styles.placeDist}>{p.distance}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fafd' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginTop: 18, marginLeft: 18 },
  subtitle: { fontSize: 15, color: '#222', marginLeft: 18, marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 18, padding: 10, marginBottom: 8, elevation: 1 },
  locationIcon: { fontSize: 18, marginRight: 6 },
  locationText: { fontWeight: 'bold', color: '#222', marginRight: 8 },
  locationCity: { color: '#888', fontSize: 13 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 18, padding: 10, fontSize: 15, marginBottom: 8, borderWidth: 1, borderColor: '#e0e3ea' },
  filterRow: { flexDirection: 'row', gap: 8, marginHorizontal: 18, marginBottom: 8 },
  filterBtn: { backgroundColor: '#e0e3ea', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  filterText: { fontSize: 14, color: '#1976d2', fontWeight: 'bold' },
  mapWrapper: { height: 340, borderRadius: 16, overflow: 'hidden', marginHorizontal: 18, marginBottom: 24, backgroundColor: '#eaf2fb' },
  map: { flex: 1 },
  mapLoadingOverlay: { position: 'absolute', top:0, left:0, right:0, bottom:0, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.55)' },
  mapLoadingText: { marginTop: 6, color:'#1976d2', fontSize:12, fontWeight:'600' },
  directionsPanel: { position:'absolute', bottom:10, left:10, right:10, backgroundColor:'#fff', borderRadius:14, padding:12, elevation:3, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8, shadowOffset:{width:0,height:2} },
  directionsTitle: { fontSize:14, fontWeight:'bold', color:'#283593', marginBottom:8 },
  directionsBtnsRow: { flexDirection:'row', justifyContent:'space-between' },
  dirBtn: { flex:1, flexDirection:'row', backgroundColor:'#283593', marginHorizontal:4, paddingVertical:8, borderRadius:10, alignItems:'center', justifyContent:'center', gap:6 },
  dirBtnText: { color:'#fff', fontSize:12, fontWeight:'600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginLeft: 18, marginTop: 8, marginBottom: 8 },
  placeCard: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 18, marginBottom: 10, padding: 14, elevation: 1 },
  placeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  placeName: { fontWeight: 'bold', fontSize: 15, color: '#222', flex: 1 },
  placeType: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  typeCultural: { backgroundColor: '#039be5', color: '#fff' },
  typeAventura: { backgroundColor: '#ffb300', color: '#fff' },
  typeEcoturismo: { backgroundColor: '#43a047', color: '#fff' },
  placeDesc: { color: '#888', fontSize: 13, marginBottom: 6 },
  placeInfoRow: { flexDirection: 'row', gap: 12 },
  placeStar: { color: '#1976d2', fontWeight: 'bold', fontSize: 13 },
  placeDist: { color: '#888', fontSize: 13 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e3ea', paddingVertical: 6, justifyContent: 'space-around', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabBtn: { alignItems: 'center', flex: 1 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11, color: '#1976d2', fontWeight: 'bold' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1976d2' },
});
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  },
  {
    name: 'Volcán Masaya',
    type: 'Aventura',
    desc: 'Volcán activo con cráter visible de lava',
    rating: 4.9,
    distance: '25 km',
  },
  {
    name: 'Reserva Natural Laguna de Apoyo',
    type: 'Ecoturismo',
    desc: 'Laguna volcánica rodeada de naturaleza',
    rating: 4.7,
    distance: '12 km',
  },
];

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filteredPlaces = PLACES.filter(
    p => (activeFilter === 'Todos' || p.type === activeFilter) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Mapa</Text>
        <Text style={styles.subtitle}>Explora lugares cercanos</Text>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#1976d2" style={styles.locationIcon} />
            <Text style={styles.locationText}>Tu ubicación actual</Text>
            <Text style={styles.locationCity}>Granada, Nicaragua</Text>
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

        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>Mapa Interactivo</Text>
          <Text style={styles.mapDesc}>Vista de Granada y alrededores</Text>
          <View style={styles.mapFiltersRow}>
          <MaterialCommunityIcons name="map" size={32} color="#1976d2" style={styles.mapIcon} />
          <MaterialCommunityIcons name="map-marker" size={22} color="#1976d2" style={styles.mapFilterIcon} />
          <MaterialCommunityIcons name="pine-tree" size={22} color="#ffb300" style={styles.mapFilterIcon} />
          <MaterialCommunityIcons name="leaf" size={22} color="#43a047" style={styles.mapFilterIcon} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Lugares cercanos ({filteredPlaces.length})</Text>
        {filteredPlaces.map((p, idx) => (
          <View key={idx} style={styles.placeCard}>
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
          </View>
        ))}
      </ScrollView>
      {/* Barra inferior eliminada por solicitud */}
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
  mapCard: { backgroundColor: '#eaf2fb', borderRadius: 16, marginHorizontal: 18, padding: 32, alignItems: 'center', marginBottom: 24, minHeight: 340, width: '85%', alignSelf: 'center' },
  mapIcon: { fontSize: 32, marginBottom: 6 },
  mapTitle: { fontWeight: 'bold', fontSize: 16, color: '#1976d2', marginBottom: 2 },
  mapDesc: { color: '#888', fontSize: 13, marginBottom: 8 },
  mapFiltersRow: { flexDirection: 'row', gap: 12 },
  mapFilterIcon: { fontSize: 22, marginHorizontal: 4 },
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
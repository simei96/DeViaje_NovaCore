import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Recuerda: aquí están los datos de ejemplo de reservas. Cambiar por datos reales de la API cuando estén listos.
const RESERVAS = [
  {
    id: 'NT-2024-001',
  titulo: 'Cerro Negro',
    tipo: 'Paquete',
    estado: 'Confirmada',
    fecha: '14 sept',
    lugar: 'León',
    personas: 2,
    precio: 3000,
    imagen: require('../../assets/images/imagen_de_prueba.jpg'),
  },
  {
    id: 'NT-2024-002',
    titulo: 'Playas del Pacífico',
    tipo: 'Paquete',
    estado: 'Pendiente',
    fecha: '24 sept',
    lugar: 'San Juan del Sur',
    personas: 2,
    precio: 2400,
    imagen: require('../../assets/images/imagen_de_prueba.jpg'),
  },
  {
    id: 'NT-2024-004',
    titulo: 'Hotel Casa Colonial',
    tipo: 'Hospedaje',
    estado: 'Confirmada',
    fecha: '04 oct',
    lugar: 'Granada',
    personas: 2,
    precio: 1500,
    imagen: require('../../assets/images/imagen_de_prueba.jpg'),
  },
];

// Recuerda: si agrego más tipos de reservas, también debo agregarlos aquí en los filtros.
const FILTROS = [
  { label: 'Todas', value: 'Todas' },
  { label: 'Paquetes', value: 'Paquete' },
  { label: 'Transporte', value: 'Transporte' },
  { label: 'Hospedaje', value: 'Hospedaje' },
];

// Recuerda: aquí se arma toda la pantalla de reservas. Si quiero cambiar el layout general, hacerlo aquí.
export default function ReservationsScreen() {
  // Recuerda: aquí guardo el filtro seleccionado
  const [filtro, setFiltro] = useState('Todas');
  // Recuerda: aquí guardo el texto de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Recuerda: aquí filtro las reservas según el filtro y la búsqueda. Si la búsqueda falla, revisar este filtro.
  const reservasFiltradas = RESERVAS.filter(r =>
    (filtro === 'Todas' || r.tipo === filtro) &&
    (r.titulo.toLowerCase().includes(busqueda.toLowerCase()) || r.lugar.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Recuerda: aquí se dibuja cada card de reserva. Si quiero cambiar el diseño de la card, hacerlo aquí.
  const renderReserva = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={item.imagen} style={styles.imagen} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <View style={[styles.estado, item.estado === 'Confirmada' ? styles.estadoConfirmada : styles.estadoPendiente, { minWidth: 48, minHeight: 20, paddingHorizontal: 6, paddingVertical: 2 }] }>
              <Text style={[styles.estadoTexto, item.estado === 'Confirmada' ? { color: '#219653' } : { color: '#B49B0E' }, { fontSize: 11, fontWeight: 'bold' }]}>{item.estado}</Text>
            </View>
          </View>
          <Text style={styles.tipo}>{item.tipo === 'Paquete' ? 'Paquete Turístico' : item.tipo}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{item.fecha}</Text>
            <Text style={styles.infoText}>• {item.lugar}</Text>
            <Text style={styles.infoText}>• {item.personas}</Text>
          </View>
          <Text style={styles.precio}>C$ {item.precio}</Text>
          <Text style={styles.codigo}>#{item.id}</Text>
        </View>
      </View>
    </View>
  );

  // Recuerda: aquí está el render principal de la pantalla. Si algo se ve raro en la UI, revisar aquí primero.
  return (
    <View style={styles.container}>
  {/* Recuerda: este es el header principal "Mis Reservas" */}
      <Text style={styles.tituloPrincipal}>Mis Reservas</Text>
  {/* Recuerda: este espacio es para separar el header del resto */}
      <View style={{ height: 16 }} />
  {/* Recuerda: aquí está la barra de búsqueda. Cambiar placeholder o estilos aquí. */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Buscar reservas..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>
  {/* Recuerda: estos son los filtros deslizables. Si agrego más filtros, revisar el array FILTROS arriba. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosRow}
      >
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filtroBtn, filtro === f.value && styles.filtroBtnActivo]}
            onPress={() => setFiltro(f.value)}
          >
            <Text style={[styles.filtroText, filtro === f.value && styles.filtroTextActivo]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
  {/* Recuerda: aquí se muestra la cantidad de reservas encontradas. */}
      <Text style={styles.cantidad}>{reservasFiltradas.length} reservas</Text>
  {/* Recuerda: aquí se muestra la lista de reservas. Si la lista no aparece, revisar FlatList y renderReserva. */}
      <FlatList
        data={reservasFiltradas}
        keyExtractor={item => item.id}
        renderItem={renderReserva}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No hay reservas</Text>}
      />
    </View>
  );
}

// Recuerda: aquí están todos los estilos de la pantalla de reservas. Cambiar colores, márgenes, etc. aquí.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingTop: 16,
  },
  tituloPrincipal: {
    fontSize: 20,
  fontFamily:'Montserrat-Bold',
    color: '#1a237e',
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  iconoFotoBox: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 1,
    opacity: 0.85,
  },
  searchBox: {
    backgroundColor: '#f6fafd',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  input: {
    fontSize: 15,
    color: '#222',
    padding: 0,
    backgroundColor: 'transparent',
  },
  filtrosRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filtroBtn: {
    backgroundColor: '#f6fafd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 6,
  },
  filtroBtnActivo: {
    backgroundColor: '#1a237e',
  },
  filtroText: {
    color: '#1a237e',
    fontWeight: '500',
  },
  filtroTextActivo: {
    color: '#fff',
  },
  cantidad: {
    fontSize: 13,
    color: '#888',
    marginLeft: 20,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imagen: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 6,
  },
  titulo: {
    fontSize: 15,
  fontFamily:'Montserrat-SemiBold',
    color: '#222',
  },
  tipo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#444',
    marginRight: 6,
  },
  precio: {
    fontSize: 15,
  fontFamily:'Montserrat-SemiBold',
    color: '#0ba4e0',
    marginTop: 2,
  },
  codigo: {
    fontSize: 11,
    color: '#bdbdbd',
    marginTop: 2,
    alignSelf: 'flex-end',
    marginLeft: 8,
  },
  iconoFotoBox: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 1,
    opacity: 0.85,
  },
  estado: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 60,
    minHeight: 20,
  },
  estadoConfirmada: {
    backgroundColor: '#eafaf1',
    borderColor: '#219653',
    borderWidth: 1,
  },
  estadoPendiente: {
    backgroundColor: '#fffbe6',
    borderColor: '#B49B0E',
    borderWidth: 1,
  },
  estadoTexto: {
    fontSize: 12,
  fontFamily:'Montserrat-SemiBold',
    textAlign: 'center',
  },
});
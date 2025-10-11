import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebaseConfig';

const RESERVA_IMG = require('../../assets/images/imagen_de_prueba.jpg');

const FILTROS = [
  { label: 'Todas', value: 'Todas' },
  { label: 'Paquetes', value: 'Paquete' },
  { label: 'Transporte', value: 'Transporte' },
  { label: 'Hospedaje', value: 'Hospedaje' },
];

export default function ReservationsScreen() {
  const [filtro, setFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const reservasRef = collection(db, 'Reservas');
    const qLegacy = query(reservasRef, where('UsuarioId', '==', userId));
    const qNew = query(reservasRef, where('userId', '==', userId));

    let snapLegacy = [];
    let snapNew = [];

    const combineAndSet = () => {
      const map = new Map();
      [...snapLegacy, ...snapNew].forEach(d => map.set(d.id, d));
      const merged = Array.from(map.values()).map(docItem => {
        const d = docItem.data();
        const titulo = d.Titulo || d.title || d.titulo || d.nombre || 'Reserva';
        const tipo = d.Tipo || d.tipo || d.Type || 'Paquete';
        const estado = d.Estado || d.status || d.estado || 'Pendiente';
        let fecha = '';
        if (d.FechaReserva && d.FechaReserva.toDate) fecha = d.FechaReserva.toDate().toLocaleDateString();
        else if (d.reserveDate && typeof d.reserveDate === 'string') fecha = d.reserveDate.split(' ')[0];
        else if (d.reserveDate && d.reserveDate.toDate) fecha = d.reserveDate.toDate().toLocaleDateString();
        const lugar = d.Lugar || d.lugar || d.place || '';
        const personas = d.Adultos || d.Personas || d.personas || 1;
        const precio = d.Precio || d.price || 0;
        return {
          id: docItem.id,
          titulo,
          tipo,
          estado,
          fecha,
          lugar,
          personas,
          precio,
          imagen: RESERVA_IMG,
        };
      });
      setReservas(merged);
    };

    const unsubLegacy = onSnapshot(qLegacy, (snapshot) => {
      snapLegacy = snapshot.docs;
      combineAndSet();
    });
    const unsubNew = onSnapshot(qNew, (snapshot) => {
      snapNew = snapshot.docs;
      combineAndSet();
    });

    return () => { unsubLegacy(); unsubNew(); };
  }, []);

  const reservasFiltradas = reservas.filter(r =>
    (filtro === 'Todas' || r.tipo === filtro) &&
    (r.titulo.toLowerCase().includes(busqueda.toLowerCase()) || r.lugar.toLowerCase().includes(busqueda.toLowerCase()))
  );
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

  return (
    <View style={styles.container}>
      <Text style={styles.tituloPrincipal}>Mis Reservas</Text>
      <View style={{ height: 16 }} />
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Buscar reservas..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>
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
      <Text style={styles.cantidad}>{reservasFiltradas.length} reservas</Text>
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
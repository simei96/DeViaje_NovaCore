import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const RESERVA_IMG = { uri: 'https://via.placeholder.com/800x600.png?text=Reserva' };

// Filtros removidos — la pantalla ahora filtra solo por búsqueda y muestra todas las reservas del usuario
const FILTROS = ['Todas', 'Confirmada', 'Pendiente', 'Cancelada'];

export default function ReservationsScreen() {
  // filtro removido
  const [busqueda, setBusqueda] = useState('');
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [userId, setUserId] = useState(auth.currentUser?.uid || null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubAuth();
  }, []);

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
          _docSnapshot: docItem,
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
  }, [userId]);

  const reservasFiltradas = reservas.filter(r => {
    const matchesSearch = (r.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) || (r.lugar || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchesFiltro = filtro === 'Todas' || (r.estado && r.estado === filtro);
    return matchesSearch && matchesFiltro;
  });
  const openReserva = (item) => {
    setSelectedReserva(item);
    setShowModal(true);
  };

  const renderReserva = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openReserva(item)} activeOpacity={0.85}>
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
    </TouchableOpacity>
  );

  const verifyPayment = async (reserva) => {
    if (!reserva || !reserva.id) return;
    setVerifying(true);
    try {
      const reservaDoc = doc(db, 'Reservas', reserva.id);
      await updateDoc(reservaDoc, { Estado: 'Confirmada', PagoVerificado: true });
      setReservas(prev => prev.map(r => r.id === reserva.id ? { ...r, estado: 'Confirmada' } : r));
      setSelectedReserva(prev => prev && prev.id === reserva.id ? { ...prev, estado: 'Confirmada' } : prev);
      Alert.alert('Pago verificado', 'El pago fue marcado como verificado.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo verificar el pago: ' + (e.message || String(e)));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow,{paddingHorizontal:8}]}> 
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="calendar-check" size={28} color="#222" style={{ marginRight: 8 }} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.tituloPrincipalLeft}>Mis Reservas</Text>
            <Text style={styles.subtitulo}>Historial de reservas a futuro</Text>
          </View>
        </View>
      </View>
      <View style={{ height: 1 }} />

      {/* Filtros removidos: la pantalla ya no muestra pildoras de filtro */}

      <View style={styles.searchRow}>
        <View style={styles.searchIconOutside}>
          <MaterialCommunityIcons name="magnify" size={20} color="#888" />
        </View>
        <View style={styles.searchBoxSlim}>
          <TextInput
            style={[styles.inputExpanded, { flex: 1 }]}
            placeholder="Buscar reservas..."
            value={busqueda}
            onChangeText={setBusqueda}
            returnKeyType="search"
            underlineColorAndroid="transparent"
          />
        </View>
        <View style={styles.countBoxInline}>
          <Text style={styles.countText}>{reservasFiltradas.length}</Text>
        </View>
      </View>

      <View style={styles.filtrosWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
          {FILTROS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroPildora, filtro === f && styles.filtroPildoraActivo]}
              onPress={() => setFiltro(f)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filtroPildoraText, filtro === f && styles.filtroPildoraTextActivo]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!userId ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyCount}>0 reservas</Text>
          <Text style={styles.emptyText}>Inicia sesión para ver tus reservas</Text>
        </View>
      ) : reservasFiltradas.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyCount}>0 reservas</Text>
          <Text style={styles.emptyText}>No hay reservas</Text>
        </View>
      ) : (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={item => item.id}
          renderItem={renderReserva}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedReserva ? (
              <>
                <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
                  <Text style={styles.modalTitle}>{selectedReserva.titulo}</Text>
                  <Text style={[styles.estadoTexto, selectedReserva.estado === 'Confirmada' ? styles.estadoConfirmada : styles.estadoPendiente]}>{selectedReserva.estado}</Text>
                </View>
                <Text style={styles.modalSub}>{selectedReserva.tipo} • {selectedReserva.fecha}</Text>
                <View style={{ height:12 }} />
                <Text style={styles.modalLine}>Lugar: {selectedReserva.lugar}</Text>
                <Text style={styles.modalLine}>Personas: {selectedReserva.personas}</Text>
                <Text style={[styles.modalLine, { fontWeight:'700', marginTop:8 }]}>C$ {selectedReserva.precio}</Text>
                <View style={{ height:12 }} />
                <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:8 }}>
                  <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalBtnNeutral}>
                    <Text style={styles.modalBtnNeutralText}>Cerrar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => verifyPayment(selectedReserva)} style={styles.modalBtnPrimary}>
                    {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnPrimaryText}>Verificar pago</Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingTop: 2,
  },
  tituloPrincipal: {
    fontSize: 20,
  fontFamily:'Montserrat-Bold',
    color: '#1a237e',
    marginTop: 2,
    marginBottom: 8,
  },
  headerRow: { paddingHorizontal: 0, paddingVertical: 6, alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', marginLeft: -110, marginTop: 18 },
  tituloPrincipalLeft: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#222' },
  headerTextWrap: { flexDirection: 'column' },
  subtitulo: { color: '#666', marginTop: 2, fontSize: 13 },
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
  searchBoxExpanded: {
    backgroundColor: '#f6fafd',
    borderRadius: 12,
    paddingHorizontal: 12,
  countBoxInline: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 40, alignItems: 'center', marginRight: 12, marginLeft: 6 },
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
  },
  searchBoxSlim: {
    backgroundColor: '#f6fafd',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconOutside: { justifyContent: 'center', alignItems: 'center', paddingLeft: 12, paddingRight: 6 },
  input: {
    fontSize: 15,
    color: '#222',
    padding: 0,
    backgroundColor: 'transparent',
  },
  inputExpanded: {
    fontSize: 15,
    color: '#222',
    padding: 0,
    backgroundColor: 'transparent',
    width: '100%',
    textAlignVertical: 'center',
    paddingLeft: 0,
    alignSelf: 'center',
  },
  filtrosRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 6,
    paddingRight: 20,
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
    marginLeft: 8,
    marginBottom: 4,
    width: 28,
    textAlign: 'right',
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
  filtroPildora: {
    backgroundColor: '#f1f6fb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e6eef8',
  },
  filtroPildoraActivo: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  filtroPildoraText: {
    color: '#1a237e',
    fontSize: 13,
  },
  filtroPildoraTextActivo: {
    color: '#fff',
  },
  filtrosWrap: { backgroundColor: '#fff', marginTop: 10, paddingBottom: 8 },
  countWrap: { alignItems: 'center', marginTop: 8 },
  countBox: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  countText: { fontSize: 14, color: '#37474f', fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  emptyWrap: { paddingTop: 40, alignItems: 'center' },
  emptyCount: { color: '#888', marginBottom: 8 },
  emptyText: { color: '#777', fontSize: 15 },
  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', padding:20 },
  modalCard: { backgroundColor:'#fff', borderRadius:12, padding:18 },
  modalTitle: { fontSize:18, fontWeight:'700', color:'#222' },
  modalSub: { color:'#666', marginTop:4 },
  modalLine: { color:'#444', marginTop:6 },
  modalBtnPrimary: { backgroundColor:'#1976d2', paddingHorizontal:12, paddingVertical:8, borderRadius:8 },
  modalBtnPrimaryText: { color:'#fff' },
  modalBtnNeutral: { paddingHorizontal:12, paddingVertical:8 },
  modalBtnNeutralText: { color:'#1976d2' },
});
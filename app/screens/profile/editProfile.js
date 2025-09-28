import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const GUSTOS = [
  { label: 'Playas', icon: 'beach', color: '#ffe0b2' },
  { label: 'Cascadas', icon: 'water', color: '#b3e5fc' },
  { label: 'Volcanes', icon: 'fire', color: '#ffccbc' },
  { label: 'Reservas Naturales', icon: 'leaf', color: '#c8e6c9' },
  { label: 'Sitios Culturales', icon: 'bank', color: '#d1c4e9' },
  { label: 'Deportes de Aventura', icon: 'run', color: '#ffe082' },
  { label: 'Gastronomía Local', icon: 'silverware-fork-knife', color: '#fff9c4' },
  { label: 'Festivales y Eventos', icon: 'calendar-star', color: '#f8bbd0' },
  { label: 'Sitios Históricos', icon: 'history', color: '#ffe0b2' },
  { label: 'Vida Nocturna', icon: 'weather-night', color: '#b39ddb' },
];

export default function EditProfileScreen() {
  // Datos editables
  const [name, setName] = useState('Carlos Mendoza');
  const [email, setEmail] = useState('carlos.mendoza@email.com');
  const [phone, setPhone] = useState('+505 8765-4321');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selected, setSelected] = useState(['Volcanes', 'Sitios Culturales', 'Deportes de Aventura']);
  const [cards, setCards] = useState([
    { type: 'Visa', last4: '4532' },
    { type: 'Banco BAC', last4: '7890' },
  ]);
  const [newCardType, setNewCardType] = useState('');
  const [newCardLast4, setNewCardLast4] = useState('');

  const toggleGusto = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const addCard = () => {
    if (newCardType && newCardLast4) {
      setCards([...cards, { type: newCardType, last4: newCardLast4 }]);
      setNewCardType('');
      setNewCardLast4('');
    }
  };

  return (
    <LinearGradient colors={['#e3f2fd', '#f6fafd']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{name ? name[0] : 'U'}</Text>
          </View>
          <Text style={styles.avatarName}>{name || 'Usuario'}</Text>
        </View>
        {/* ...otros bloques de edición de datos, gustos, métodos de pago... */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 16 }}>Configuración</Text>
            <MaterialCommunityIcons name="cog-outline" size={20} color="#888" style={{ marginLeft: 8 }} />
          </View>
          <TouchableOpacity style={styles.configItem}><Text style={styles.configText}>Notificaciones</Text></TouchableOpacity>
          <TouchableOpacity style={styles.configItem}><Text style={styles.configText}>Privacidad</Text></TouchableOpacity>
          <TouchableOpacity style={styles.configItem}><Text style={styles.configText}>Ayuda y soporte</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Recuerda: este archivo permite editar todos los datos del usuario
// FUTURO: Conectar los handlers de guardar/agregar con tu backend o almacenamiento local
// FUTURO: Validar los campos antes de guardar cambios
// FUTURO: Permitir eliminar tarjetas y gustos turísticos
// FUTURO: Agregar feedback visual (snackbar, alert) al guardar cambios
// FUTURO: Navegar de regreso al perfil principal tras guardar

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f6fafd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e3ea',
    marginBottom: 8,
  },
  gustosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#1976d2',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  gustoBtnSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  gustoText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '500',
  },
  gustoTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6fafd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  configItem: {
    paddingVertical: 10,
  },
  configText: {
    color: '#1976d2',
    fontSize: 15,
    fontWeight: '500',
  },
});

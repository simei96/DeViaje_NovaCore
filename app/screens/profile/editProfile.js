import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    <ScrollView style={{ flex: 1, backgroundColor: '#f6fafd' }} contentContainerStyle={{ padding: 18 }}>
      <View style={styles.card}>
        <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 16, marginBottom: 10 }}>Editar Datos</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo" keyboardType="email-address" />
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Teléfono" keyboardType="phone-pad" />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={[styles.input, { flex: 1 }]} value={password} onChangeText={setPassword} placeholder="Nueva contraseña" secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ marginLeft: 8 }}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveBtn}><Text style={styles.saveBtnText}>Guardar Cambios</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 16 }}>Mis gustos turísticos</Text>
          <MaterialCommunityIcons name="heart-outline" size={22} color="#e53935" />
        </View>
        <View style={styles.gustosGrid}>
          {GUSTOS.map((gusto) => {
            const isSelected = selected.includes(gusto.label);
            return (
              <TouchableOpacity
                key={gusto.label}
                style={[styles.gustoBtn, isSelected && styles.gustoBtnSelected]}
                onPress={() => toggleGusto(gusto.label)}
              >
                <MaterialCommunityIcons name={gusto.icon} size={20} color={isSelected ? '#1976d2' : '#888'} style={{ marginRight: 6 }} />
                <Text style={[styles.gustoText, isSelected && styles.gustoTextSelected]}>{gusto.label}</Text>
                {isSelected && <MaterialCommunityIcons name="check" size={18} color="#1976d2" style={{ marginLeft: 6 }} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.card}>
        <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 16, marginBottom: 10 }}>Métodos de Pago</Text>
        {cards.map((card, idx) => (
          <View key={idx} style={[styles.cardRow, { justifyContent: 'center' }]}> 
            <MaterialCommunityIcons name={card.type === 'Visa' ? 'credit-card' : 'bank'} size={20} color="#1976d2" style={{ marginRight: 8 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#444', fontSize: 14, textAlign: 'center' }}>{card.type} ****</Text>
              <Text style={{ color: '#888', fontSize: 14, marginLeft: 8, textAlign: 'center' }}>Termina en {card.last4}</Text>
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <TextInput style={[styles.input, { width: '100%' }]} value={newCardType} onChangeText={setNewCardType} placeholder="Tipo de tarjeta o banco" />
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <TextInput style={[styles.input, { flex: 1, maxWidth: 160 }]} value={newCardLast4} onChangeText={setNewCardLast4} placeholder="Últimos 4 dígitos" keyboardType="number-pad" maxLength={4} />
              <TouchableOpacity style={[styles.addBtn, { marginLeft: 12, alignSelf: 'center', marginTop: -8 }]} onPress={addCard}>
                <Text style={styles.addBtnText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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
  saveBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  gustosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  gustoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6fafd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e3ea',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    minWidth: 140,
    flex: 1,
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

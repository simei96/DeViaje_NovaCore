import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../../../firebaseConfig';

const GUSTOS = [
  { label: 'Playas', icon: 'beach' },
  { label: 'Cascadas', icon: 'water' },
  { label: 'Volcanes', icon: 'fire' },
  { label: 'Reservas Naturales', icon: 'leaf' },
  { label: 'Sitios Culturales', icon: 'bank' },
  { label: 'Deportes de Aventura', icon: 'run' },
  { label: 'Gastronomía Local', icon: 'silverware-fork-knife' },
  { label: 'Festivales y Eventos', icon: 'calendar-star' },
  { label: 'Sitios Históricos', icon: 'history' },
  { label: 'Vida Nocturna', icon: 'weather-night' },
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const user = route.params?.user || auth.currentUser;

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [intereses, setIntereses] = useState([]);

  const [cards, setCards] = useState([]);
  const [cardNombre, setCardNombre] = useState('');
  const [cardNumero, setCardNumero] = useState('');
  const [cardVence, setCardVence] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();

  const [original, setOriginal] = useState(null);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        setNombre(data.nombre || '');
        setEmail(data.email || user.email || '');
        setTelefono(data.telefono || '');
        setIntereses(data.intereses || []);
        setCards(data.cards || []);
        setProfileImage(data.profileImage || null);
        setOriginal(data);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        setUploading(true);
        const response = await fetch(localUri);
        const blob = await response.blob();
        const fileRef = ref(storage, `avatars/${user.uid}/${uuidv4()}.jpg`);
        await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
        const downloadURL = await getDownloadURL(fileRef);
        setProfileImage(downloadURL);
        await setDoc(doc(db, 'users', user.uid), { profileImage: downloadURL }, { merge: true });
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la imagen: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleGusto = (label) => {
    setIntereses((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const addCard = () => {
    if (!cardNombre.trim() || !cardNumero.trim() || !cardVence.trim()) {
      return Alert.alert('Validación', 'Completa los campos obligatorios de la tarjeta.');
    }
    const digits = cardNumero.replace(/\D/g,'');
    if (digits.length < 12) return Alert.alert('Validación', 'Número de tarjeta demasiado corto.');
    const last4 = digits.slice(-4);
    const cvcDigits = cardCvc.replace(/\D/g,'');
    if (cvcDigits.length < 3) return Alert.alert('Validación', 'CVC inválido');
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardVence)) return Alert.alert('Validación', 'Fecha debe ser MM/AA');
    const nueva = { nombre: cardNombre.trim(), last4, vence: cardVence, brand: detectarMarca(digits) };
    setCards(prev => [...prev, nueva]);
    setCardNombre(''); setCardNumero(''); setCardVence(''); setCardCvc('');
  };

  const formatCardNumber = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0,16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0,4);
    if (digits.length <= 2) return digits;
    return digits.slice(0,2) + '/' + digits.slice(2);
  };

  const handleCardNombreChange = (text) => {
    setCardNombre(text.slice(0,26));
  };

  const handleCardNumeroChange = (text) => {
    setCardNumero(formatCardNumber(text));
  };

  const handleCardVenceChange = (text) => {
    setCardVence(formatExpiry(text));
  };

  const handleCardCvcChange = (text) => {
    const digits = (text || '').replace(/\D/g, '').slice(0,4);
    setCardCvc(digits);
  };

  const detectarMarca = (num) => {
    if (/^4/.test(num)) return 'Visa';
    if (/^(5[1-5])/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'AmEx';
    return 'Tarjeta';
  };

  const removeCard = (index) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const guardarPerfil = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        intereses,
        cards,
        profileImage,
      }, { merge: true });
      Alert.alert('Éxito', 'Perfil actualizado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const solicitarResetPassword = async () => {
    if (!email) return Alert.alert('Atención', 'No hay correo válido para enviar el enlace.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Correo enviado', 'Revisa tu bandeja para restablecer la contraseña.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar el correo: ' + e.message);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [delEmail, setDelEmail] = useState('');
  const [delPassword, setDelPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState('');

  const confirmDeleteRequest = () => {
    Alert.alert(
      'Borrar cuenta',
      '¿Estás seguro que quieres borrar tu cuenta? Esta acción es irreversible.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, borrar', style: 'destructive', onPress: () => { setDelError(''); setDelEmail(''); setDelPassword(''); setShowDeleteModal(true); } }
      ]
    );
  };

  const performDeleteAccount = async () => {
    if (!delEmail || !delPassword) return Alert.alert('Validación', 'Ingresa correo y contraseña para confirmar.');
    if (!user && !auth.currentUser) return Alert.alert('Error', 'No hay usuario autenticado.');
    try {
      setDeleting(true);
      setDelError('');
      const credential = EmailAuthProvider.credential(delEmail.trim(), delPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      try { await deleteDoc(doc(db, 'users', auth.currentUser.uid)); } catch (e) { /* continue even if doc missing */ }
      await deleteUser(auth.currentUser);
      setShowDeleteModal(false);
      Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente.');
      try {
          try {
            navigation.replace('profile-main');
            return;
          } catch (navErr) {
            console.warn('navigation.replace profile-main failed', navErr);
          }
          try {
            const parent = navigation.getParent && navigation.getParent();
            if (parent && typeof parent.navigate === 'function') {
              parent.navigate('profile');
              return;
            }
          } catch (navErr2) {
            console.warn('parent navigation to profile failed', navErr2);
          }
          try { router.replace('/(tabs)?deleted=1'); return; } catch (r1) { console.warn('router.replace(/(tabs)) failed', r1); }
          try { router.replace('/profile?deleted=1'); } catch (r2) { console.warn('router.replace(/profile) failed', r2); }
      } catch (e) {
        try {
          await auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: 'profile-main' }] });
        } catch (err) {
          console.warn('Navigation fallback failed', err);
        }
      }
    } catch (e) {
      console.error('Error deleting account', e);
      const code = e?.code || '';
      let friendly = '';
      if (code === 'auth/wrong-password') friendly = 'La contraseña es incorrecta. Por favor verifica e inténtalo de nuevo.';
      else if (code === 'auth/user-not-found') friendly = 'No se encontró una cuenta con ese correo.';
      else if (code === 'auth/invalid-email') friendly = 'El correo proporcionado no tiene un formato válido.';
      else if (code === 'auth/requires-recent-login') friendly = 'Necesitamos que vuelvas a iniciar sesión antes de eliminar la cuenta. Intenta iniciar sesión nuevamente y vuelve a intentarlo.';
      else friendly = e?.message || String(e);
      setDelError(friendly);
    } finally {
      setDeleting(false);
      setDelPassword('');
      setDelEmail('');
    }
  };

  return (
    <LinearGradient colors={['#e3f2fd', '#f6fafd']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.8}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="camera-plus" size={38} color="#fff" />
              <Text style={styles.avatarInitialsOverlay}>{nombre ? nombre[0].toUpperCase() : 'U'}</Text>
            </View>
          )}
          {uploading && <ActivityIndicator color="#1976d2" style={{ marginBottom: 6 }} />}
          <Text style={styles.avatarName}>{nombre || 'Usuario'}</Text>
          <Text style={styles.avatarAction}>Cambiar foto</Text>
        </TouchableOpacity>
        
        <View style={styles.card}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Juan Pérez" />
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" />
          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Ej: 8888-8888" keyboardType="phone-pad" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Métodos de Pago</Text>
          {cards.length === 0 && <Text style={{ color: '#888', marginBottom: 8 }}>No has agregado tarjetas.</Text>}
          {cards.map((card, index) => (
            <View key={index} style={styles.cardRow}>
              <MaterialCommunityIcons name={card.brand === 'Visa' ? 'credit-card' : 'bank'} size={22} color="#1976d2" />
              <Text style={styles.cardText}>{card.brand} •••• {card.last4}  (Vence {card.vence})</Text>
              <TouchableOpacity onPress={() => removeCard(index)}>
                <MaterialCommunityIcons name="delete-outline" size={22} color="#e53935" />
              </TouchableOpacity>
            </View>
          ))}
          <Text style={[styles.label,{marginTop:8}]}>Añadir nueva tarjeta</Text>
          <TextInput style={styles.input} value={cardNombre} onChangeText={handleCardNombreChange} placeholder="Nombre en la tarjeta" maxLength={26} />
            <TextInput style={styles.input} value={cardNumero} onChangeText={handleCardNumeroChange} placeholder="Número (ej: 1234 5678 9012 3456)" keyboardType="numeric" maxLength={19} />
          <View style={{ flexDirection:'row', gap:8 }}>
            <TextInput style={[styles.input,{flex:1}]} value={cardVence} onChangeText={handleCardVenceChange} placeholder="MM/AA" maxLength={5} keyboardType="numeric" />
            <TextInput style={[styles.input,{width:90}]} value={cardCvc} onChangeText={handleCardCvcChange} placeholder="CVC" maxLength={4} keyboardType="numeric" secureTextEntry />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addCard} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Agregar Tarjeta</Text>
          </TouchableOpacity>
          <Text style={{ fontSize:11, color:'#999', marginTop:6 }}>No almacenes datos reales sensibles en esta versión de prueba.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mis Intereses Turísticos</Text>
          <View style={styles.gustosGrid}>
            {GUSTOS.map((gusto) => (
              <TouchableOpacity
                key={gusto.label}
                style={[styles.gustoBtn, intereses.includes(gusto.label) && styles.gustoBtnSelected]}
                onPress={() => toggleGusto(gusto.label)}
              >
                <MaterialCommunityIcons name={gusto.icon} size={28} color={intereses.includes(gusto.label) ? '#1976d2' : '#555'} />
                <Text style={[styles.gustoText, intereses.includes(gusto.label) && styles.gustoTextSelected]}>{gusto.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={[styles.saveBtn, styles.actionBtn]} activeOpacity={0.85} onPress={guardarPerfil}>
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.resetBtn, styles.actionBtn, { marginLeft: 12 }]} activeOpacity={0.85} onPress={solicitarResetPassword}>
            <Text style={styles.resetBtnText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.deleteBtn, styles.actionBtn, { marginLeft: 12 }]} activeOpacity={0.85} onPress={confirmDeleteRequest}>
            <Text style={styles.deleteBtnText}>Borrar cuenta</Text>
          </TouchableOpacity>
        </View>
        
        <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={()=> setShowDeleteModal(false)}>
          <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center', padding:18 }}>
            <View style={{ width:'100%', maxWidth:420, backgroundColor:'#fff', borderRadius:12, padding:16 }}>
              <Text style={{ fontWeight:'bold', fontSize:16, marginBottom:8 }}>Confirma eliminación</Text>
              <Text style={{ color:'#666', marginBottom:12 }}>Ingresa tu correo y contraseña para confirmar que deseas eliminar tu cuenta definitivamente.</Text>
              <TextInput placeholder="Correo" value={delEmail} onChangeText={setDelEmail} keyboardType="email-address" autoCapitalize="none" style={[styles.input,{marginBottom:8}]} />
              <TextInput placeholder="Contraseña" value={delPassword} onChangeText={setDelPassword} secureTextEntry style={[styles.input,{marginBottom:12}]} />
              {delError ? <Text style={{ color: '#ff6f00', marginBottom: 8, textAlign: 'left' }}>{delError}</Text> : null}
              <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:8 }}>
                <TouchableOpacity onPress={()=> setShowDeleteModal(false)} style={{ paddingVertical:8, paddingHorizontal:12 }}>
                  <Text style={{ color:'#1976d2' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={performDeleteAccount} style={{ backgroundColor:'#e53935', paddingVertical:8, paddingHorizontal:12, borderRadius:8 }}>
                  {deleting ? <ActivityIndicator color="#fff" /> : <Text style={{ color:'#fff' }}>Eliminar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1976d2',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarInitialsOverlay:{
    position:'absolute',
    fontSize:32,
    fontWeight:'bold',
    color:'rgba(255,255,255,0.35)'
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  avatarAction: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f6fafd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e3ea',
    marginBottom: 12,
  },
  gustosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gustoBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e3ea',
    marginBottom: 10,
  },
  gustoBtnSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  gustoText: {
    color: '#555',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  gustoTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f6fafd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#444',
  },
  addCardContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // shared action button wrapper (applied to the three primary buttons)
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  saveBtn: {
    backgroundColor: '#4caf50',
  },
  resetBtn: {
    backgroundColor: '#455a64',
  },
  deleteBtn: {
    backgroundColor: '#e53935',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'none',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});

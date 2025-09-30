import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebaseConfig';

const INTERESES = [
  'Turismo Cultural',
  'Turismo Ecológico',
  'Turismo de Aventura',
  'Turismo Histórico',
  'Turismo Rural',
  'Turismo Gastronómico',
];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [intereses, setIntereses] = useState([]);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInteres = (item) => {
    setIntereses((prev) =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const validate = () => {
    if (!nombre.trim()) return 'El nombre es obligatorio.';
    if (!email.trim()) return 'El correo es obligatorio.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Correo inválido.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    if (intereses.length === 0) return 'Selecciona al menos un tipo de turismo.';
    return '';
  };

  const handleSubmit = async () => {
    setTouched({ nombre: true, email: true, password: true, confirmPassword: true });
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid, email: userEmail } = userCredential.user;
      await setDoc(doc(db, 'users', uid), {
        nombre,
        email: userEmail,
        telefono,
        intereses,
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      setTimeout(() => {
        alert('¡Felicidades, Bienvenido a DeViaje!');
        navigation.reset({
          index: 0,
          routes: [{
            name: 'profile',
            params: {
              isAuthenticated: true,
              email: userEmail,
              nombre,
              telefono,
              intereses
            }
          }]
        });
      }, 100);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#2196f3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre completo <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, touched.nombre && !nombre.trim() && styles.inputError]}
            placeholder="Tu nombre completo"
            placeholderTextColor="#bbb"
            value={nombre}
            onChangeText={setNombre}
            onBlur={() => setTouched(t => ({ ...t, nombre: true }))}
          />
          <Text style={styles.label}>Correo electrónico <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, touched.email && (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) && styles.inputError]}
            placeholder="tu@correo.com"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
          />
          <Text style={styles.label}>Teléfono (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+505 8888 8888"
            placeholderTextColor="#bbb"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Contraseña <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, touched.password && password.length < 6 && styles.inputError, { flex: 1 }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Confirmar contraseña <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, touched.confirmPassword && password !== confirmPassword && styles.inputError, { flex: 1 }]}
              placeholder="Confirma tu contraseña"
              placeholderTextColor="#bbb"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
              <MaterialCommunityIcons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Tipos de turismo de interés <Text style={styles.required}>*</Text></Text>
          <View style={styles.checkGrid}>
            {INTERESES.map((item, idx) => (
              <TouchableOpacity
                key={item}
                style={styles.checkRow}
                onPress={() => toggleInteres(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, intereses.includes(item) && styles.checkboxChecked]}>
                  {intereses.includes(item) && (
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <MaterialCommunityIcons name="loading" size={18} color="#fff" style={{ marginRight: 8 }} />
            ) : null}
            <Text style={styles.submitBtnText}>{loading ? 'Creando...' : 'Crear Cuenta'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputError: {
  borderColor: '#ff6f00',
  backgroundColor: '#fff3e0'
  },
  errorText: {
    color: '#ff6f00',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
    backgroundColor: '#f6fafd',
  },
  scroll: {
    padding: 0,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30, 
    paddingBottom: 18, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
  fontFamily:'Montserrat-Bold',
    color: '#2196f3',
  },
  form: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginTop: 12,
    marginBottom: 4,
  fontFamily:'Montserrat-SemiBold',
  },
  required: {
    color: '#ff6f00',
  fontFamily:'Montserrat-SemiBold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 2,
  },
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#2196f3',
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  checkLabel: {
    fontSize: 13,
    color: '#222',
  },
  submitBtn: {
    backgroundColor: '#039be5',
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnText: {
    color: '#fff',
  fontFamily:'Montserrat-SemiBold',
    fontSize: 15,
  },
});

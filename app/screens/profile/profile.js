import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (user && isFocused) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        } else {
          console.log("No such document!");
        }
      });
      return () => unsubscribeSnapshot();
    }
  }, [user, isFocused]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6fafd' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <View style={{ backgroundColor: '#e3f2fd', borderRadius: 50, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <MaterialCommunityIcons name="account" size={38} color="#283593" />
            </View>
            <Text style={{ fontWeight: 'bold', color: '#283593', fontSize: 22, marginBottom: 4 }}>Iniciar Sesión</Text>
            <Text style={{ color: '#888', fontSize: 15, marginBottom: 10, textAlign: 'center' }}>Inicia sesión o regístrate para continuar</Text>
          </View>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 22, width: '90%', maxWidth: 370, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>Correo electrónico</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15 }} value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" />
            <Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>Contraseña</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }}>
              <TextInput style={{ flex: 1, padding: 10, fontSize: 15 }} value={password} onChangeText={setPassword} placeholder="********" secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 8 }}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ backgroundColor: '#5c6bc0', borderRadius: 8, paddingVertical: 12, marginBottom: 10 }} onPress={handleLogin}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 10, marginBottom: 10 }} onPress={() => navigation.navigate('register')}>
              <Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 15, textAlign: 'center' }}>Crear cuenta nueva</Text>
            </TouchableOpacity>
            <View style={{ borderWidth: 1, borderColor: '#5c6bc0', borderRadius: 12, padding: 12, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name="office-building-outline" size={22} color="#283593" style={{ marginRight: 8 }} />
                <Text style={{ fontWeight: 'bold', color: '#283593', fontSize: 15 }}>¿Tienes un negocio turístico?</Text>
              </View>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>Regístrate como empresa y llega a más turistas</Text>
              <TouchableOpacity style={{ borderWidth: 1, borderColor: '#283593', borderRadius: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="briefcase-outline" size={18} color="#283593" style={{ marginRight: 6 }} />
                <Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 15 }}>Registrar Mi Negocio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Si está autenticado, muestra perfil detallado
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6fafd' }}>
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 8, marginBottom: 8 }}>
        <Text style={{ fontWeight: 'bold', color: '#283593', fontSize: 18 }}>Mi Perfil</Text>
        <View style={{ position: 'absolute', right: 24, top: 28, flexDirection: 'row', gap: 18 }}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { user: user })}>
            <Text style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 13 }}>✎ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 13 }}>✖ Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 12, marginBottom: 12, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ backgroundColor: '#e3f2fd', borderRadius: 32, width: 54, height: 54, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="account" size={32} color="#1976d2" />
          </View>
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#222' }}>{profile.nombre || 'Usuario'}</Text>
            <Text style={{ color: '#888', fontSize: 13 }}>{user?.email}</Text>
          </View>
        </View>
        <View style={{ marginTop: 16, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6fafd', borderRadius: 10, padding: 10 }}>
            <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" style={{ marginRight: 8 }} />
            <Text style={{ color: '#444', fontSize: 14 }}>Fecha de registro</Text>
            <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'No disponible'}</Text>
          </View>
          <View style={{ backgroundColor: '#f6fafd', borderRadius: 10, padding: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="map-marker-multiple" size={20} color="#1976d2" style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: 'bold', color: '#444', fontSize: 14 }}>Intereses turísticos</Text>
            </View>
            {profile.intereses && profile.intereses.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 28 }}>
                {profile.intereses.map((item, idx) => (
                  <View key={idx} style={{ backgroundColor: '#e3f2fd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 }}>
                    <Text style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 13 }}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: '#888', fontSize: 13, marginLeft: 28 }}>No seleccionados</Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6fafd', borderRadius: 10, padding: 10 }}>
            <MaterialCommunityIcons name="phone" size={20} color="#1976d2" style={{ marginRight: 8 }} />
            <Text style={{ color: '#444', fontSize: 14 }}>Teléfono</Text>
            <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>{profile.telefono || 'No registrado'}</Text>
          </View>
        </View>
      </View>
      
      <View style={{ backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 12, marginBottom: 12, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 15 }}>Métodos de Pago</Text>
          <TouchableOpacity><Text style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 13 }}>+ Agregar</Text></TouchableOpacity>
        </View>
        {profile.cards && profile.cards.length > 0 ? (
          <View style={{ gap: 10 }}>
            {profile.cards.map((card, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6fafd', borderRadius: 10, padding: 10, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={card.type === 'Visa' ? "credit-card" : "bank"} size={20} color="#1976d2" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#444', fontSize: 14 }}>{card.type} ****</Text>
                  <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>Termina en {card.last4}</Text>
                </View>
                <View style={{ backgroundColor: '#e3f2fd', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 12 }}>{card.type === 'Visa' ? 'Tarjeta' : 'Banco'}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', paddingVertical: 10 }}>No hay métodos de pago agregados.</Text>
        )}
      </View>
      <View style={{ backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontWeight: 'bold', color: '#222', fontSize: 14 }}>Para Negocios</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Registra tu negocio en DeViaje!</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: '#1976d2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fafd',
  },
  headerBg: {
    height: 220,
    backgroundColor: 'linear-gradient(180deg, #0ba4e0 0%, #1cc8a5 100%)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -40,
  },
  backBtn: {
    position: 'absolute',
    top: 36,
    left: 18,
    zIndex: 2,
    padding: 8,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0ba4e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#e0f7fa',
    marginTop: 2,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    borderRadius: 18,
    padding: 22,
    marginTop: -40,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'stretch',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196f3',
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginTop: 10,
    marginBottom: 4,
    fontWeight: 'bold',
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 2,
  },
  loginBtn: {
    backgroundColor: '#90caf9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    textAlign: 'center',
    color: '#444',
    fontSize: 14,
    marginBottom: 10,
  },
  registerLink: {
    color: '#ff6f00',
    fontWeight: 'bold',
  },
  businessBox: {
    backgroundColor: '#f6fafd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#90caf9',
    padding: 14,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  businessTitle: {
    fontWeight: 'bold',
    color: '#1a237e',
    fontSize: 15,
    marginBottom: 0,
  },
  businessSubtitle: {
    color: '#444',
    fontSize: 12,
    marginTop: 1,
  },
  businessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    alignSelf: 'stretch',
    justifyContent: 'center',
    position: 'relative',
  },
  businessBtnTextSmall: {
    color: '#1a237e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  soonTextSmall: {
    color: '#888',
    fontSize: 10,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  businessBtnText: {
    color: '#1a237e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  soonText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
});
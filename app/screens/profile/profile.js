// Recuerda: si cambio el icono o la navegación, revisar estos imports
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Recuerda: aquí está la pantalla principal de perfil. Cambiar layout general aquí.
export default function ProfileScreen() {
  // Recuerda: aquí guardo el email del usuario
  const [email, setEmail] = useState('');
  // Recuerda: aquí guardo la contraseña
  const [password, setPassword] = useState('');
  // Recuerda: aquí controlo si se muestra la contraseña
  const [showPassword, setShowPassword] = useState(false);
  // Recuerda: navigation para moverme entre pantallas
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Recuerda: este es el header con el gradiente y el avatar */}
      <View style={styles.headerBg}>
        <TouchableOpacity style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#fff' }}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={44} color="#0ba4e0" />
        </View>
        <Text style={styles.title}>Nicaragua Tours</Text>
        <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
      </View>

      {/* Recuerda: aquí está la card de login. Cambiar campos o estilos aquí. */}
      <View style={styles.card}>
        <Text style={styles.loginTitle}>Iniciar Sesión</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@correo.com"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Tu contraseña"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        {/* Recuerda: aquí está el link para ir a registro. Cambiar navegación aquí si es necesario. */}
        <Text style={styles.registerText}>
          ¿No tienes cuenta?{' '}
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate('register')}
          >
            Regístrate aquí
          </Text>
        </Text>
        <View style={styles.businessBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MaterialCommunityIcons name="office-building-outline" size={22} color="#1a237e" style={{ marginRight: 6 }} />
            <View>
              <Text style={styles.businessTitle}>¿Tienes un negocio turístico?</Text>
              <Text style={styles.businessSubtitle}>Regístrate como empresa y llega a más turistas</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.businessBtn} disabled>
            <MaterialCommunityIcons name="store-outline" size={18} color="#1a237e" style={{ marginRight: 12, marginLeft: 2 }} />
            <Text style={styles.businessBtnTextSmall}>Registrar Mi Negocio</Text>
            <Text style={styles.soonTextSmall}>Próximamente</Text>
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
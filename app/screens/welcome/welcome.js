import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../../firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [slides, setSlides] = useState([]); 
  const [loading, setLoading] = useState(true);
  const transition = useRef(new Animated.Value(0)).current; 

  // Suscripción en tiempo real a la colección WelcomeSlide
  useEffect(() => {
    const q = query(collection(db, 'WelcomeSlide'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({
        id: d.id,
        title: d.data().Nombre || 'Bienvenido',
        subtitle: 'La aventura comienza aquí',
        description: 'Explora experiencias únicas en todo el país',
        imageURL: d.data().ImagenURL || null,
      }));
  const desiredOrder = ['Propuesta_001', 'Propuesta_006'];
      const ordered = desiredOrder.map(id => data.find(s => s.id === id)).filter(Boolean);
  const finalSlides = ordered.length ? ordered : data.slice(0, 2);

      const overrides = [
        {
          title: 'TURISMO SIN LIMITES',
          subtitle: 'viaja como quieras, a donde quieras',
          description: 'aventuras unicas',
        },
        {
          title: 'EXPLORA NICARAGUA',
          subtitle: 'La avanetura comienza aqui',
          description: 'a un clic de nuevas experiencias',
        },
      ];

      const finalSlidesWithOverrides = finalSlides.map((s, i) =>
        i < overrides.length ? { ...s, ...overrides[i] } : s
      );

      setSlides(finalSlidesWithOverrides);
      setLoading(false);
      setIndex(0); 
    });
    return () => unsub();
  }, []);

  const next = () => {
    if (slides.length === 0) return finish();
    if (index >= slides.length - 1) return finish();
    const target = index + 1;
    setNextIndex(target);
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIndex(target);
      setNextIndex(null);
      transition.setValue(0);
    });
  };

  const finish = () => {
    router.replace('/(tabs)');
  };

  // Si no hay slides y ya terminó de cargar, podríamos saltar automáticamente
  useEffect(() => {
    if (!loading && slides.length === 0) {
      // Sin contenido válido -> navegar directamente
      finish();
    }
  }, [loading, slides]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {loading && (
        <View style={[StyleSheet.absoluteFill, { alignItems:'center', justifyContent:'center', backgroundColor:'#000' }]}> 
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color:'#fff', marginTop:12 }}>Cargando…</Text>
        </View>
      )}
      {!loading && slides.length > 0 && (
        <>
          <View style={{ flex:1 }}>
            {slides.map((s, i) => {
              if (i !== index && i !== nextIndex) return null;
              const bgSource = s.imageURL ? { uri: s.imageURL } : require('../../assets/images/imagen_de_prueba.jpg');
              const isCurrent = i === index;
              const isNext = i === nextIndex;
              const opacity = isCurrent
                ? transition.interpolate({ inputRange:[0,1], outputRange:[1,0] })
                : isNext
                  ? transition.interpolate({ inputRange:[0,1], outputRange:[0,1] })
                  : 0;
              const translateY = isCurrent
                ? transition.interpolate({ inputRange:[0,1], outputRange:[0,-35] })
                : transition.interpolate({ inputRange:[0,1], outputRange:[35,0] });
              const scale = isCurrent
                ? transition.interpolate({ inputRange:[0,1], outputRange:[1,0.92] })
                : transition.interpolate({ inputRange:[0,1], outputRange:[0.9,1] });
              return (
                <Animated.View key={s.id} style={{ position:'absolute', left:0, top:0, right:0, bottom:0, opacity }}>
                  <ImageBackground source={bgSource} style={styles.bg} resizeMode="cover" imageStyle={styles.imageFill}>
                    <View style={styles.overlay} />
                    <View style={styles.topRow}>
                      <TouchableOpacity onPress={finish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.skip}>Saltar</Text>
                      </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.textBlock, { transform:[{ translateY }, { scale }] }]}> 
                      <Text style={styles.title}>{s.title}</Text>
                      <Text style={styles.subtitle}>{s.subtitle}</Text>
                      <Text style={styles.description}>{s.description}</Text>
                    </Animated.View>
                  </ImageBackground>
                </Animated.View>
              );
            })}
          </View>
          <View style={styles.footer}>
            <View style={styles.dotsRow}>
              {slides.map((s, i) => {
                const active = i === (nextIndex != null ? nextIndex : index);
                return <View key={s.id} style={[styles.dot, active && styles.dotActive]} />;
              })}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>{index === (slides.length - 1) ? 'Iniciar' : 'Siguiente'}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { flex:1, width:'100%', height:'100%', justifyContent: 'flex-start' },
  imageFill: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  topRow: { position: 'absolute', top: 48, right: 24, zIndex: 10 },
  skip: { color: '#fff', fontSize: 14, fontWeight: '500' },
  textBlock: { position: 'absolute', top: '32%', alignSelf: 'center', width: '86%' },
  title: { color: '#fff', fontSize: 30, fontWeight: 'bold', textAlign: 'center', lineHeight: 34, letterSpacing: 0.5 },
  subtitle: { color: '#e0f2f1', fontSize: 16, textAlign: 'center', marginTop: 16, fontWeight: '600' },
  description: { color: '#d0d0d0', fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 20 },
  footer: { position: 'absolute', bottom: 54, width: '100%', alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#fff', width: 9, height: 9 },
  nextBtn: { flexDirection: 'row', backgroundColor: '#0077c2', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, alignItems: 'center', minWidth: width * 0.48, justifyContent: 'center', shadowColor:'#000', shadowOpacity:0.22, shadowRadius:6, shadowOffset:{width:0,height:3}, elevation:5 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.4 },
  arrow: { color: '#fff', fontSize: 24, marginLeft: 8, marginTop: -2, fontWeight:'300' },
});

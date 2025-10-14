import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Easing,
	Image,
	ImageBackground,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { ThemedText } from '../../../components/themed-text';
import { db } from '../../../firebaseConfig';
const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const bgZoom = useRef(new Animated.Value(0)).current;
  const textCross = useRef(new Animated.Value(0)).current;

  const preloaded = useRef(new Set()).current;
  const loadedMap = useRef({}).current;

  const prefetchImages = async (arr) => {
    const tasks = arr
      .filter(s => s.imageURL && !preloaded.has(s.imageURL))
      .map(s =>
        new Promise(resolve => {
          const timeout = setTimeout(() => resolve(false), 4000);
          Image.prefetch(s.imageURL)
            .then(ok => { clearTimeout(timeout); preloaded.add(s.imageURL); resolve(ok); })
            .catch(() => { clearTimeout(timeout); resolve(false); });
        })
      );
    if (tasks.length) await Promise.all(tasks);
  };

  useEffect(() => {
    const q = query(collection(db, 'WelcomeSlide'));
    const unsub = onSnapshot(q, async snap => {
      try {
        const data = snap.docs.map(d => {
          const doc = d.data() || {};
          const nombre = doc.Nombre || '';
          const img = doc.ImagenURL || '';
          const descripcion = doc.Descripcion || '';
          return {
            id: d.id,
            title: nombre || 'Bienvenido',
            subtitle: doc.Subtitulo || 'La aventura comienza aquí',
            description: descripcion || 'Explora experiencias únicas en todo el país',
            imageURL: img || null,
          };
        });

        const onlyWithImage = data.filter(s => !!s.imageURL);
        const targetIDs = ['Propuesta_001','Propuesta_006'];
        const picked = targetIDs.map(id => onlyWithImage.find(s => s.id === id)).filter(Boolean);
        const finalSlides = picked.length ? picked : onlyWithImage.slice(0,2);

        const overrides = [
          { title:'TURISMO SIN LIMITES', subtitle:'viaja como quieras, a donde quieras', description:'aventuras unicas' },
          { title:'EXPLORA NICARAGUA', subtitle:'La aventura comienza aqui', description:'a un clic de nuevas experiencias' },
        ];
        const finalSlidesOverridden = finalSlides.map((s,i)=> i < overrides.length ? { ...s, ...overrides[i] } : s);

        await prefetchImages(finalSlidesOverridden);
        setSlides(finalSlidesOverridden);
        setIndex(0);
      } catch (e) {
        console.warn('Error cargando welcome slides', e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const next = () => {
    if (loading || animating) return;
    if (slides.length === 0) return finish();
    if (index >= slides.length - 1) return finish();
    const target = index + 1;
    setNextIndex(target);
    if (loadedMap[slides[target]?.id] || !slides[target]?.imageURL) {
      runTransition(target);
    }
  };

  const runTransition = (target) => {
    if (animating) return;
    setAnimating(true);
    setNextIndex(target);
    try {
      progress.stopAnimation();
      bgZoom.stopAnimation();
      textCross.stopAnimation();
    } catch (err) {
    }
    progress.setValue(0);
    bgZoom.setValue(0);
    textCross.setValue(0);

    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 560, easing: Easing.bezier(0.25, 0.6, 0.3, 1), useNativeDriver: true }),
      Animated.timing(bgZoom, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(textCross, { toValue: 1, duration: 560, easing: Easing.bezier(0.25, 0.6, 0.3, 1), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setIndex(target);
        setNextIndex(null);
        progress.setValue(0);
        bgZoom.setValue(0);
        textCross.setValue(0);
        setAnimating(false);
      } else {
        setNextIndex(null);
        setAnimating(false);
      }
    });
  };

  const finish = () => { router.replace('/(tabs)'); };

  useEffect(() => { if (!loading && slides.length === 0) finish(); }, [loading, slides]);

  const currentOpacity = progress.interpolate({ inputRange:[0,1], outputRange:[1,0] });
  const nextOpacity = progress;
  const currentTextTranslate = textCross.interpolate({ inputRange:[0,1], outputRange:[0,-18] });
  const nextTextTranslate = textCross.interpolate({ inputRange:[0,1], outputRange:[18,0] });
  const currentTextOpacity = textCross.interpolate({ inputRange:[0,0.5,1], outputRange:[1,0,0] });
  const nextTextOpacity = textCross.interpolate({ inputRange:[0,0.5,1], outputRange:[0,1,1] });

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
            {slides[index] && (
              <Animated.View style={[styles.absoluteFill, { opacity: currentOpacity }, styles.layerBase]} pointerEvents="none">
                <Animated.View style={{ flex:1, transform:[{ scale: bgZoom.interpolate({ inputRange:[0,1], outputRange:[1,1.02] }) }] }}>
                  <ImageBackground
                    source={slides[index].imageURL ? { uri: slides[index].imageURL } : { uri: 'https://firebasestorage.googleapis.com/v0/b/deviaje-75dbd.appspot.com/o/imagen_de_prueba.jpg?alt=media' }}
                    style={styles.bg}
                    resizeMode="cover"
                    imageStyle={styles.imageFill}
                    fadeDuration={0}
                    onLoadEnd={() => { loadedMap[slides[index].id] = true; }}
                  >
                    <View style={styles.overlay} />
                    <View style={styles.topRow}>
                      <TouchableOpacity onPress={finish} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                        <Text style={styles.skip}>Saltar</Text>
                      </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.textBlock, { transform:[{ translateY: currentTextTranslate }] }]}>
                      <AnimatedThemedText variant="title" style={[styles.title, styles.layerText, { opacity: currentTextOpacity }]}>{slides[index].title}</AnimatedThemedText>
                      <AnimatedThemedText variant="subtitle" style={[styles.subtitle, styles.layerText, { opacity: currentTextOpacity }]}>{slides[index].subtitle}</AnimatedThemedText>
                      <AnimatedThemedText variant="body" style={[styles.description, styles.layerText, { opacity: currentTextOpacity }]}>{slides[index].description}</AnimatedThemedText>
                    </Animated.View>
                  </ImageBackground>
                </Animated.View>
              </Animated.View>
            )}

            {nextIndex != null && slides[nextIndex] && (
              <Animated.View style={[styles.absoluteFill, { opacity: nextOpacity }, styles.layerBase]} pointerEvents="none">
                <ImageBackground
                  source={slides[nextIndex].imageURL ? { uri: slides[nextIndex].imageURL } : { uri: 'https://firebasestorage.googleapis.com/v0/b/deviaje-75dbd.appspot.com/o/imagen_de_prueba.jpg?alt=media' }}
                  style={styles.bg}
                  resizeMode="cover"
                  imageStyle={styles.imageFill}
                  fadeDuration={0}
                  onLoadEnd={() => {
                    loadedMap[slides[nextIndex].id] = true;
                    if (!animating && nextIndex != null) {
                      runTransition(nextIndex);
                    }
                  }}
                >
                  <View style={styles.overlay} />
                  <View style={styles.topRow}>
                    <TouchableOpacity onPress={finish} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                      <Text style={styles.skip}>Saltar</Text>
                    </TouchableOpacity>
                  </View>
                  <Animated.View style={[styles.textBlock, { transform:[{ translateY: nextTextTranslate }] }]}>
                    <AnimatedThemedText variant="title" style={[styles.title, styles.layerText, { opacity: nextTextOpacity }]}>{slides[nextIndex].title}</AnimatedThemedText>
                    <AnimatedThemedText variant="subtitle" style={[styles.subtitle, styles.layerText, { opacity: nextTextOpacity }]}>{slides[nextIndex].subtitle}</AnimatedThemedText>
                    <AnimatedThemedText variant="body" style={[styles.description, styles.layerText, { opacity: nextTextOpacity }]}>{slides[nextIndex].description}</AnimatedThemedText>
                  </Animated.View>
                </ImageBackground>
              </Animated.View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.dotsRow}>
              {slides.map((s, i) => {
                const active = i === (nextIndex != null ? nextIndex : index);
                return <View key={s.id} style={[styles.dot, active && styles.dotActive]} />;
              })}
            </View>

            <TouchableOpacity style={[styles.nextBtn, animating && { opacity:0.7 }]} onPress={next} activeOpacity={0.85} disabled={animating}>
              <Text style={styles.nextBtnText}>{index === (slides.length - 1) ? 'Iniciar' : 'Siguiente'}</Text><Text style={styles.arrow}>›</Text>
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
  skip: { color: '#fff', fontSize: 14, fontFamily:'Montserrat-Medium' },
  textBlock: { position: 'absolute', top: '32%', alignSelf: 'center', width: '86%' },
  title: { color: '#fff', fontSize: 30, fontFamily:'Montserrat-Bold', textAlign: 'center', lineHeight: 34, letterSpacing: 0.5 },
  subtitle: { color: '#e0f2f1', fontSize: 16, textAlign: 'center', marginTop: 16, fontFamily:'Montserrat-SemiBold' },
  description: { color: '#d0d0d0', fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 20, fontFamily:'Montserrat-Regular' },
  footer: { position: 'absolute', bottom: 54, width: '100%', alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#fff', width: 9, height: 9 },
  nextBtn: { flexDirection: 'row', backgroundColor: '#0077c2', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, alignItems: 'center', minWidth: width * 0.48, justifyContent: 'center', shadowColor:'#000', shadowOpacity:0.22, shadowRadius:6, shadowOffset:{width:0,height:3}, elevation:5 },
  nextBtnText: { color: '#fff', fontSize: 16, letterSpacing: 0.4, fontFamily:'Montserrat-SemiBold' },
  arrow: { color: '#fff', fontSize: 24, marginLeft: 8, marginTop: -2, fontFamily:'Montserrat-Regular' },
  absoluteFill: { position:'absolute', left:0, top:0, right:0, bottom:0 },
  layerBase: { backfaceVisibility:'hidden' },
  layerText: { includeFontPadding:false },
});
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import { auth, db } from '../../../firebaseConfig';

const DEFAULT_HEADER_HEIGHT = 96;

const CATEGORIAS = [
	{ label: 'Playas', icon: 'beach', color: '#fffbe6', slug: 'playas' },
	{ label: 'Volcanes', icon: 'terrain', color: '#fff3e0', slug: 'volcanes' },
	{ label: 'Cascadas', icon: 'waterfall', color: '#eafaf1', slug: 'cascadas' },
	{ label: 'Ríos', icon: 'waves', color: '#e3f2fd', slug: 'rios' },
];

function formatDateRange(start, end) {
	try {
		const s = start ? (start.toDate ? start.toDate() : new Date(start)) : null;
		const e = end ? (end.toDate ? end.toDate() : new Date(end)) : null;
		if (s && e) {
			const opts = { day: '2-digit', month: 'short' };
			return `${s.toLocaleDateString(undefined, opts)} - ${e.toLocaleDateString(undefined, opts)}`;
		}
		if (s) return s.toLocaleDateString();
		if (e) return e.toLocaleDateString();
		return '';
	} catch (err) {
		return '';
	}
}

function formatExtraValue(val) {
	try {
		if (val === null || typeof val === 'undefined') return '';
		if (Array.isArray(val)) return val.join(', ');
		if (val && typeof val.toDate === 'function') return new Date(val.toDate()).toLocaleString();
		if (typeof val === 'object') return JSON.stringify(val);
		return String(val);
	} catch (err) {
		return '';
	}
}

function formatPricesReadable(p) {
	if (!p) return null;
	if (typeof p === 'string') return p;
	if (typeof p === 'object') return Object.entries(p).map(([k,v]) => `${k}: C$ ${v}`).join('\n');
	return String(p);
}

function extractPlaceCoords(place) {
	if (!place) return null;
	if (place.Coordenadas && (place.Coordenadas.latitude || place.Coordenadas._lat || place.Coordenadas.latitude === 0)) {
		const lat = place.Coordenadas.latitude || place.Coordenadas._lat || (place.Coordenadas.latitude === 0 ? 0 : null);
		const lng = place.Coordenadas.longitude || place.Coordenadas._long || place.Coordenadas.longitude === 0 ? place.Coordenadas.longitude : (place.Coordenadas._long || null);
		if (lat != null && lng != null) return { lat, lng };
	}
	if (Array.isArray(place.Ubicacion) && place.Ubicacion.length >= 2) {
		const maybeLat = parseFloat(String(place.Ubicacion[0]).replace(/[^0-9\-\.]/g, ''));
		const maybeLng = parseFloat(String(place.Ubicacion[1]).replace(/[^0-9\-\.]/g, ''));
		if (!isNaN(maybeLat) && !isNaN(maybeLng)) return { lat: maybeLat, lng: maybeLng };
	}
	if (place.Ubicacion && typeof place.Ubicacion === 'object' && (place.Ubicacion.lat || place.Ubicacion.latitude)) {
		const lat = place.Ubicacion.lat || place.Ubicacion.latitude;
		const lng = place.Ubicacion.lng || place.Ubicacion.longitude;
		if (lat != null && lng != null) return { lat, lng };
	}
	if (typeof place.Ubicacion === 'string') {
		const nums = place.Ubicacion.match(/-?\d+\.?\d*/g);
		if (nums && nums.length >= 2) return { lat: parseFloat(nums[0]), lng: parseFloat(nums[1]) };
	}
	return null;
}

function openPlaceInMaps(place) {
	const c = extractPlaceCoords(place);
	if (!c) return false;
	const lat = c.lat;
	const lng = c.lng;
	const url = Platform.OS === 'ios' ? `http://maps.apple.com/?ll=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}`;
	Linking.openURL(url).catch(e => console.warn('Could not open maps', e));
	return true;
}

export default function Home() {
	const router = useRouter();
	const [user, setUser] = useState(auth.currentUser || null);
	const [logoUrl, setLogoUrl] = useState(null);
	const [promoPlaya, setPromoPlaya] = useState(null);
	const [promoPlaya2, setPromoPlaya2] = useState(null);
	const [promoTour, setPromoTour] = useState(null);
	const [promoIsla, setPromoIsla] = useState(null);
	const [volcanMasayaCard, setVolcanMasayaCard] = useState(null); 
	const [volcanMasayaPromo, setVolcanMasayaPromo] = useState(null); 
	const [loading, setLoading] = useState(true);
	const [nearbyPlaces, setNearbyPlaces] = useState([]);
	const [recommendedPlaces, setRecommendedPlaces] = useState([]);
	const [loadingRecommended, setLoadingRecommended] = useState(false);
	const [detailModalVisible, setDetailModalVisible] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState(null);
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [slidesLoaded, setSlidesLoaded] = useState([]);
	const [hotelLoaded, setHotelLoaded] = useState(false);
	const [tourLoaded, setTourLoaded] = useState(false);
	const [islaLoaded, setIslaLoaded] = useState(false);
	const [volcanLoaded, setVolcanLoaded] = useState(false);
	const fadeAnim = useRef(new Animated.Value(1)).current;
	const [carouselData, setCarouselData] = useState([
		{
			title: 'Volcán Masaya',
			desc: 'Naturaleza volcánica espectacular',
			badge: 'Próximamente',
			btn: 'Descubre Nicaragua',
			image: null,
		},
		{
			title: 'Naturaleza de cañon de Somoto',
			desc: 'Aventura y paisajes únicos',
			badge: 'Nuevo',
			btn: 'Ver más',
			image: null,
		},
	]);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const promoTourRef = doc(db, 'Promociones', 'Promo_003');
				const promoTourSnap = await getDoc(promoTourRef);
				if (promoTourSnap.exists()) setPromoTour(promoTourSnap.data());

				const logoRef = doc(db, 'WelcomeSlide', 'E6E9tiI2uJkTZqG5DcAC');
				const logoSnap = await getDoc(logoRef);
				if (logoSnap.exists()) setLogoUrl(logoSnap.data().ImagenURL);

				const promoPlayaRef = doc(db, 'Promociones', 'Promo_002');
				const promoPlayaSnap = await getDoc(promoPlayaRef);
				if (promoPlayaSnap.exists()) setPromoPlaya(promoPlayaSnap.data());

				const promoIslaRef = doc(db, 'Promociones', 'Promo_004');
				const promoIslaSnap = await getDoc(promoIslaRef);
				if (promoIslaSnap.exists()) setPromoIsla(promoIslaSnap.data());

				try {
					const lugar1Ref = doc(db, 'Lugares', 'Lugar_001');
					const lugar1Snap = await getDoc(lugar1Ref);
					const lugar2Ref = doc(db, 'Lugares', 'Lugar_002');
					const lugar2Snap = await getDoc(lugar2Ref);
					const places = [];
					if (lugar1Snap.exists()) places.push({ id: 'Lugar_001', ...lugar1Snap.data() });
					if (lugar2Snap.exists()) places.push({ id: 'Lugar_002', ...lugar2Snap.data() });
					setNearbyPlaces(places);
				} catch (e) {
				}

				const promocionesRef = collection(db, 'Promociones');
				const volcanQuery = query(promocionesRef, where('Nombre', '==', 'Volcán Masaya'));
				const volcanSnap = await getDocs(volcanQuery);
				if (!volcanSnap.empty) setVolcanMasayaCard(volcanSnap.docs[0].data());
				else {
					const cardPrincipalRef = collection(db, 'CardPrincipal');
					const volcanQ2 = query(cardPrincipalRef, where('Nombre', '==', 'Volcán Masaya'));
					const volcanSnap2 = await getDocs(volcanQ2);
					if (!volcanSnap2.empty) setVolcanMasayaCard(volcanSnap2.docs[0].data());
				}

				const volcanPromoRef = doc(db, 'Promociones', 'Promo_001');
				const volcanPromoSnap = await getDoc(volcanPromoRef);
				if (volcanPromoSnap.exists()) setVolcanMasayaPromo(volcanPromoSnap.data());

				const volcanImgRef = doc(db, 'CardPrincipal', 'Card_002');
				const somotoImgRef = doc(db, 'CardPrincipal', 'Card_003');
				const volcanImgSnap = await getDoc(volcanImgRef);
				const somotoImgSnap = await getDoc(somotoImgRef);
				let newData = [...carouselData];
				if (volcanImgSnap.exists()) {
					newData[0].image = volcanImgSnap.data().ImagenURL;
					newData[0].title = volcanImgSnap.data().Nombre || newData[0].title;
				}
				if (somotoImgSnap.exists()) {
					newData[1].image = somotoImgSnap.data().ImagenURL;
					newData[1].title = somotoImgSnap.data().Nombre || newData[1].title;
				}
				setCarouselData(newData);
			} catch (error) {
				console.error('Error loading home data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchAll();


		const interval = setInterval(() => {
			Animated.sequence([
				Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
				Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
			]).start();
			setCarouselIndex(prev => (prev + 1) % carouselData.length);
		}, 3500);
		return () => { clearInterval(interval); };
	}, [fadeAnim]);

	useEffect(() => {
		if (!user) {
			setRecommendedPlaces([]);
			return;
		}
		let cancelled = false;
		const loadRecommendations = async () => {
			setLoadingRecommended(true);
			try {
				const userRef = doc(db, 'users', user.uid);
				const userSnap = await getDoc(userRef);
				const intereses = userSnap.exists() ? (userSnap.data().intereses || []) : [];
				if (!intereses || intereses.length === 0) {
					setRecommendedPlaces([]);
					setLoadingRecommended(false);
					return;
				}
				const categorias = intereses.slice(0, 10);
				const lugaresRef = collection(db, 'Lugares');
				const q = query(lugaresRef, where('Categoria', 'in', categorias));
				const snap = await getDocs(q);
				if (cancelled) return;
				const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
				setRecommendedPlaces(results);
			} catch (e) {
				console.warn('Error loading personalized recommendations', e);
				setRecommendedPlaces([]);
			} finally {
				setLoadingRecommended(false);
			}
		};
		loadRecommendations();
		return () => { cancelled = true; };
	}, [user]);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, u => setUser(u));
		return () => unsub && unsub();
	}, []);

	const current = carouselData[carouselIndex];

	const STATIC_RECOMMENDED = [
		{
			nombre: 'Playa Maderas',
			imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
			categoria: 'Playa',
			icon: 'beach',
			rating: 4.7,
			destino: '/destinos/playa-maderas',
		},
		{
			nombre: 'Laguna de Apoyo',
			imagen: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
			categoria: 'Laguna',
			icon: 'water',
			rating: 4.8,
			destino: '/destinos/laguna-apoyo',
		},
		{
			nombre: 'Volcán Masaya',
			imagen: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80',
			categoria: 'Volcán',
			icon: 'terrain',
			rating: 4.9,
			destino: '/destinos/volcan-masaya',
		},
		{
			nombre: 'Isla de Ometepe',
			imagen: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
			categoria: 'Isla',
			icon: 'island',
			rating: 4.8,
			destino: '/destinos/ometepe',
		},
	];

	useEffect(() => {
		setSlidesLoaded(prev => (prev.length === carouselData.length ? prev : Array(carouselData.length).fill(false)));
	}, [carouselData.length]);

const messages = [
	{ text: 'La basura en su lugar', icon: 'trash-can-outline', color: '#EC8615' },
	{ text: 'Respeta la flora y la fauna', icon: 'leaf', color: '#31AD4B' },
	{ text: 'No desperdicies el agua', icon: 'water', color: '#008CBF' },
];
const [msgIndex, setMsgIndex] = useState(0);
const windowWidth = Dimensions.get('window').width;
const msgCardWidth = Math.min(windowWidth - 64, 320); 
const msgCardHeight = 60;
const headerHeight = 38;
const sectionSpacing = 10;

const recCardWidth = Math.floor((windowWidth - 48) / 3);

const msgOpacity = useRef(new Animated.Value(1)).current;

useEffect(() => {
	const id = setInterval(() => {
		Animated.timing(msgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
			setMsgIndex(prev => (prev + 1) % messages.length);
			Animated.timing(msgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
		});
	}, 4000);
	return () => clearInterval(id);
}, [msgOpacity]);

	return (
		<View style={{ flex: 1 }}>
			{/* Persistent header (always visible) */}
			<View style={styles.headerFixed}>
				{loading ? (
					<View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 12 }}>
						<SkeletonLoader height={40} width={40} borderRadius={999} style={{ marginRight: 12 }} />
						<SkeletonLoader height={18} width={160} style={{ borderRadius: 6 }} />
						<View style={{ flex: 1 }} />
						<SkeletonLoader height={18} width={140} style={{ borderRadius: 6 }} />
					</View>
				) : (
					<View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 12 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
							{logoUrl ? (
								<Image source={{ uri: logoUrl }} style={[styles.logoImage, { width: 120, height: 32 }]} resizeMode="contain" />
							) : (
								<Text style={{ color: '#008CBF', fontWeight: 'bold', fontSize: 18 }}>DeViaje!</Text>
							)}
						</View>

						{/* spacer to push slogan to the right */}
						<View style={{ flex: 1 }} />

						{/* right-side slogan */}
						<View style={{ alignItems: 'flex-end', justifyContent: 'center', paddingRight: 18 }}>
							<Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: '#444', fontFamily: 'Montserrat-Medium', maxWidth: windowWidth - 190, transform: [{ translateX: 25 }, { translateY: -8 }] }}>Turismo sin límite</Text>
						</View>
					</View>
				)}
			</View>

			{loading ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
					{/* header placeholder: circular logo + slogan bar */}
					<View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 12, marginBottom: 12 }}>
						<SkeletonLoader height={40} width={40} borderRadius={999} style={{ marginRight: 12 }} />
						<SkeletonLoader height={18} width={160} style={{ borderRadius: 6 }} />
					</View>
					{/* message card placeholder */}
					<SkeletonLoader height={msgCardHeight} width={msgCardWidth} style={{ marginBottom: 12, borderRadius: 12 }} />
					{/* featured card placeholder */}
					<SkeletonLoader height={380} width={330} style={{ marginBottom: 20 }} />
					<SkeletonLoader height={30} width={180} />
					<SkeletonLoader height={30} width={180} />
					<SkeletonLoader height={140} width={320} style={{ marginTop: 24 }} />
					<SkeletonLoader height={140} width={320} style={{ marginTop: 12 }} />
					{/* Recomendado para ti*/}
					<View style={{ flexDirection: 'row', marginTop: 20, paddingHorizontal: 8 }}>
						{[0,1,2].map(i => (
							<View key={i} style={{ width: 150, marginRight: 12, borderRadius: 16, backgroundColor: '#fff', paddingBottom: 10 }}>
								<SkeletonLoader height={110} width={150} style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
								<View style={{ padding: 10 }}>
									<SkeletonLoader height={14} width={120} style={{ borderRadius: 6, marginBottom: 6 }} />
									<SkeletonLoader height={12} width={80} style={{ borderRadius: 6 }} />
								</View>
							</View>
						))}
					</View>
				</View>
			) : (
				<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32, paddingTop: headerHeight + sectionSpacing }}>

					{/* Mensaje automático único con fade */}
					<View style={{ alignItems: 'center', marginTop: sectionSpacing }}>
						<Animated.View style={{ borderWidth: 1, borderColor: messages[msgIndex].color, backgroundColor: 'transparent', paddingHorizontal: 14, borderRadius: 12, width: msgCardWidth, height: msgCardHeight, alignItems: 'center', justifyContent: 'center', opacity: msgOpacity }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
								<MaterialCommunityIcons name={messages[msgIndex].icon} size={20} color={messages[msgIndex].color} />
								<Text numberOfLines={2} style={{ color: '#222', fontFamily: 'Montserrat-Bold', textAlign: 'center', marginLeft: 10 }}>{messages[msgIndex].text}</Text>
							</View>
						</Animated.View>
					</View>

					<Animated.View style={[styles.cardDestacada, { opacity: fadeAnim, width: 330, height: 380, marginTop: sectionSpacing, marginBottom: sectionSpacing }]}> 
						<Image
							style={[styles.imgDestacada, { width: 330, height: 380 }]}
							source={current?.image ? { uri: current.image } : undefined}
							resizeMode="cover"
							onLoadEnd={() => setSlidesLoaded(prev => {
								const copy = [...prev];
								copy[carouselIndex] = true;
								return copy;
							})}
						/>
						{current?.image && !slidesLoaded[carouselIndex] && (
							<View style={styles.loaderMini}><ActivityIndicator size="small" color="#283593" /></View>
						)}
						{current?.badge ? (
							<View style={[styles.badgeProx, { top: 10, right: 10, left: 'auto' }]}> 
								<Text style={styles.badgeProxText}>{current.badge}</Text>
							</View>
						) : null}
						<View style={[styles.cardContent, { padding: 18 }]}> 
							<Text style={[styles.cardTitle, { fontSize: 20 }]}>{current?.title}</Text>
							<Text style={[styles.cardSubtitle, { fontSize: 14 }]}>{current?.desc}</Text>
							<TouchableOpacity activeOpacity={0.85} style={[styles.btnDescubre, { backgroundColor: '#222', paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 }]}> 
								<Text style={[styles.btnDescubreText, { fontSize: 12 }]}>{current?.btn || 'Ver más'}</Text>
							</TouchableOpacity>
						</View>
						<View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
							{carouselData.map((_, idx) => (
								<View key={idx} style={{ width: idx === carouselIndex ? 16 : 8, height: 8, borderRadius: 4, backgroundColor: idx === carouselIndex ? '#283593' : '#c5cae9', opacity: idx === carouselIndex ? 0.95 : 0.55 }} />
							))}
						</View>
					</Animated.View>

					{/* Explora Nicaragua */}
					<Text style={styles.sectionTitle}>Explora Nicaragua</Text>
					<Text style={styles.sectionSubtitle}>Vive la Experiencia</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.chipsRow}
					>
						{CATEGORIAS.map(cat => (
							<TouchableOpacity
								key={cat.label}
								style={[styles.chip, { backgroundColor: cat.color }]}
								activeOpacity={0.85}
								accessibilityLabel={`Ir a ${cat.label}`}
								onPress={() => {
									try {
										router.push({ pathname: `/experiences/${cat.slug}` });
									} catch (e) {
										router.push(`/experiences/${cat.slug}`);
									}
								}}
							>
								<MaterialCommunityIcons name={cat.icon} size={20} color="#1a237e" style={styles.chipIcon} />
								<Text style={styles.chipText}>{cat.label}</Text>
							</TouchableOpacity>
						))}
					</ScrollView>


					{/* ¿Qué buscas? */}
					<Text style={styles.buscasTitle}>¿Qué buscas?</Text>
					<Text style={styles.buscasSubtitle}>Explora nuestros servicios turísticos</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.buscasBtnRow}
					>
						<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85} onPress={() => router.push('/services/packages')}>
							<MaterialCommunityIcons name="cube-outline" size={20} color="#283593" style={styles.buscasBtnIcon} />
							<Text style={styles.buscasBtnText}>Paquetes turísticos</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85} onPress={() => router.push('/services/hotels')}>
							<MaterialCommunityIcons name="bed" size={20} color="#283593" style={styles.buscasBtnIcon} />
							<Text style={styles.buscasBtnText}>Hoteles</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85} onPress={() => router.push('/services/restaurants')}>
							<MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#283593" style={styles.buscasBtnIcon} />
							<Text style={styles.buscasBtnText}>Restaurantes</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85} onPress={() => router.push('/services/transport')}>
							<MaterialCommunityIcons name="bus" size={20} color="#283593" style={styles.buscasBtnIcon} />
							<Text style={styles.buscasBtnText}>Transporte</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85} onPress={() => router.push('/services/crafts')}>
							<MaterialCommunityIcons name="hand-heart" size={20} color="#283593" style={styles.buscasBtnIcon} />
							<Text style={styles.buscasBtnText}>Artesanías</Text>
						</TouchableOpacity>
					</ScrollView>

					{/* Recomendado para ti (solo para usuarios autenticados) */}
					{user ? (
						<View style={{ marginTop: 28, marginBottom: 16, paddingHorizontal: 0 }}>
							<Text style={{ fontSize: 19, fontWeight: 'bold', color: '#1976d2', alignSelf: 'center', textAlign: 'center', marginBottom: 2 }}>
								Recomendado para ti
							</Text>
								<Text style={{ fontSize: 13, color: '#888', alignSelf: 'center', textAlign: 'center', marginBottom: 10 }}>
									Descubre lugares increíbles en Managua
								</Text>
							<View style={styles.recommendedGrid}>
								{(recommendedPlaces && recommendedPlaces.length > 0 ? recommendedPlaces : STATIC_RECOMMENDED).map((item, idx) => {
									const img = item.ImagenURL || item.imagen || item.Imagen || item.image;
									const title = item.Nombre || item.nombre || item.titulo || item.title;
									const destino = item.destino || (`/destinos/${(title || '').toLowerCase().replace(/\s+/g,'-')}`);
									return (
										<TouchableOpacity
											key={item.id || idx || title}
											style={[styles.recommendedCard, { width: recCardWidth, height: recCardWidth }]}
											activeOpacity={0.9}
											onPress={() => router.push(destino)}
										>
											<View style={styles.recommendedImgWrap}>
												{img ? <Image source={{ uri: img }} style={styles.recommendedImg} resizeMode="cover" /> : null}
												<View style={styles.recommendedOverlay} />
												<Text style={styles.recommendedTitle} numberOfLines={1}>{title}</Text>
											</View>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>
					) : (
						<View style={{ backgroundColor: '#f6fafd', borderRadius: 16, marginTop: 16, marginHorizontal: 12, padding: 16, borderWidth: 1, borderColor: '#e0e3ea', flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, justifyContent: 'center' }}>
							<MaterialCommunityIcons name="account-plus" size={22} color="#1976d2" style={{ marginRight: 10 }} />
							<View>
								<Text style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 13 }}>Regístrate</Text>
								<Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>para obtener recomendaciones personalizadas según tus gustos</Text>
							</View>
						</View>
					)}

					{/* Promociones Especiales */}
					<Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginTop: 18 }}>Promociones Especiales</Text>
					<Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>Aprovecha estas ofertas limitadas y ahorra en tus experiencias</Text>
					<View style={{ gap: 18 }}>
						{/* Card (datos desde Firestore: Promo_002) */}
						<TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/promotions/Promo_002')}>
							<View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, borderWidth: 1, borderColor: '#e0e3ea' }}>
								<Image source={promoPlaya?.ImagenURL || promoPlaya?.ImageURL || promoPlaya?.Imagen ? { uri: promoPlaya.ImagenURL || promoPlaya.ImageURL || promoPlaya.Imagen } : undefined} style={{ width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor:'#eceff1' }} resizeMode="cover" />
								{/* Top-left type badge */}
								<View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#e53935', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
									<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{promoPlaya?.Tipo || 'Hotel'}</Text>
								</View>
								{/* Top-right discount badge (if exists) */}
								{promoPlaya?.Descuento ? (
									<View style={{ position: 'absolute', top: 14, right: 14, backgroundColor: '#ff7043', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
										<Text style={{ color: '#fff', fontWeight: '700' }}>{`-${promoPlaya.Descuento}%`}</Text>
									</View>
								) : null}

								{/* Validity / date range */}
								{(promoPlaya?.FechaInicio || promoPlaya?.FechaFin) && (
									<View style={{ position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: '#263238', borderRadius: 16, opacity: 0.95, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', flexDirection: 'row', minWidth: 160, justifyContent: 'center', zIndex: 2 }}>
										<MaterialCommunityIcons name="calendar" size={14} color="#fff" style={{ marginRight: 6 }} />
										<Text style={{ color: '#fff', fontSize: 12 }}>{formatDateRange(promoPlaya?.FechaInicio, promoPlaya?.FechaFin)}</Text>
									</View>
								)}

								<View style={{ padding: 16 }}>
									<Text style={{ fontWeight: 'bold', color: '#283593', fontSize: 15, marginBottom: 8, marginTop: 6 }}>{promoPlaya?.Titulo || promoPlaya?.Nombre || 'Promoción'}</Text>
									{/* Location / rating row (if provided) */}
									{promoPlaya?.Ubicacion ? (
										<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
											<MaterialCommunityIcons name="map-marker" size={14} color="#888" />
											<Text style={{ color: '#888', fontSize: 13, marginLeft: 6 }}>{promoPlaya.Ubicacion}</Text>
										</View>
									) : null}

									{/* Short info: GrupoPersonas and HorariosSalida */}
									<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
										{promoPlaya?.GrupoPersonas ? (
											<View style={{ backgroundColor: '#eef7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 }}>
												<Text style={{ color: '#1976d2', fontSize: 12 }}>{promoPlaya.GrupoPersonas}</Text>
											</View>
										) : null}
										{promoPlaya?.HorariosSalida ? (
											<View style={{ backgroundColor: '#eef7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
												<Text style={{ color: '#1976d2', fontSize: 12 }}>{promoPlaya.HorariosSalida}</Text>
											</View>
										) : null}
									</View>

									{/* Includes list */}
									{Array.isArray(promoPlaya?.Incluye) && promoPlaya.Incluye.length > 0 ? (
										<View style={{ marginTop: 8 }}>
											<Text style={{ fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6 }}>Incluye</Text>
											<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
												{promoPlaya.Incluye.map((it, i) => (
													<View key={i} style={{ backgroundColor: '#f1f8e9', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, marginRight: 6, marginBottom: 6 }}>
														<Text style={{ color: '#33691e', fontSize: 12 }}>{it}</Text>
													</View>
												))}
											</View>
										</View>
									) : null}



									{/* CTA */}
									<View style={{ marginTop: 12, alignItems: 'center' }}>
										<TouchableOpacity style={{ backgroundColor: '#008CBF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => router.push('/promotions/Promo_002')}>
											<Text style={{ color: '#fff', fontWeight: '700' }}>Ver detalle</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableOpacity>

					</View>

					{/* Cerca de ti */}
					<View style={{ marginTop: 18, alignItems: 'center' }}>
						<Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 0 }]}>Cerca de ti</Text>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
							{[0,1].map(i => {
								const place = nearbyPlaces[i] || (i===0 ? (volcanMasayaPromo || volcanMasayaCard) : promoIsla);
								const img = place?.ImagenURL || place?.Imagen || place?.ImageURL;
								return (
									<View key={i} style={[styles.cercaCard, { width: 170 }]}> 
										<TouchableOpacity activeOpacity={0.85} onPress={() => { setSelectedPlace(place); setDetailModalVisible(true); }}>
											<Image source={img ? { uri: img } : undefined} style={[styles.cercaImg, { width: 170, height: 100, backgroundColor: img ? undefined : '#eceff1' }]} resizeMode="cover" />
											<View style={[styles.cercaBadge, { backgroundColor: place?.Categoria ? '#26c6da' : (i===0 ? '#ff8a65' : '#26c6da') }]}><Text style={styles.cercaBadgeText}>{place?.Categoria || (i===0 ? 'Volcán' : 'Isla')}</Text></View>
											<View style={styles.cercaRating}><MaterialCommunityIcons name="star" size={15} color="#FFD700" /><Text style={styles.cercaRatingText}>{place?.Rating || (i===0 ? 4.8 : 4.9)}</Text></View>
											<View style={{ padding: 12 }}>
												<Text style={styles.cercaTitle}>{place?.Nombre || (i===0 ? 'Volcán Masaya' : 'Isla de Ometepe')}</Text>
												<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
													<Text style={styles.cercaLoc}>{place?.Ciudad || (i===0 ? 'Masaya' : 'Rivas')}</Text>
													<Text style={[styles.cercaLoc, { marginLeft: 12 }]}>{place?.Duracion || (i===0 ? '4-6 horas' : '2-3 días')}</Text>
												</View>
											</View>
										</TouchableOpacity>
										<View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 12, paddingBottom: 12 }}>
											<TouchableOpacity onPress={() => openPlaceInMaps(place)} style={styles.cercaCTAButtonMap}>
												<Text style={styles.cercaCTAButtonText}>Ver en Mapa</Text>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => { setSelectedPlace(place); setDetailModalVisible(true); }} style={[styles.cercaCTAButtonDetails, { marginLeft: 4 }]}>
												<Text style={styles.cercaCTAButtonTextAlt}>Detalles</Text>
											</TouchableOpacity>
										</View>
									</View>
								);
							})}
						</View>
					</View>

					{/* Details modal for nearby places */}
					<Modal visible={detailModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDetailModalVisible(false)}>
						<View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
							<View style={{ backgroundColor:'#fff', borderTopLeftRadius:12, borderTopRightRadius:12, padding:16, maxHeight: '70%' }}>
								<View style={styles.modalHeaderRow}>
									<TouchableOpacity onPress={() => setDetailModalVisible(false)} style={{ padding:6 }}>
										<Text style={{ color:'#1976d2', fontWeight:'700' }}>Cerrar</Text>
									</TouchableOpacity>
								</View>
								{selectedPlace ? (
									<ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
										{selectedPlace.ImagenURL ? (
											<Image source={{ uri: selectedPlace.ImagenURL }} style={styles.modalImage} resizeMode='cover' />
										) : null}
										<View style={styles.modalTitleRow}>
											<Text style={styles.modalTitle}>{selectedPlace.Nombre}</Text>
											{selectedPlace.Categoria ? <View style={styles.modalBadge}><Text style={styles.modalBadgeText}>{selectedPlace.Categoria}</Text></View> : null}
										</View>
										{selectedPlace.Descripcion ? <Text style={styles.modalDesc}>{selectedPlace.Descripcion}</Text> : null}
										{selectedPlace.Horarios ? (
											<View style={styles.modalSection}>
												<Text style={styles.modalSectionTitle}>Horarios</Text>
												<Text style={styles.modalSectionValue}>{selectedPlace.Horarios.Apertura} — {selectedPlace.Horarios.Cierre}</Text>
											</View>
										) : null}
										{Array.isArray(selectedPlace.Servicios) && selectedPlace.Servicios.length > 0 ? (
											<View style={styles.modalSection}>
												<Text style={styles.modalSectionTitle}>Servicios</Text>
												<View style={styles.modalChipsRow}>
													{selectedPlace.Servicios.map((s, idx) => (
														<View key={idx} style={styles.modalChip}><Text style={styles.modalChipText}>{s}</Text></View>
													))}
												</View>
											</View>
										) : null}
										{/* Ubicación removida por solicitud del usuario */}
										<View style={styles.modalActionsRow}>
											<TouchableOpacity onPress={() => openPlaceInMaps(selectedPlace)} style={styles.cercaCTAButtonMap}>
												<Text style={styles.cercaCTAButtonText}>Ver en Mapa</Text>
											</TouchableOpacity>
											<TouchableOpacity onPress={() => setDetailModalVisible(false)} style={[styles.cercaCTAButtonDetails, { marginLeft: 8 }]}>
												<Text style={styles.cercaCTAButtonTextAlt}>Cerrar</Text>
											</TouchableOpacity>
										</View>
									</ScrollView>
								) : (
									<Text style={{ padding: 12 }}>No hay datos</Text>
								)}
							</View>
						</View>
					</Modal>
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f6fafd',
		paddingTop: 24, 
	},
	logoImage: {
		width: 180,
		height: 48,
		marginBottom: 0,
		transform: [{ translateY: -8 }, { translateX: -10 }],
	},
		header: {
			alignItems: 'center',
			marginBottom: 8,
			marginTop: 32,
			backgroundColor: '#f6fafd',
			paddingVertical: 8,
		},
	logo: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1a237e',
		letterSpacing: 1,
		marginBottom: 2,
	},
	slogan: {
		fontSize: 13,
		color: '#888',
		marginBottom: 8,
	},
		cardDestacada: {
			backgroundColor: '#fff',
			borderRadius: 18,
			width: 320,
			height: 390,
			alignSelf: 'center',
			marginBottom: 18,
			overflow: 'hidden',
			elevation: 3,
			shadowColor: '#000',
			shadowOpacity: 0.08,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 2 },
		},
		imgDestacada: {
			width: 320,
			height: 390,
			borderRadius: 18,
		},
	badgeProx: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: '#283593',
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 4,
		zIndex: 2,
	},
	badgeProxText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 12,
		fontFamily: 'Montserrat-Bold',
	},
		cardContent: {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			padding: 18,
			backgroundColor: 'rgba(0,0,0,0.25)',
			borderBottomLeftRadius: 18,
			borderBottomRightRadius: 18,
			alignItems: 'center',
			justifyContent: 'center',
		},
		cardTitle: {
			color: '#fff',
			fontSize: 22,
			fontWeight: 'bold',
			fontFamily: 'Montserrat-Bold',
			marginBottom: 2,
			textAlign: 'center',
		},
		cardSubtitle: {
			color: '#fff',
			fontSize: 14,
			marginBottom: 10,
			fontFamily: 'Montserrat-Medium',
			textAlign: 'center',
		},
		btnDescubre: {
			backgroundColor: '#444',
			borderRadius: 16,
			alignSelf: 'center',
			paddingHorizontal: 16,
			paddingVertical: 6,
		},
	btnDescubreText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 13,
		fontFamily: 'Montserrat-Bold',
	},
		sectionTitle: {
			fontSize: 20,
			fontWeight: 'bold',
			color: '#008CBF',
			textAlign: 'center',
			marginTop: 8,
			fontFamily: 'Montserrat-Bold',
		},
		sectionSubtitle: {
			fontSize: 15,
			color: '#283593',
			textAlign: 'center',
			marginBottom: 10,
			fontFamily: 'Montserrat-Medium',
		},
	chipsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 12,
		marginBottom: 18,
	},
	chip: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 6,
		marginRight: 8,
	},
		chipIcon: {
			marginRight: 6,
		},
	chipText: {
		fontSize: 14,
		color: '#008CBF',
		fontWeight: '500',
		fontFamily: 'Montserrat-Medium',
	},
		buscasTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			color: '#008CBF',
			textAlign: 'center',
			marginBottom: 2,
			fontFamily: 'Montserrat-Bold',
		},
		buscasSubtitle: {
			fontSize: 13,
			color: '#888',
			textAlign: 'center',
			marginBottom: 12,
			fontFamily: 'Montserrat-Regular',
		},
	buscasBtnRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 8,
		marginBottom: 18,
	},
	buscasBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#008CBF',
		borderRadius: 16,
		backgroundColor: '#fff',
		paddingHorizontal: 14,
		paddingVertical: 6,
		marginRight: 8,
		minWidth: 110,
		minHeight: 36,
	},
	buscasBtnIcon: {
		marginRight: 6,
	},
	buscasBtnText: {
		color: '#283593',
		fontWeight: 'bold',
		fontSize: 14,
		fontFamily: 'Montserrat-Bold',
	},
	cercaGridAdapted: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 12,
		marginBottom: 24,
		backgroundColor: '#f6fafd',
		borderRadius: 18,
		paddingTop: 18,
		paddingBottom: 18,
		paddingHorizontal: 6,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#222',
		textAlign: 'center',
		marginTop: 8,
		marginBottom: 12,
	},
	cercaCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		width: 160,
		margin: 6,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		borderWidth: 1,
		borderColor: '#e0e3ea', 
	},
	cercaImg: {
		width: 160,
		height: 90,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
	cercaBadge: {
		position: 'absolute',
		top: 8,
		left: 8,
		backgroundColor: '#26c6da',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 2,
		zIndex: 2,
	},
	cercaBadgeText: {
		color: '#fff',
		fontSize: 11,
		fontWeight: 'bold',
		fontFamily: 'Montserrat-Bold',
	},
	cercaTitle: {
		marginTop: 6,
		fontSize: 15,
		fontWeight: 'bold',
		color: '#222',
		textAlign: 'left',
		fontFamily: 'Montserrat-Bold',
	},
	cercaLoc: {
		fontSize: 12,
		color: '#888',
		marginBottom: 2,
		textAlign: 'left',
		fontFamily: 'Montserrat-Regular',
	},
	cercaRating: {
		position: 'absolute',
		top: 8,
		right: 8,
		backgroundColor: '#008CBF',
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 7,
		paddingVertical: 2,
		zIndex: 2,
	},
	cercaRatingText: {
		marginLeft: 3,
		fontSize: 12,
		color: '#fff',
		fontWeight: 'bold',
		fontFamily: 'Montserrat-Bold',
	},
	loadingBox: {
		backgroundColor: '#fff',
		marginHorizontal: 16,
		marginBottom: 20,
		borderRadius: 18,
		paddingVertical: 32,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#e0e3ea',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
	},
	loadingText: {
		marginTop: 12,
		color: '#008CBF',
		fontSize: 14,
		fontFamily: 'Montserrat-Medium',
	},
	// details modal styles
	modalHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		paddingBottom: 8,
	},
	modalImage: {
		width: '100%',
		height: 160,
		borderRadius: 8,
		marginBottom: 12,
	},
	modalTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		flex: 1,
		marginRight: 8,
	},
	modalBadge: {
		backgroundColor: '#26c6da',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	modalBadgeText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 12,
	},
	modalDesc: {
		color: '#444',
		marginBottom: 8,
	},
	modalSection: {
		marginBottom: 10,
	},
	modalSectionTitle: {
		fontWeight: '700',
		marginBottom: 4,
	},
	modalSectionValue: {
		color: '#666',
		lineHeight: 18,
	},
	modalChipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	modalChip: {
		backgroundColor: '#f1f8e9',
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 12,
		marginRight: 6,
		marginBottom: 6,
	},
	modalChipText: {
		color: '#33691e',
		fontSize: 12,
	},
	modalActionsRow: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		paddingTop: 6,
	},
	cercaCTAButtonMap: {
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#1976d2',
		backgroundColor: '#fff',
	},
	cercaCTAButtonDetails: {
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 6,
		backgroundColor: '#FFD400',
	},
	cercaCTAButtonText: {
		color: '#1976d2',
		fontWeight: '700',
		fontSize: 11,
	},
	cercaCTAButtonTextAlt: {
		color: '#111',
		fontWeight: '700',
		fontSize: 11,
	},
	loaderMini: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.25)',
	},
		headerFixed: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			backgroundColor: '#fff',
			alignItems: 'center',
			zIndex: 10,
			paddingTop: 24,
			paddingBottom: 12,
		},
	headerPro: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f6fafd',
		paddingTop: 32,
		paddingBottom: 12,
		borderBottomWidth: 0.5,
		borderBottomColor: '#e0e3ea', 
		marginBottom: 8,
	},
	logoPro: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#1a237e',
		letterSpacing: 2,
		marginBottom: 2,
		textAlign: 'center',
	},
	sloganPro: {
		fontSize: 15,
		color: '#888',
		textAlign: 'center',
	},
	headerCard: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: -32,
		paddingBottom: 10,
		marginHorizontal: 0,
		width: '100%', 
		marginTop: -24,
		marginBottom: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
	},
	logoCard: {
		fontSize: 22, 
		fontWeight: 'bold',
		fontFamily: 'Montserrat-Bold',
		color: '#1a237e',
		letterSpacing: 2,
		textAlign: 'center',
		marginBottom: 0, 
		lineHeight: 24, 
	},
	sloganCard: {
		fontSize: 16, 
		color: '#888',
		fontFamily: 'Montserrat-Regular',
		textAlign: 'center',
		marginTop: 0, 
		lineHeight: 18, 
	},
		recommendedGrid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			paddingHorizontal: 12,
			gap: 12,
		},
		recommendedCard: {
			backgroundColor: '#000',
			borderRadius: 12,
			overflow: 'hidden',
			marginBottom: 12,
			elevation: 2,
			shadowColor: '#000',
			shadowOpacity: 0.12,
			shadowRadius: 6,
			shadowOffset: { width: 0, height: 2 },
		},
		recommendedImgWrap: {
			flex: 1,
			width: '100%',
			height: '100%',
			backgroundColor: '#111',
			alignItems: 'center',
			justifyContent: 'center',
		},
		recommendedImg: {
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			width: null,
			height: null,
		},
		recommendedOverlay: {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			height: 36,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		recommendedTitle: {
			fontSize: 13,
			fontWeight: '700',
			color: '#fff',
			textAlign: 'center',
			paddingHorizontal: 6,
		},
});
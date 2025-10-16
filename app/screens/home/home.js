import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import { db } from '../../../firebaseConfig';

const DEFAULT_HEADER_HEIGHT = 96;

const CATEGORIAS = [
	{ label: 'Playas', icon: 'beach', color: '#fffbe6', slug: 'playas' },
	{ label: 'Volcanes', icon: 'terrain', color: '#fff3e0', slug: 'volcanes' },
	{ label: 'Cascadas', icon: 'waterfall', color: '#eafaf1', slug: 'cascadas' },
	{ label: 'Ríos', icon: 'waves', color: '#e3f2fd', slug: 'rios' },
];

export default function Home() {
	const router = useRouter();
	const [logoUrl, setLogoUrl] = useState(null);
	const [promoHotel, setPromoHotel] = useState(null);
	const [promoTour, setPromoTour] = useState(null);
	const [promoIsla, setPromoIsla] = useState(null);
	const [volcanMasayaCard, setVolcanMasayaCard] = useState(null); 
	const [volcanMasayaPromo, setVolcanMasayaPromo] = useState(null); 
	const [loading, setLoading] = useState(true);
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

				const promoHotelRef = doc(db, 'Promociones', 'Promo_002');
				const promoHotelSnap = await getDoc(promoHotelRef);
				if (promoHotelSnap.exists()) setPromoHotel(promoHotelSnap.data());

				const promoIslaRef = doc(db, 'Promociones', 'Promo_004');
				const promoIslaSnap = await getDoc(promoIslaRef);
				if (promoIslaSnap.exists()) setPromoIsla(promoIslaSnap.data());

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
		return () => clearInterval(interval);
	}, [fadeAnim]);

	const current = carouselData[carouselIndex];

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

					{/* Recomendado para ti */}
					<View style={{ marginTop: 28, marginBottom: 16, paddingHorizontal: 0 }}>
						<Text style={{ fontSize: 19, fontWeight: 'bold', color: '#1976d2', alignSelf: 'center', textAlign: 'center', marginBottom: 2 }}>
							Recomendado para ti
						</Text>
							<Text style={{ fontSize: 13, color: '#888', alignSelf: 'center', textAlign: 'center', marginBottom: 10 }}>
								Descubre lugares increíbles en Managua
							</Text>
						<View style={styles.recommendedGrid}>
							{[{
								nombre: 'Playa Maderas',
								imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
								categoria: 'Playa',
								icon: 'beach',
								rating: 4.7,
								destino: '/destinos/playa-maderas',
							}, {
								nombre: 'Laguna de Apoyo',
								imagen: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
								categoria: 'Laguna',
								icon: 'water',
								rating: 4.8,
								destino: '/destinos/laguna-apoyo',
							}, {
								nombre: 'Volcán Masaya',
								imagen: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80',
								categoria: 'Volcán',
								icon: 'terrain',
								rating: 4.9,
								destino: '/destinos/volcan-masaya',
							}, {
								nombre: 'Isla de Ometepe',
								imagen: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
								categoria: 'Isla',
								icon: 'island',
								rating: 4.8,
								destino: '/destinos/ometepe',
							}, {
							nombre: 'Laguna de Xiloa',
							imagen: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=600&q=80',
							categoria: 'Laguna',
							icon: 'water',
							rating: 4.4,
							destino: '/destinos/xiloa',
						}, {
							nombre: 'Mirador de Catarina',
							imagen: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
							categoria: 'Mirador',
							icon: 'eye',
							rating: 4.7,
							destino: '/destinos/catarina',
						}, {
							nombre: 'Reserva El Jaguar',
							imagen: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
							categoria: 'Reserva',
							icon: 'paw',
							rating: 4.6,
							destino: '/destinos/el-jaguar',
						}, {
							nombre: 'Bosawás',
							imagen: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
							categoria: 'Bosque',
							icon: 'forest',
							rating: 4.6,
							destino: '/destinos/bosawas',
						}, {
							nombre: 'Granada Centro',
							imagen: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
							categoria: 'Ciudad',
							icon: 'city',
							rating: 4.5,
							destino: '/destinos/granada',
						}].map((item, idx) => (
								<TouchableOpacity
									key={item.nombre}
									style={[styles.recommendedCard, { width: recCardWidth, height: recCardWidth }]}
									activeOpacity={0.9}
									onPress={() => router.push(item.destino)}
								>
									<View style={styles.recommendedImgWrap}>
										<Image source={{ uri: item.imagen }} style={styles.recommendedImg} resizeMode="cover" />
										<View style={styles.recommendedOverlay} />
										<Text style={styles.recommendedTitle} numberOfLines={1}>{item.nombre}</Text>
									</View>
								</TouchableOpacity>
							))}
						</View>
						{/* Card de registro */}
						<View style={{ backgroundColor: '#f6fafd', borderRadius: 16, marginTop: 16, marginHorizontal: 12, padding: 16, borderWidth: 1, borderColor: '#e0e3ea', flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}>
							<MaterialCommunityIcons name="account-plus" size={22} color="#1976d2" style={{ marginRight: 10 }} />
							<View>
								<Text style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 13 }}>Regístrate</Text>
								<Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>para obtener recomendaciones personalizadas según tus gustos</Text>
							</View>
						</View>
					</View>

					{/* Promociones Especiales */}
					<Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginTop: 18 }}>Promociones Especiales</Text>
					<Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>Aprovecha estas ofertas limitadas y ahorra en tus experiencias</Text>
					<View style={{ gap: 18 }}>
						{/* Card Hotel */}
						<TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/promotions/Promo_002')}>
							<View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, borderWidth: 1, borderColor: '#e0e3ea' }}>
								<Image source={promoHotel?.ImageURL ? { uri: promoHotel.ImageURL } : undefined} style={{ width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor:'#eceff1' }} resizeMode="cover" />
								<View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#e53935', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
									<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Hotel</Text>
								</View>
								<View style={{ position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: '#263238', borderRadius: 16, opacity: 0.95, paddingHorizontal: 18, paddingVertical: 5, alignItems: 'center', flexDirection: 'row', minWidth: 160, justifyContent: 'center', zIndex: 2 }}>
									<MaterialCommunityIcons name="shield-check" size={15} color="#fff" style={{ marginRight: 6 }} />
									<Text style={{ color: '#fff', fontSize: 12 }}>Válido hasta 2025-02-15</Text>
								</View>
								<View style={{ padding: 16 }}>
									<Text style={{ fontWeight: 'bold', color: '#283593', fontSize: 15, marginBottom: 10, marginTop: 8 }}>Hotel Colonial Granada</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
										<MaterialCommunityIcons name="map-marker" size={14} color="#888" />
										<Text style={{ color: '#888', fontSize: 13, marginLeft: 2 }}>Granada</Text>
										<MaterialCommunityIcons name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
										<Text style={{ color: '#444', fontWeight: 'bold', fontSize: 13, marginLeft: 2 }}>4.8</Text>
									</View>
									<Text style={{ color: '#888', fontSize: 13 }}>Habitación doble con desayuno incluido</Text>
									<View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 }}>
										<Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 16 }}>C$ 3200</Text>
										<Text style={{ color: '#888', fontSize: 13, textDecorationLine: 'line-through', marginLeft: 6 }}>C$ 4500</Text>
										<Text style={{ color: '#888', fontSize: 11, marginLeft: 6 }}>Por noche</Text>
									</View>
								</View>
							</View>
						</TouchableOpacity>
						{/* Card Tour */}
						<TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/promotions/Promo_003')}>
							<View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, borderWidth: 1, borderColor: '#e0e3ea' }}>
								<Image source={promoTour?.ImagenURL ? { uri: promoTour.ImagenURL } : undefined} style={{ width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor:'#eceff1' }} resizeMode="cover" />
								<View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#ffa000', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
									<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Tour</Text>
								</View>
								<View style={{ position: 'absolute', top: 120, alignSelf: 'center', backgroundColor: '#263238', borderRadius: 16, opacity: 0.95, paddingHorizontal: 18, paddingVertical: 5, alignItems: 'center', flexDirection: 'row', minWidth: 160, justifyContent: 'center', zIndex: 2 }}>
									<MaterialCommunityIcons name="shield-check" size={15} color="#fff" style={{ marginRight: 6 }} />
									<Text style={{ color: '#fff', fontSize: 12 }}>Válido hasta 2025-01-31</Text>
								</View>
								<View style={{ padding: 16 }}>
									<Text style={{ fontWeight: 'bold', color: '#283593', fontSize: 15, marginBottom: 10, marginTop: 8 }}>Tour Volcán Masaya</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
										<MaterialCommunityIcons name="map-marker" size={14} color="#888" />
										<Text style={{ color: '#888', fontSize: 13, marginLeft: 2 }}>Masaya</Text>
										<MaterialCommunityIcons name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
										<Text style={{ color: '#444', fontWeight: 'bold', fontSize: 13, marginLeft: 2 }}>4.9</Text>
									</View>
									<Text style={{ color: '#888', fontSize: 13 }}>Tour nocturno con cena incluida</Text>
									<View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 }}>
										<Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 16 }}>C$ 1990</Text>
										<Text style={{ color: '#888', fontSize: 13, textDecorationLine: 'line-through', marginLeft: 6 }}>C$ 2800</Text>
										<Text style={{ color: '#888', fontSize: 11, marginLeft: 6 }}>Por noche</Text>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					</View>

					{/* Cerca de ti */}
					<View style={{ marginTop: 18, alignItems: 'center' }}>
						<Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 0 }]}>Cerca de ti</Text>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
							<View style={[styles.cercaCard, { width: 170 }]}> 
								<Image
									source={
										volcanMasayaPromo?.ImagenURL || volcanMasayaPromo?.ImageURL
											? { uri: volcanMasayaPromo.ImagenURL || volcanMasayaPromo.ImageURL }
											: volcanMasayaCard?.ImagenURL || volcanMasayaCard?.ImageURL
											? { uri: volcanMasayaCard.ImagenURL || volcanMasayaCard.ImageURL }
											: undefined
									}
									style={[styles.cercaImg, { width: 170, height: 100 }]}
									resizeMode="cover"
								/>
								<View style={styles.cercaBadge}>
									<Text style={styles.cercaBadgeText}>
										{volcanMasayaPromo?.Descuento ? `-${volcanMasayaPromo.Descuento}%` : 'Volcán'}
									</Text>
								</View>
								<View style={styles.cercaRating}><MaterialCommunityIcons name="star" size={15} color="#FFD700" /><Text style={styles.cercaRatingText}>4.8</Text></View>
								<View style={{ padding: 12 }}>
									<Text style={styles.cercaTitle}>Volcán Masaya</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
										<Text style={styles.cercaLoc}>Masaya</Text>
										<Text style={[styles.cercaLoc, { marginLeft: 12 }]}>4-6 horas</Text>
									</View>
								</View>
							</View>
							<View style={[styles.cercaCard, { width: 170 }]}> 
								<Image source={promoIsla?.ImagenURL ? { uri: promoIsla.ImagenURL } : undefined} style={[styles.cercaImg, { width: 170, height: 100, backgroundColor:'#eceff1' }]} resizeMode="cover" />
								<View style={[styles.cercaBadge, { backgroundColor: '#26c6da' }]}><Text style={styles.cercaBadgeText}>Isla</Text></View>
								<View style={styles.cercaRating}><MaterialCommunityIcons name="star" size={15} color="#FFD700" /><Text style={styles.cercaRatingText}>4.9</Text></View>
								<View style={{ padding: 12 }}>
									<Text style={styles.cercaTitle}>Isla de Ometepe</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
										<Text style={styles.cercaLoc}>Rivas</Text>
										<Text style={[styles.cercaLoc, { marginLeft: 12 }]}>2-3 días</Text>
									</View>
								</View>
							</View>
						</View>
					</View>
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
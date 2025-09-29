import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { db } from '../../../firebaseConfig';

const CATEGORIAS = [
	{ label: 'Playas', icon: 'beach', color: '#fffbe6' },
	{ label: 'Volcanes', icon: 'terrain', color: '#fff3e0' },
	{ label: 'Cascadas', icon: 'waterfall', color: '#eafaf1' },
	{ label: 'Ríos', icon: 'waves', color: '#e3f2fd' },
];

export default function Home() {
	const [logoUrl, setLogoUrl] = useState(null);
	const [promoHotel, setPromoHotel] = useState(null);
	const [promoTour, setPromoTour] = useState(null);
	const [promoIsla, setPromoIsla] = useState(null);
	const [volcanMasayaCard, setVolcanMasayaCard] = useState(null); 
	const [volcanMasayaPromo, setVolcanMasayaPromo] = useState(null); 
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
		const fetchPromoTour = async () => {
			try {
				const promoRef = doc(db, 'Promociones', 'Promo_003');
				const promoSnap = await getDoc(promoRef);
				if (promoSnap.exists()) {
					setPromoTour(promoSnap.data());
				}
			} catch (error) {
				console.error("Error fetching promo tour:", error);
			}
		};
		fetchPromoTour();
		const fetchLogo = async () => {
			try {
				const docRef = doc(db, 'WelcomeSlide', 'E6E9tiI2uJkTZqG5DcAC');
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					setLogoUrl(docSnap.data().ImagenURL);
				}
			} catch (error) {
				console.error("Error fetching logo:", error);
			}
		};
		fetchLogo();

		const fetchPromoHotel = async () => {
			try {
				const promoRef = doc(db, 'Promociones', 'Promo_002');
				const promoSnap = await getDoc(promoRef);
				if (promoSnap.exists()) {
					setPromoHotel(promoSnap.data());
				}
			} catch (error) {
				console.error("Error fetching promo hotel:", error);
			}
		};
		fetchPromoHotel();

		const fetchPromoIsla = async () => {
			try {
				const promoRef = doc(db, 'Promociones', 'Promo_004');
				const promoSnap = await getDoc(promoRef);
				if (promoSnap.exists()) {
					setPromoIsla(promoSnap.data());
				}
			} catch (error) {
				console.error('Error fetching promo isla:', error);
			}
		};
		fetchPromoIsla();

		const fetchVolcanMasayaCard = async () => {
			try {
				const promocionesRef = collection(db, 'Promociones');
				const q = query(promocionesRef, where('Nombre', '==', 'Volcán Masaya'));
				const snap = await getDocs(q);
				if (!snap.empty) {
					setVolcanMasayaCard(snap.docs[0].data());
					return;
				}
				const cardPrincipalRef = collection(db, 'CardPrincipal');
				const q2 = query(cardPrincipalRef, where('Nombre', '==', 'Volcán Masaya'));
				const snap2 = await getDocs(q2);
				if (!snap2.empty) {
					setVolcanMasayaCard(snap2.docs[0].data());
				}
			} catch (error) {
				console.error('Error fetching Volcán Masaya card:', error);
			}
		};
		fetchVolcanMasayaCard();

		const fetchVolcanMasayaPromo = async () => {
			try {
				const promoRef = doc(db, 'Promociones', 'Promo_001');
				const promoSnap = await getDoc(promoRef);
				if (promoSnap.exists()) {
					setVolcanMasayaPromo(promoSnap.data());
				}
			} catch (e) {
				console.error('Error fetching Promo_001:', e);
			}
		};
		fetchVolcanMasayaPromo();

		const fetchCarouselImages = async () => {
			try {
				const volcanRef = doc(db, 'CardPrincipal', 'Card_002');
				const somotoRef = doc(db, 'CardPrincipal', 'Card_003');
				const volcanSnap = await getDoc(volcanRef);
				const somotoSnap = await getDoc(somotoRef);
				let newData = [...carouselData];
				if (volcanSnap.exists()) {
					newData[0].image = volcanSnap.data().ImagenURL;
					newData[0].title = volcanSnap.data().Nombre || newData[0].title;
				}
				if (somotoSnap.exists()) {
					newData[1].image = somotoSnap.data().ImagenURL;
					newData[1].title = somotoSnap.data().Nombre || newData[1].title;
				}
				setCarouselData(newData);
			} catch (error) {
				console.error("Error fetching carousel images:", error);
			}
		};
		fetchCarouselImages();

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

	return (
		<View style={{ flex: 1 }}>
			<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
				<View style={styles.headerCard}>
                    {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="contain" />
                    ) : (
                        <Text style={styles.logoCard}>DEVIAJE!</Text>
                    )}
                    <Text style={styles.sloganCard}>Turismo sin límite</Text>
                </View>

				<Animated.View style={[styles.cardDestacada, { opacity: fadeAnim, width: 330, height: 380, marginBottom: 20 }]}> 
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
						<TouchableOpacity key={cat.label} style={[styles.chip, { backgroundColor: cat.color }]} activeOpacity={0.85}>
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
					<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85}>
						<MaterialCommunityIcons name="cube-outline" size={20} color="#283593" style={styles.buscasBtnIcon} />
						<Text style={styles.buscasBtnText}>Paquetes turísticos</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85}>
						<MaterialCommunityIcons name="bed" size={20} color="#283593" style={styles.buscasBtnIcon} />
						<Text style={styles.buscasBtnText}>Hoteles</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85}>
						<MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#283593" style={styles.buscasBtnIcon} />
						<Text style={styles.buscasBtnText}>Restaurantes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.buscasBtn} activeOpacity={0.85}>
						<MaterialCommunityIcons name="bus" size={20} color="#283593" style={styles.buscasBtnIcon} />
						<Text style={styles.buscasBtnText}>Transporte</Text>
					</TouchableOpacity>
				</ScrollView>

                {/* Promociones Especiales */}
                <Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginTop: 18 }}>Promociones Especiales</Text>
                <Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>Aprovecha estas ofertas limitadas y ahorra en tus experiencias</Text>
                <View style={{ gap: 18 }}>
                    {/* Card Hotel */}
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
                    {/* Card Tour */}
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
								{/* Removed validity overlay per request */}
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
		height: 50,
		marginBottom: 4,
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
			color: '#1a237e',
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
		color: '#1a237e',
		fontWeight: '500',
		fontFamily: 'Montserrat-Medium',
	},
		buscasTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			color: '#283593',
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
		borderColor: '#283593',
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
		backgroundColor: '#1976d2',
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
		color: '#283593',
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
		backgroundColor: '#f6fafd',
		alignItems: 'center',
		zIndex: 10,
		paddingTop: 32,
		paddingBottom: 8,
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
});

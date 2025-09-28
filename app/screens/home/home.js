import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Recuerda: importa aquí tu logo si lo tienes como imagen
// import logoImg from '../../assets/images/logo.png';

// Recuerda: imagen local por defecto para el carrusel
const defaultImg = require('../../assets/images/imagen_de_prueba.jpg');

// Recuerda: datos de ejemplo para el carrusel principal (Hero Card)
const carouselData = [
	{
		title: 'Volcán Masaya',
		desc: 'Naturaleza volcánica espectacular',
		badge: 'Próximamente',
		btn: 'Descubre Nicaragua',
		// Recuerda: cuando conectes Firestore, reemplaza image por la url de la base de datos
		image: null,
	},
	{
		title: 'Cañón de Somoto',
		desc: 'Aventura y paisajes únicos',
		badge: 'Nuevo',
		btn: 'Ver más',
		image: null,
	},
];

// Recuerda: categorías principales
const CATEGORIAS = [
	{ label: 'Playas', icon: 'beach', color: '#fffbe6' },
	{ label: 'Volcanes', icon: 'terrain', color: '#fff3e0' },
	{ label: 'Cascadas', icon: 'waterfall', color: '#eafaf1' },
	{ label: 'Ríos', icon: 'waves', color: '#e3f2fd' },
];

export default function Home() {
	// Recuerda: estado y animación para el carrusel
	const [carouselIndex, setCarouselIndex] = useState(0);
	const fadeAnim = useRef(new Animated.Value(1)).current;

	// Recuerda: aquí puedes traer la imagen de Firestore y actualizar carouselData
	// useEffect(() => { ... }, []);

	// Animación y cambio automático de tarjeta
	useEffect(() => {
		const interval = setInterval(() => {
			Animated.sequence([
				Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
				Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
			]).start();
			setCarouselIndex(prev => (prev + 1) % carouselData.length);
		}, 3500);
		return () => clearInterval(interval);
	}, [fadeAnim]);

	// Recuerda: datos de la tarjeta actual
	const current = carouselData[carouselIndex];

	return (
		<>
			<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
				{/* Puedes agregar el logo y slogan dentro del ScrollView si quieres que se desplace con el contenido */}
				{/* <View style={styles.header}>
					<Text style={styles.logo}>DEVIAJE</Text>
					<Text style={styles.slogan}>Turismo sin límite</Text>
				</View> */}

				{/* Header con fondo blanco, bordes redondeados y centrado */}
				<View style={styles.headerCard}>
					<Text style={styles.logoCard}>DEVIAJE!</Text>
					<Text style={styles.sloganCard}>Turismo sin límite</Text>
				</View>

				{/* Recuerda: Carrusel principal animado */}
				<View style={styles.carouselWrap}>
					<Animated.View style={[styles.cardDestacada, { opacity: fadeAnim }]}> 
						<Image
							source={current.image ? { uri: current.image } : defaultImg}
							style={styles.imgDestacada}
							resizeMode="cover"
						/>
						<TouchableOpacity style={styles.badgeProx} activeOpacity={0.8}>
							<Text style={styles.badgeProxText}>{current.badge}</Text>
						</TouchableOpacity>
						<View style={styles.cardContent}>
							<Text style={styles.cardTitle}>{current.title}</Text>
							<Text style={styles.cardSubtitle}>{current.desc}</Text>
							<TouchableOpacity style={styles.btnDescubre} activeOpacity={0.8}>
								<Text style={styles.btnDescubreText}>{current.btn}</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
					{/* Recuerda: dots de navegación del carrusel */}
					<View style={styles.dotsRow}>
						{carouselData.map((_, idx) => (
							<View key={idx} style={[styles.dot, carouselIndex === idx && styles.dotActive]} />
						))}
					</View>
				</View>

				{/* Recuerda: Título de sección */}
				<Text style={styles.sectionTitle}>Explora Nicaragua</Text>
				<Text style={styles.sectionSubtitle}>Vive la Experiencia</Text>

				{/* Recuerda: Chips de categorías */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
					{CATEGORIAS.map(cat => (
						<TouchableOpacity key={cat.label} style={[styles.chip, { backgroundColor: cat.color }]}> 
							<MaterialCommunityIcons name={cat.icon} size={20} color="#1a237e" style={styles.chipIcon} />
							<Text style={styles.chipText}>{cat.label}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Recuerda: Sección de búsqueda o servicios */}
				<Text style={styles.buscasTitle}>¿Qué buscas?</Text>
				<Text style={styles.buscasSubtitle}>Explora nuestros servicios turísticos</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buscasBtnRow}>
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

				{/* Promociones Especiales: título, subtítulo y cards */}
				<Text style={{ color: '#283593', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginTop: 18 }}>Promociones Especiales</Text>
				<Text style={{ color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>Aprovecha estas ofertas limitadas y ahorra en tus experiencias</Text>
				<View style={{ gap: 18 }}>
					{/* Card 1 estilo referencia mejorada */}
					<View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 8, marginBottom: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, borderWidth: 1, borderColor: '#e0e3ea' }}>
						<Image source={defaultImg} style={{ width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} resizeMode="cover" />
						<View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#e53935', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>% -29%</Text>
						</View>
						<View style={{ position: 'absolute', top: 14, right: 14, backgroundColor: '#1976d2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Hotel</Text>
						</View>
						{/* Etiqueta válido con forma de pastilla mejorada */}
						<View style={{ position: 'absolute', top: 120, left: '46%', transform: [{ translateX: -80 }], backgroundColor: '#263238', borderRadius: 16, opacity: 0.95, paddingHorizontal: 18, paddingVertical: 5, alignItems: 'center', flexDirection: 'row', minWidth: 160, justifyContent: 'center', zIndex: 2 }}>
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
					{/* Card 2 estilo referencia mejorada */}
					<View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 8, marginBottom: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, borderWidth: 1, borderColor: '#e0e3ea' }}>
						<Image source={defaultImg} style={{ width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} resizeMode="cover" />
						<View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#e53935', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>% -29%</Text>
						</View>
						<View style={{ position: 'absolute', top: 14, right: 14, backgroundColor: '#ffa000', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Tour</Text>
						</View>
						{/* Etiqueta válido con forma de pastilla mejorada */}
						<View style={{ position: 'absolute', top: 120, left: '46%', transform: [{ translateX: -80 }], backgroundColor: '#263238', borderRadius: 16, opacity: 0.95, paddingHorizontal: 18, paddingVertical: 5, alignItems: 'center', flexDirection: 'row', minWidth: 160, justifyContent: 'center', zIndex: 2 }}>
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

				{/* Sube aún más la sección 'Cerca de ti' para mayor proximidad al top */}
				<View style={{ marginTop: 18, alignItems: 'center' }}>
					<Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 0 }]}>Cerca de ti</Text>
					{/* Reemplaza las cards de 'Cerca de ti' por el nuevo diseño */}
					{/* Cards de 'Cerca de ti' alineadas una a la izquierda y otra a la derecha */}
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
						<View style={[styles.cercaCard, { width: 170 }]}> {/* Izquierda */}
							<Image source={defaultImg} style={[styles.cercaImg, { width: 170, height: 100 }]} resizeMode="cover" />
							<View style={styles.cercaBadge}><Text style={styles.cercaBadgeText}>Volcán</Text></View>
							<View style={styles.cercaRating}><MaterialCommunityIcons name="star" size={15} color="#FFD700" /><Text style={styles.cercaRatingText}>4.8</Text></View>
							<View style={{ padding: 12 }}>
								<Text style={styles.cercaTitle}>Volcán Masaya</Text>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
									<Text style={styles.cercaLoc}>Masaya</Text>
									<Text style={[styles.cercaLoc, { marginLeft: 12 }]}>4-6 horas</Text>
								</View>
							</View>
						</View>
						<View style={[styles.cercaCard, { width: 170 }]}> {/* Derecha */}
							<Image source={defaultImg} style={[styles.cercaImg, { width: 170, height: 100 }]} resizeMode="cover" />
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
		</>
	);
}

// Recuerda: aquí puedes cambiar los estilos del home
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f6fafd',
		paddingTop: 24, 
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
			marginBottom: 2,
			textAlign: 'center',
		},
		cardSubtitle: {
			color: '#fff',
			fontSize: 14,
			marginBottom: 10,
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
	},
		sectionTitle: {
			fontSize: 20,
			fontWeight: 'bold',
			color: '#1a237e',
			textAlign: 'center',
			marginTop: 8,
		},
		sectionSubtitle: {
			fontSize: 15,
			color: '#283593',
			textAlign: 'center',
			marginBottom: 10,
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
	},
		buscasTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			color: '#283593',
			textAlign: 'center',
			marginBottom: 2,
		},
		buscasSubtitle: {
			fontSize: 13,
			color: '#888',
			textAlign: 'center',
			marginBottom: 12,
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
	},
	cercaTitle: {
		marginTop: 6,
		fontSize: 15,
		fontWeight: 'bold',
		color: '#222',
		textAlign: 'left',
	},
	cercaLoc: {
		fontSize: 12,
		color: '#888',
		marginBottom: 2,
		textAlign: 'left',
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
	},
	// FUTURO: Si agregas más servicios turísticos, actualiza los iconos y textos en los botones de '¿Qué buscas?'.
	// FUTURO: Puedes conectar los botones a navegación usando React Navigation.
	// FUTURO: Si agregas más destinos en 'Cerca de ti', usa un array y mapéalos dinámicamente.
	// FUTURO: Para el header, puedes usar un componente fijo con 'position: absolute' o 'position: sticky' si usas web.
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
	// FUTURO: Si agregas imágenes personalizadas, actualiza la ruta en defaultImg y en los datos de las cards.
	// FUTURO: Si el header fijo tapa el carrusel, ajusta el paddingTop del container o usa un header flotante solo para web.
	// FUTURO: Si agregas navegación, conecta los botones de servicios turísticos con las rutas correspondientes.
	// FUTURO: Si cambias la estructura de las cards, actualiza los estilos y el mapeo de datos.

	// Nuevos estilos para el header profesional
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
		color: '#1a237e',
		letterSpacing: 2,
		textAlign: 'center',
		marginBottom: 0, 
		lineHeight: 24, 
	},
	sloganCard: {
		fontSize: 16, 
		color: '#888',
		textAlign: 'center',
		marginTop: 0, 
		lineHeight: 18, 
	},
});

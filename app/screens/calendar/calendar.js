// Pantalla de calendario turístico
// Aquí puedo personalizar los filtros, colores, iconos y eventos
// Los estilos los tengo al final del archivo
// Si quiero agregar eventos dinámicos, solo conecto el backend y actualizo la sección de eventos
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
// import { LinearGradient } from 'expo-linear-gradient';

// Filtros principales del calendario. Aquí cambio colores, iconos y nombres según lo que necesite.
const FILTERS = [
	{ label: 'Todos', color: '#00AEEF', icon: 'checkbox-multiple-blank-outline' },
	{ label: 'Cultural', color: '#0072BC', icon: 'palette' },
	{ label: 'Gastronómico', color: '#43B02A', icon: 'silverware-fork-knife' },
	{ label: 'Religioso', color: '#8e44ad', icon: 'church' },
	{ label: 'Temporada', color: '#FFD200', icon: 'calendar-star' },
];

// Este es el componente principal de la pantalla de calendario
export default function CalendarScreen() {
	const [selectedFilter, setSelectedFilter] = useState('Todos');
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

			// Aquí puedo agregar lógica para cargar eventos según el filtro y la fecha seleccionada
		return (
		<View style={styles.container}>
					{/* Header con título, subtítulo y mis filtros personalizados */}
					<View style={styles.headerWhite}>
						<View style={styles.headerRow}>
							<MaterialCommunityIcons name="calendar-month" size={28} color="#222" style={{ marginRight: 8 }} />
							<View style={{ flex: 1 }}>
								<Text style={styles.titleBlack}>Calendario Turístico</Text>
								<Text style={styles.subtitleBlack}>Eventos y temporadas de Managua</Text>
							</View>
						</View>
				{/* Filtros de eventos. Si quiero agregar/quitar filtros, lo hago en FILTERS arriba. */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
								{FILTERS.filter(f => f.label !== 'Temporada').map((filter) => (
									<TouchableOpacity
										key={filter.label}
										style={[styles.chip, selectedFilter === filter.label && { backgroundColor: filter.color, borderColor: filter.color }]}
										onPress={() => setSelectedFilter(filter.label)}
										activeOpacity={0.85}
									>
										<MaterialCommunityIcons name={filter.icon} size={16} color={selectedFilter === filter.label ? '#fff' : filter.color} style={styles.chipIcon} />
										<Text style={[styles.chipText, selectedFilter === filter.label && { color: '#fff' }]}>{filter.label}</Text>
									</TouchableOpacity>
								))}
				</ScrollView>
			</View>
			{/* Contenido principal: calendario, leyenda y eventos. Todo lo que quiero mostrar aquí. */}
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
		{/* Calendario interactivo. Aquí personalizo el tema y la lógica de fechas si lo necesito. */}
			<View style={styles.calendarContainer}>
					<Calendar
						current={selectedDate}
						onDayPress={day => setSelectedDate(day.dateString)}
						markedDates={{
							[selectedDate]: { selected: true, selectedColor: '#222' },
						}}
						theme={{
							todayTextColor: '#0072BC',
							arrowColor: '#0072BC',
							selectedDayBackgroundColor: '#222',
							selectedDayTextColor: '#fff',
							backgroundColor: '#fff',
						}}
						style={{ borderRadius: 16 }}
					/>
				</View>
				{/* Leyenda de colores para los tipos de eventos. Si quiero cambiar colores y nombres, lo hago arriba y aquí. */}
					<View style={styles.legendContainer}>
							<View style={styles.legendRow}>
								<View style={[styles.legendDot, { backgroundColor: '#0072BC' }]} />
								<Text style={styles.legendText}>Cultural</Text>
								<View style={[styles.legendDot, { backgroundColor: '#43B02A' }]} />
								<Text style={styles.legendText}>Gastronómico</Text>
								<View style={[styles.legendDot, { backgroundColor: '#8e44ad' }]} />
								<Text style={styles.legendText}>Religioso</Text>
							</View>
						</View>
		{/* Sección de próximos eventos. Aquí puedo mostrar eventos reales si conecto mi base de datos. */}
			<View style={styles.eventsContainer}>
					<View style={styles.eventsHeader}>
						<Text style={styles.eventsTitle}>Próximos Eventos</Text>
						<TouchableOpacity>
							<Text style={styles.eventsLink}>Ver todos</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.noEventsBox}>
						<View style={styles.noEventsIcon}>
							<MaterialCommunityIcons name="calendar-month" size={32} color="#00AEEF" />
						</View>
						<Text style={styles.noEventsText}>No hay eventos próximos</Text>
						<Text style={styles.noEventsSubText}>Revisa otros tipos de eventos o cambia el filtro</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

// Estilos de la pantalla de calendario. Aquí modifico colores, tamaños y bordes
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
		headerWhite: { paddingTop: 36, paddingBottom: 16, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, backgroundColor: '#fff' },
	headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
		titleBlack: { color: '#222', fontSize: 20, fontWeight: 'bold' },
		subtitleBlack: { color: '#222', fontSize: 14, marginTop: 4 },
	chipsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
	chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#00AEEF', paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
	chipIcon: { marginRight: 4 },
	chipText: { color: '#00AEEF', fontWeight: 'bold', fontSize: 13 },
	calendarContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
	legendContainer: { marginBottom: 8 },
		legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
	legendDot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 4 },
	legendText: { fontSize: 12, marginHorizontal: 2 },
	eventsContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
	eventsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	eventsTitle: { fontWeight: 'bold', fontSize: 16, color: '#00AEEF' },
	eventsLink: { color: '#00AEEF', fontWeight: 'bold' },
	noEventsBox: { alignItems: 'center', marginTop: 16 },
	noEventsIcon: { backgroundColor: '#E6F7FB', borderRadius: 32, padding: 16, marginBottom: 8 },
	noEventsText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
	noEventsSubText: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4 },
});

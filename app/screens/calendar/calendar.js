import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';

const FILTERS = [
	{ label: 'Todos', color: '#00AEEF', icon: 'checkbox-multiple-blank-outline' },
	{ label: 'Cultural', color: '#0072BC', icon: 'palette' },
	{ label: 'Gastronómico', color: '#43B02A', icon: 'silverware-fork-knife' },
	{ label: 'Religioso', color: '#8e44ad', icon: 'church' },
	{ label: 'Temporada', color: '#FFD200', icon: 'calendar-star' },
];
export default function CalendarScreen() {
		const [selectedFilter, setSelectedFilter] = useState('Todos');
		const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
		const [eventos, setEventos] = useState([]);
		const [loading, setLoading] = useState(true);
		const [verTodos, setVerTodos] = useState(false);

		useEffect(() => {
			import('../../../firebaseConfig').then(({ db }) => {
				import('firebase/firestore').then(({ collection, onSnapshot }) => {
					const colRef = collection(db, 'Calendario');
					const unsub = onSnapshot(colRef, (snap) => {
						const data = snap.docs.map(d => {
							const raw = d.data();
							return {
								id: d.id,
								nombre: raw.Nombre || '',
								descripcion: raw.Descripción || '',
								tipo: raw.Tipo || 'Cultural',
								fechaInicio: raw.Fecha?.FechaInicio || '',
								fechaFin: raw.Fecha?.FechaFin || '',
							};
						});
						setEventos(data);
						setLoading(false);
					});
					return () => unsub();
				});
			});
		}, []);

		function parseFecha(fechaStr) {
			if (!fechaStr || typeof fechaStr !== 'string') return null;
			if (/\d{4}-\d{2}-\d{2}T/.test(fechaStr)) return new Date(fechaStr);
			const match = typeof fechaStr === 'string' ? fechaStr.match(/(\d{1,2}) de (\w+) de (\d{4}), (\d{1,2}):(\d{2}):(\d{2})/) : null;
			if (match) {
				const dia = match[1];
				const meses = { 'enero':0, 'febrero':1, 'marzo':2, 'abril':3, 'mayo':4, 'junio':5, 'julio':6, 'agosto':7, 'septiembre':8, 'octubre':9, 'noviembre':10, 'diciembre':11 };
				const mes = meses[(match[2]||'').toLowerCase()] ?? 0;
				const anio = match[3];
				const hora = match[4];
				const min = match[5];
				const seg = match[6];
				return new Date(anio, mes, dia, hora, min, seg);
			}
			const soloFecha = typeof fechaStr === 'string' ? fechaStr.match(/(\d{1,2}) de (\w+) de (\d{4})/) : null;
			if (soloFecha) {
				const dia = soloFecha[1];
				const meses = { 'enero':0, 'febrero':1, 'marzo':2, 'abril':3, 'mayo':4, 'junio':5, 'julio':6, 'agosto':7, 'septiembre':8, 'octubre':9, 'noviembre':10, 'diciembre':11 };
				const mes = meses[(soloFecha[2]||'').toLowerCase()] ?? 0;
				const anio = soloFecha[3];
				return new Date(anio, mes, dia);
			}
			return new Date(fechaStr);
		}

		function formatFechaCampo(fecha) {
			if (!fecha) return '';
			if (typeof fecha === 'string') return fecha;
			if (typeof fecha === 'object' && fecha.seconds) {
				const d = new Date(fecha.seconds * 1000);
				return d.toLocaleString('es-NI');
			}
			return String(fecha);
		}

		const markedDates = {};
		eventos.forEach(ev => {
			let fecha = ev.fechaInicio;
			let d = null;
			if (typeof fecha === 'object' && fecha.seconds) {
				d = new Date(fecha.seconds * 1000);
			} else if (typeof fecha === 'string') {
				d = parseFecha(fecha);
			}
			if (d) {
				const key = d.toISOString().split('T')[0];
				let color = '#0072BC';
				if (ev.tipo === 'Gastronómico') color = '#43B02A';
				if (ev.tipo === 'Religioso') color = '#8e44ad';
				markedDates[key] = {
					marked: true,
					dotColor: color,
					selected: key === selectedDate,
					selectedColor: key === selectedDate ? color : undefined,
				};
			}
		});
		if (!markedDates[selectedDate]) {
			markedDates[selectedDate] = { selected: true, selectedColor: '#222' };
		}

		const eventosFiltrados = verTodos
			? eventos
			: eventos.filter(ev => {
				let fecha = ev.fechaInicio;
				let d = null;
				if (typeof fecha === 'object' && fecha.seconds) {
					d = new Date(fecha.seconds * 1000);
				} else if (typeof fecha === 'string') {
					d = parseFecha(fecha);
				}
				if (!d) return false;
				return d.toISOString().split('T')[0] === selectedDate;
			});

		return (
			<View style={styles.container}>
				<View style={styles.headerWhite}>
					<View style={styles.headerRow}>
						<MaterialCommunityIcons name="calendar-month" size={28} color="#222" style={{ marginRight: 8 }} />
						<View style={{ flex: 1 }}>
							<Text style={styles.titleBlack}>Calendario Turístico</Text>
							<Text style={styles.subtitleBlack}>Eventos y temporadas de Managua</Text>
						</View>
					</View>
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
				<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
					<View style={styles.calendarContainer}>
						<Calendar
							current={selectedDate}
							onDayPress={day => { setSelectedDate(day.dateString); setVerTodos(false); }}
							markedDates={markedDates}
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
					<View style={styles.eventsContainer}>
						<View style={styles.eventsHeader}>
							<Text style={styles.eventsTitle}>{verTodos ? 'Todos los Eventos' : 'Eventos del Día'}</Text>
							<TouchableOpacity onPress={() => setVerTodos(v => !v)}>
								<Text style={styles.eventsLink}>{verTodos ? 'Ver por día' : 'Ver todos'}</Text>
							</TouchableOpacity>
						</View>
						{loading ? (
							<View style={styles.noEventsBox}>
								<ActivityIndicator size="large" color="#00AEEF" />
								<Text style={styles.noEventsText}>Cargando eventos...</Text>
							</View>
						) : eventosFiltrados.length === 0 ? (
							<View style={styles.noEventsBox}>
								<View style={styles.noEventsIcon}>
									<MaterialCommunityIcons name="calendar-month" size={32} color="#00AEEF" />
								</View>
								<Text style={styles.noEventsText}>No hay eventos próximos</Text>
								<Text style={styles.noEventsSubText}>Revisa otros tipos de eventos o cambia el filtro</Text>
							</View>
						) : (
							eventosFiltrados.map(ev => {
								let color = '#0072BC', icon = 'palette';
								if (ev.tipo === 'Gastronómico') { color = '#43B02A'; icon = 'silverware-fork-knife'; }
								if (ev.tipo === 'Religioso') { color = '#8e44ad'; icon = 'church'; }
								return (
									<View key={ev.id} style={{ marginBottom: 16, backgroundColor: '#f6fafd', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: color, shadowOpacity: 0.12, shadowRadius: 6 }}>
										<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
											<MaterialCommunityIcons name={icon} size={24} color="#fff" />
										</View>
										<View style={{ flex: 1 }}>
											<Text style={{ fontWeight: 'bold', fontSize: 15, color }}>{ev.nombre}</Text>
											<Text style={{ fontSize: 13, color: '#222', marginBottom: 4 }}>{ev.descripcion}</Text>
											<Text style={{ fontSize: 12, color: '#888' }}>Inicio: {formatFechaCampo(ev.fechaInicio)}</Text>
											<Text style={{ fontSize: 12, color: '#888' }}>Fin: {formatFechaCampo(ev.fechaFin)}</Text>
										</View>
									</View>
								);
							})
						)}
					</View>
				</ScrollView>
			</View>
		);
}
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

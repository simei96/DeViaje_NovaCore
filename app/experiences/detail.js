
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK = {
    'v1': {
        id: 'v1',
        nombre: 'Volcán Masaya',
        lugar: 'Parque Nacional Volcán Masaya',
        precio: 450,
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1400&q=80',
        descripcion: 'Volcán activo con cráter de lava visible. Experiencia nocturna disponible.',
        duracion: '4 horas',
        dificultad: 'Moderada',
        mejor_epoca: 'Todo el año',
        incluye: ['Lava activa', 'Tour nocturno', 'Museo incluido'],
        lat: 11.9842,
        lng: -86.1681,
    },
    '1': {
        id: '1', nombre: 'Playa Maderas', lugar: 'San Juan del Sur', precio: 450, rating: 4.9,
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
        descripcion: 'Clases de surf y atardeceres espectaculares.', duracion: '4 horas', dificultad: 'Fácil', mejor_epoca: 'Nov - Abr', incluye: ['Clase de surf', 'Transporte'], lat:11.0, lng:-85.0
    }
};

export default function ExperienceDetail(){
    const params = useLocalSearchParams();
    const router = useRouter();
    const id = params.id || '';
    const [saved, setSaved] = useState(false);

    const item = useMemo(() => {
        return MOCK[id] || Object.values(MOCK)[0];
    }, [id]);

    const onShare = async () => {
        try {
            await Share.share({ message: `${item.nombre} - ${item.lugar} - Precio C$ ${item.precio}` });
        } catch (e) {
            Alert.alert('Error', 'No se pudo compartir');
        }
    };

    const openMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps'));
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f6f8fb' }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={{ position: 'relative' }}>
                    <Image source={{ uri: item.img }} style={styles.hero} />

                    <View style={styles.headerOverlay}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><MaterialCommunityIcons name="arrow-left" size={20} color="#222" /></TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => setSaved(s => !s)} style={styles.iconBtn}><MaterialCommunityIcons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? '#ff6b6b' : '#222'} /></TouchableOpacity>
                        <TouchableOpacity onPress={onShare} style={styles.iconBtn}><MaterialCommunityIcons name="share-variant" size={20} color="#222" /></TouchableOpacity>
                    </View>

                    <View style={styles.badgesRow}>
                        <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>C$ {item.precio}.00</Text></View>
                        <View style={styles.ratingBadge}><MaterialCommunityIcons name="star" color="#FFD54A" /><Text style={styles.ratingText}>{item.rating}</Text></View>
                    </View>
                </View>

                <View style={styles.contentCard}>
                    <Text style={styles.title}>{item.nombre}</Text>
                    <Text style={styles.location}><MaterialCommunityIcons name="map-marker" size={14} color="#888" />  {item.lugar}</Text>

                    <View style={{ height: 12 }} />
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.paragraph}>{item.descripcion}</Text>

                    <View style={{ height: 12 }} />
                    <Text style={styles.sectionTitle}>Información</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}><Text style={styles.infoLabel}>Duración</Text><Text style={styles.infoValue}>{item.duracion}</Text></View>
                        <View style={styles.infoBox}><Text style={styles.infoLabel}>Dificultad</Text><Text style={styles.infoValue}>{item.dificultad || 'Moderada'}</Text></View>
                        <View style={styles.infoBox}><Text style={styles.infoLabel}>Mejor época</Text><Text style={styles.infoValue}>{item.mejor_epoca || 'Todo el año'}</Text></View>
                        <View style={styles.infoBox}><Text style={styles.infoLabel}>Precio</Text><Text style={styles.infoValue}>C$ {item.precio}.00</Text></View>
                    </View>

                    <View style={{ height: 12 }} />
                    <Text style={styles.sectionTitle}>Lo que incluye</Text>
                    {item.incluye.map((inc) => (
                        <View key={inc} style={styles.includeRow}><MaterialCommunityIcons name="check-circle" color="#10b981" size={18} style={{ marginRight: 8 }} /><Text>{inc}</Text></View>
                    ))}

                    <View style={{ height: 12 }} />
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    <View style={styles.mapCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700' }}>{item.lugar}</Text>
                            <Text style={{ color: '#666', marginTop: 6 }}>Lat: {item.lat}, Lng: {item.lng}</Text>
                        </View>
                        <TouchableOpacity style={styles.mapBtn} onPress={openMaps}><MaterialCommunityIcons name="google-maps" size={18} color="#fff" /><Text style={{ color: '#fff', marginLeft: 8 }}>Ver en Google Maps</Text></TouchableOpacity>
                    </View>

                    <View style={{ height: 12 }} />
                    <Text style={styles.sectionTitle}>Importante</Text>
                    <View style={styles.importantBox}><Text>Recuerda llevar documento de identidad y seguir las indicaciones del guía. Actividad sujeta a condiciones climáticas.</Text></View>

                    <View style={{ height: 24 }} />
                    <View style={styles.bottomRow}>
                        <View>
                            <Text style={{ color: '#666' }}>Precio total</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700' }}>C$ {item.precio}.00</Text>
                        </View>
                        <TouchableOpacity style={styles.reserveBtn}><Text style={{ color: '#fff', fontWeight: '700' }}>Reservar Ahora</Text></TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: { width: '100%', height: 260, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
    headerOverlay: { position: 'absolute', top: 36, left: 12, right: 12, flexDirection: 'row', alignItems: 'center' },
    iconBtn: { backgroundColor: '#fff', width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginLeft: 8, opacity: 0.95 },
    badgesRow: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    priceBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
    priceBadgeText: { color: '#fff', fontWeight: '700' },
    ratingBadge: { backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
    ratingText: { color: '#fff', marginLeft: 6, fontWeight: '700' },
    contentCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, padding: 16, elevation: 2 },
    title: { fontSize: 20, fontWeight: '700' },
    location: { color: '#666', marginTop: 6 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    paragraph: { color: '#444', lineHeight: 20 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    infoBox: { width: '48%', backgroundColor: '#f6f9ff', padding: 12, borderRadius: 8, marginBottom: 8 },
    infoLabel: { color: '#666', fontSize: 12 },
    infoValue: { fontWeight: '700', marginTop: 6 },
    includeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    mapCard: { backgroundColor: '#eef6ff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
    mapBtn: { backgroundColor: '#1976d2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
    importantBox: { backgroundColor: '#fff7e6', padding: 12, borderRadius: 8, marginTop: 8 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    reserveBtn: { backgroundColor: '#0ba4e0', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 8 },
});


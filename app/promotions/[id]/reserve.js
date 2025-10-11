import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../firebaseConfig';

export default function ReservationScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  const router = useRouter();

  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [reserveDate, setReserveDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta de crédito');
  const [cardNumber, setCardNumber] = useState('');
  const [cards, setCards] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [services, setServices] = useState([]); 
  const [selectedServices, setSelectedServices] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);

  const [statusMsg, setStatusMsg] = useState('');
  const [processing, setProcessing] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const ref = doc(db, 'Promociones', id);
        const snap = await getDoc(ref);
    if (snap.exists()) setPromo(snap.data());
        const u = auth.currentUser;
        if (u) {
          try {
            const userRef = doc(db, 'users', u.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              if (data.nombre) {
                const parts = String(data.nombre).split(' ');
                setFirstName(parts.slice(0, -1).join(' ') || parts[0] || '');
                setLastName(parts.length > 1 ? parts[parts.length - 1] : '');
              }
              if (data.telefono) setPhone(data.telefono);
              if (Array.isArray(data.cards)) setCards(data.cards);
            }
          } catch (e) {
            console.warn('Error loading user profile for reservation', e);
          }
        }
        try {
          const tmp = await AsyncStorage.getItem(`reserve_tmp_${id}`);
          if (tmp) {
            const parsed = JSON.parse(tmp);
            if (parsed.firstName) setFirstName(parsed.firstName);
            if (parsed.lastName) setLastName(parsed.lastName);
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.reserveDate) { setReserveDate(parsed.reserveDate); setSelectedDate(parsed.selectedDate || null); setSelectedTime(parsed.selectedTime || null); }
            if (parsed.adults) setAdults(parsed.adults);
            if (parsed.children) setChildren(parsed.children);
            if (parsed.babies) setBabies(parsed.babies);
            if (parsed.selectedServices) setSelectedServices(parsed.selectedServices);
          }
        } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn('Error loading promo for reservation', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!promo) return;
    const parseTimesFromString = (s) => {
      if (!s) return [];
      const cleaned = String(s).replace(/\s+y\s+|\s+Y\s+|\s+and\s+|\n/g, ',').replace(/\s+\/\s+/, ',');
      const parts = cleaned.split(/[,|;]+/).map(p => p.trim()).filter(Boolean);
      return parts.map(p => p.replace(/\s+/g, ''));
    };

    const candidates = [];
    const rawDates = promo.FechasDisponibles || promo.availableDates || promo.available || promo.Fechas || promo.Dates;
    if (Array.isArray(rawDates) && rawDates.length > 0) {
      rawDates.forEach(d => {
        const iso = (() => {
          if (!d) return null;
          if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
          const dd = new Date(d);
          if (!isNaN(dd.getTime())) return dd.toISOString().slice(0,10);
          return null;
        })();
        if (iso) {
          const times = promo.Horarios || promo.Horario || (promo.InformacionImportante && promo.InformacionImportante.horarios) || '';
          candidates.push({ date: iso, times: parseTimesFromString(times) });
        }
      });
    } else {
      const startDate = parseDate(promo.FechaInicio || promo.FechaDesde || promo.startDate);
      const endDate = parseDate(promo.FechaFin || promo.FechaHasta || promo.endDate);
      const today = new Date();
      const maxDays = 30;
      for (let i = 0; i < maxDays; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        if (startDate && d < startDate) continue;
        if (endDate && d > endDate) continue;
        const iso = d.toISOString().slice(0,10);
        candidates.push({ date: iso, times: [] });
      }
      const timesSource = promo.Horarios || promo.Horario || (promo.InformacionImportante && promo.InformacionImportante.horarios) || promo.horarios || '';
      const timesParsed = parseTimesFromString(timesSource);
      if (timesParsed.length > 0) candidates.forEach(c => c.times = timesParsed);
    }
    setAvailableDates(candidates);
  }, [promo]);
  useEffect(() => {
    if (!promo) return;
    const rawServices = promo.Servicios || promo.Services || promo.servicios || promo.Incluye || promo.includes || [];
    const parsed = Array.isArray(rawServices) ? rawServices.map((s, idx) => {
      if (typeof s === 'string') return { id: `srv_${idx}`, title: s, price: 0, selected: false };
      return { id: s.id || `srv_${idx}`, title: s.title || s.Nombre || s.name || 'Servicio', price: Number(s.price || s.Precio || s.price_cents || 0) || 0, selected: !!s.selected };
    }) : [];
    setServices(parsed);
  }, [promo]);
  useEffect(() => {
    const servicesTotal = services.filter(s => selectedServices.includes(s.id)).reduce((acc, s) => acc + (s.price || 0), 0);
    const basePrice = Number(promo?.Precio || promo?.PrecioBase || promo?.Price || 0) || 0;
    const peopleCount = Math.max(1, adults + children + babies);
    const itemsTotal = basePrice * peopleCount + servicesTotal;
    const computedIva = Math.round(itemsTotal * 0.15 * 100) / 100;
    const computedTotal = Math.round((itemsTotal + computedIva) * 100) / 100;
    setSubtotal(Math.round(itemsTotal * 100) / 100);
    setIva(computedIva);
    setTotal(computedTotal);
  }, [services, selectedServices, adults, children, babies, promo]);

  useEffect(() => () => { timersRef.current.forEach(t => clearTimeout(t)); timersRef.current = []; }, []);

  const parseDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const parts = String(s).split('-');
    if (parts.length === 3) {
      const [y, m, dd] = parts.map(p => parseInt(p, 10));
      return new Date(y, m - 1, dd);
    }
    return null;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!promo) return <View style={styles.center}><Text>No se encontró la promoción.</Text></View>;

  const startDate = parseDate(promo.FechaInicio || promo.FechaDesde || promo.startDate);
  const endDate = parseDate(promo.FechaFin || promo.FechaHasta || promo.endDate);

  const ensureLoggedIn = () => {
    const user = auth.currentUser;
    if (!user) {
      const returnTo = encodeURIComponent(`/promotions/${id}/reserve`);
      (async () => {
        try {
          await AsyncStorage.setItem(`reserve_tmp_${id}`, JSON.stringify({ firstName, lastName, phone, reserveDate, selectedDate, selectedTime, adults, children, babies, selectedServices }));
        } catch (e) { /* ignore */ }
      })();
      Alert.alert('Debes iniciar sesión', 'Regístrate o inicia sesión para continuar.', [
        { text: 'Cancelar' },
        { text: 'Ir a Perfil', onPress: () => {
          router.replace(`/profile?returnTo=${returnTo}`);
          setTimeout(() => router.replace(`/screens/profile?returnTo=${returnTo}`), 200);
        } }
      ]);
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!ensureLoggedIn()) return;
      if (!firstName || !lastName || !phone || (!selectedDate && !reserveDate)) { Alert.alert('Faltan datos', 'Completa todos los campos'); return; }
    const chosenDateStr = selectedDate || reserveDate;
    const chosen = parseDate(chosenDateStr);
    if (!chosen || isNaN(chosen.getTime())) { Alert.alert('Fecha inválida', 'Selecciona una fecha válida'); return; }
    if (startDate && chosen < startDate) { Alert.alert('Fecha fuera de rango', `La fecha debe ser desde ${startDate.toLocaleDateString()}`); return; }
    if (endDate && chosen > endDate) { Alert.alert('Fecha fuera de rango', `La fecha debe ser hasta ${endDate.toLocaleDateString()}`); return; }

    try {
      const user = auth.currentUser;
      const selectedCard = (paymentMethod === 'Tarjeta de crédito' && selectedCardIndex != null && cards[selectedCardIndex]) ? cards[selectedCardIndex] : null;
      const docRef = await addDoc(collection(db, 'Reservas'), {
        userId: user.uid,
        promoId: id,
        title: promo.Titulo || promo.Nombre || 'Promoción',
        firstName, lastName, phone,
        paymentMethod,
        cardLast4: selectedCard ? selectedCard.last4 : null,
        reserveDate: chosenDateStr + (selectedTime ? ` ${selectedTime}` : ''),
        people: { adults, children, babies },
        services: services.filter(s => selectedServices.includes(s.id)).map(s => ({ id: s.id, title: s.title, price: s.price })),
        priceSummary: { subtotal, iva, total },
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setProcessing(true);
      setStatusMsg('Verificando datos...');
      const t1 = setTimeout(() => setStatusMsg('Realizando pago...'), 1200);
      const t2 = setTimeout(async () => {
        setStatusMsg('Reserva realizada con éxito');
        setProcessing(false);
        try { await updateDoc(doc(db, 'Reservas', docRef.id), { status: 'confirmed', confirmedAt: serverTimestamp(), paymentCompleted: true }); } catch (e) { console.warn('Update reserva failed', e); }
        Alert.alert('Reserva realizada con éxito', 'Tu reserva ha sido confirmada. Puedes verificarla en la sección Reservas.');
        try { router.replace('/(tabs)'); } catch (e) { }
      }, 3200);
      timersRef.current.push(t1, t2);

    } catch (e) {
      console.error('Error creating reservation', e);
      Alert.alert('Error', 'No se pudo crear la reserva. Intenta de nuevo.');
      setProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { marginBottom: 6 }]}>{promo.Titulo || promo.Nombre}</Text>
      <Text style={{ color: '#666', marginBottom: 12 }}>{promo.DescripcionCorta || promo.Descripcion || ''}</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Cantidad de personas</Text>
      <View style={styles.qtyRowStack}>
        <View style={styles.qtyRowItem}>
          <View style={styles.qtyTextBlock}>
            <Text style={styles.qtyLabel}>Adultos</Text>
            <Text style={styles.qtySublabel}>Mayores de 12 años</Text>
          </View>
          <View style={styles.qtyControlsRow}>
            <TouchableOpacity onPress={() => setAdults(a => Math.max(1, a - 1))} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>–</Text></TouchableOpacity>
            <View style={styles.qtyCountBox}><Text style={styles.qtyCount}>{adults}</Text></View>
            <TouchableOpacity onPress={() => setAdults(a => a + 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.qtyRowItem}>
          <View style={styles.qtyTextBlock}>
            <Text style={styles.qtyLabel}>Niños</Text>
            <Text style={styles.qtySublabel}>3-12 años (30% descuento)</Text>
          </View>
          <View style={styles.qtyControlsRow}>
            <TouchableOpacity onPress={() => setChildren(c => Math.max(0, c - 1))} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>–</Text></TouchableOpacity>
            <View style={styles.qtyCountBox}><Text style={styles.qtyCount}>{children}</Text></View>
            <TouchableOpacity onPress={() => setChildren(c => c + 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.qtyRowItem}>
          <View style={styles.qtyTextBlock}>
            <Text style={styles.qtyLabel}>Bebés</Text>
            <Text style={styles.qtySublabel}>0-2 años (gratis)</Text>
          </View>
          <View style={styles.qtyControlsRow}>
            <TouchableOpacity onPress={() => setBabies(b => Math.max(0, b - 1))} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>–</Text></TouchableOpacity>
            <View style={styles.qtyCountBox}><Text style={styles.qtyCount}>{babies}</Text></View>
            <TouchableOpacity onPress={() => setBabies(b => b + 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.totalPersonsBox}>
        <Text style={styles.totalPersonsLabel}>Total personas:</Text>
        <View style={styles.totalBadge}><Text style={styles.totalBadgeText}>{(adults + children + babies)} {(adults + children + babies) === 1 ? 'persona' : 'personas'}</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Servicios</Text>
      {services.length === 0 ? <Text style={{ color: '#888', marginBottom: 8 }}>No hay servicios adicionales.</Text> : (
        services.map(s => (
          <TouchableOpacity key={s.id} onPress={() => {
            setSelectedServices(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]);
          }} style={{ padding: 12, borderRadius: 10, backgroundColor: selectedServices.includes(s.id) ? '#e8f0ff' : '#f9fafb', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700' }}>{s.title}</Text>
              <Text style={{ color: '#666', fontSize: 13 }}>{s.description || ''}</Text>
            </View>
            <Text style={{ fontWeight: '700' }}>C$ {s.price}</Text>
          </TouchableOpacity>
        ))
      )}

      <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Subtotal</Text>
          <Text>C$ {subtotal}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text>IVA</Text>
          <Text>C$ {iva}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontWeight: '700' }}>Total</Text>
          <Text style={{ fontWeight: '700' }}>C$ {total}</Text>
        </View>
      </View>
      <Text style={styles.label}>Selecciona fecha</Text>
      {availableDates && availableDates.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
          {availableDates.map((d) => (
            <TouchableOpacity key={d.date} onPress={() => { setSelectedDate(d.date); setSelectedTime(null); setReserveDate(d.date); }} style={{ padding: 10, borderRadius: 8, backgroundColor: selectedDate === d.date ? '#e8f0ff' : '#f6fafd', marginRight: 8 }}>
              <Text style={{ fontWeight: '700' }}>{new Date(d.date).toLocaleDateString()}</Text>
              {d.times && d.times.length > 0 ? <Text style={{ color: '#666', fontSize: 12 }}>{d.times.join(' • ')}</Text> : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <TextInput style={styles.input} value={reserveDate} onChangeText={setReserveDate} placeholder="YYYY-MM-DD" />
      )}

      {selectedDate ? (
        <>
          <Text style={styles.label}>Horario</Text>
          {availableDates.find(x => x.date === selectedDate)?.times?.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {availableDates.find(x => x.date === selectedDate).times.map((t) => (
                <TouchableOpacity key={t} onPress={() => { setSelectedTime(t); }} style={{ padding: 8, borderRadius: 8, backgroundColor: selectedTime === t ? '#e8f0ff' : '#f6fafd', marginRight: 8 }}>
                  <Text>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: '#888', marginBottom: 12 }}>No hay horarios disponibles listados para esta fecha.</Text>
          )}
        </>
      ) : null}
      <Text style={styles.label}>Método de pago</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {['Tarjeta de crédito','Transferencia','Efectivo'].map(m => (
          <TouchableOpacity key={m} onPress={() => setPaymentMethod(m)} style={[styles.payOption, paymentMethod === m ? styles.payOptionActive : null]}>
            <Text>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {paymentMethod === 'Tarjeta de crédito' ? (
        <>
          {cards && cards.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.label, { marginBottom: 8 }]}>Selecciona una tarjeta</Text>
              {cards.map((card, idx) => (
                <TouchableOpacity key={idx} onPress={() => { setSelectedCardIndex(idx); }} style={{ padding: 10, backgroundColor: selectedCardIndex === idx ? '#e8f0ff' : '#f6fafd', borderRadius: 8, marginBottom: 8 }}>
                  <Text>{card.brand || card.type || 'Tarjeta'} •••• {card.last4}  {card.vence ? `(Vence ${card.vence})` : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: '#888', marginBottom: 8 }}>No tienes tarjetas guardadas. Puedes agregarlas en Perfil → Editar Perfil.</Text>
          )}
        </>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} disabled={processing}>
          <Text style={{ color: '#1976d2' }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit} disabled={processing || (paymentMethod === 'Tarjeta de crédito' && (!selectedCardIndex && selectedCardIndex !== 0))}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{processing ? 'Procesando...' : 'Pagar y reservar'}</Text>
        </TouchableOpacity>
      </View>

      {statusMsg ? <Text style={{ marginTop: 12, color: processing ? '#1976d2' : '#2e7d32' }}>{statusMsg}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  label: { fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 12 },
  primaryBtn: { flex: 1, backgroundColor: '#FFD400', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1976d2', backgroundColor: '#fff' },
  payOption: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginRight: 8 },
  payOptionActive: { borderColor: '#1976d2' },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  sectionTitle: { color: '#1976d2', fontWeight: '700', marginBottom: 8, marginTop: 6 },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  qtyRowStack: { marginBottom: 12 },
  qtyRowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
  qtyTextBlock: { flex: 1 },
  qtyControlsRow: { flexDirection: 'row', alignItems: 'center', width: 150, justifyContent: 'flex-end' },
  qtyColumn: { alignItems: 'center', flex: 1 },
  qtyLabel: { fontWeight: '700', marginBottom: 6 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyCount: { width: 42, textAlign: 'center', fontSize: 16 },
  qtyBtnText: { fontSize: 18, lineHeight: 18 },
  qtySublabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  qtyCountBox: { width: 42, height: 36, alignItems: 'center', justifyContent: 'center' },
  totalPersonsBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f1f4f8', padding: 10, borderRadius: 8, marginBottom: 12 },
  totalPersonsLabel: { color: '#666' },
  totalBadge: { backgroundColor: '#e9eef8', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  totalBadgeText: { color: '#283593', fontWeight: '700' },
});

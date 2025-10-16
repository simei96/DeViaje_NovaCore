import { addDoc, collection, doc, getDocs, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const PLACE_COLLECTION_CANDIDATES = [
  'Hoteles', 'hotels', 'Hotels',
  'Paquetes', 'Packages', 'packages',
  'Restaurants', 'Restaurantes', 'restaurants',
  'Crafts', 'Artesanias', 'crafts',
  'Transport', 'Transportes', 'transport'
];

export async function saveRating({ reservationId, userId, destination, stars, comment }) {
  const ratingsRef = collection(db, 'ratings');
  const payload = {
    reservationId: reservationId || null,
    userId: userId || null,
    destination: destination || '',
    stars: Number(stars) || 0,
    comment: comment || '',
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(ratingsRef, payload);

  try {
    for (const col of PLACE_COLLECTION_CANDIDATES) {
      const fieldCandidates = ['Titulo', 'titulo', 'title', 'name', 'nombre'];
      for (const field of fieldCandidates) {
        const q = query(collection(db, col), where(field, '==', destination));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const placeDoc = snap.docs[0];
          const placeRatingsRef = collection(db, `${col}/${placeDoc.id}/ratings`);
          const newPlaceRatingRef = await addDoc(placeRatingsRef, {
            ratingId: docRef.id,
            reservationId: reservationId || null,
            userId: userId || null,
            stars: Number(stars) || 0,
            comment: comment || '',
            createdAt: serverTimestamp(),
          });

          try {
            const placeDocRef = doc(db, col, placeDoc.id);
            await runTransaction(db, async (trx) => {
              const snap = await trx.get(placeDocRef);
              const currentCount = (snap.exists() && snap.data().ratingCount) ? Number(snap.data().ratingCount) : 0;
              const currentAvg = (snap.exists() && snap.data().ratingAvg) ? Number(snap.data().ratingAvg) : 0;
              const added = Number(stars) || 0;
              const newCount = currentCount + 1;
              const newAvg = newCount === 0 ? added : Math.round(((currentAvg * currentCount + added) / newCount) * 100) / 100;
              trx.update(placeDocRef, { ratingCount: newCount, ratingAvg: newAvg });
            });
          } catch (txErr) {
            console.warn('Could not update place aggregates in transaction:', txErr);
          }

          if (reservationId) {
            const reservaRef = doc(db, 'Reservas', reservationId);
            await updateDoc(reservaRef, { rated: true, ratingId: docRef.id });
          }
          return { ratingId: docRef.id, attachedTo: `${col}/${placeDoc.id}` };
        }
      }
    }
  } catch (e) {
    console.warn('Error attaching rating to place document:', e);
  }

  if (reservationId) {
    try {
      const reservaRef = doc(db, 'Reservas', reservationId);
      await updateDoc(reservaRef, { rated: true, ratingId: docRef.id });
    } catch (e) {
      console.warn('Could not mark reservation as rated:', e);
    }
  }

  return { ratingId: docRef.id };
}

export default { saveRating };
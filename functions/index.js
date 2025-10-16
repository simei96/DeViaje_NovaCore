const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const stripeSecret = functions.config().stripe && functions.config().stripe.secret;
let stripe;
if (stripeSecret) {
  stripe = require('stripe')(stripeSecret);
}

async function checkPaymentStatus(paymentRef) {
  if (!stripe) return null;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentRef);
    return paymentIntent && paymentIntent.status; // 'succeeded', 'requires_payment_method', etc.
  } catch (e) {
    console.warn('Stripe check failed for', paymentRef, e && e.message ? e.message : e);
    return null;
  }
}

exports.pollPendingPayments = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const snapshot = await db.collection('Reservas').where('Estado', '==', 'Pendiente').where('paymentRef', '!=', null).limit(100).get();
  if (snapshot.empty) return null;
  const updates = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const paymentRef = data.paymentRef;
    if (!paymentRef) continue;
    const status = await checkPaymentStatus(paymentRef);
    if (!status) continue;
    if (status === 'succeeded' || status === 'paid' || status === 'completed') {
      updates.push(doc.ref.update({ Estado: 'Confirmada', PagoVerificado: true, paymentInfo: { provider: 'stripe', id: paymentRef, status, checkedAt: admin.firestore.FieldValue.serverTimestamp() } }));
    } else {
      updates.push(doc.ref.update({ 'paymentInfo.lastChecked': admin.firestore.FieldValue.serverTimestamp(), 'paymentInfo.lastStatus': status }));
    }
  }
  await Promise.all(updates);
  return { processed: snapshot.size };
});

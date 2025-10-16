# Cloud Functions (polling) for payment verification

This folder contains a Firebase Cloud Function that periodically polls your payment provider (example: Stripe) to check the status of pending payments and updates the Firestore `Reservas` documents accordingly.

Setup
1. Install dependencies and deploy from the `functions` directory:

```bash
cd functions
npm install
```

2. Configure your payment provider secret (example for Stripe):

```bash
firebase functions:config:set stripe.secret="sk_test_..."
```

3. Deploy functions:

```bash
firebase deploy --only functions:pollPendingPayments
```

Behavior
- The scheduled function runs every 5 minutes and queries `Reservas` where `Estado == 'Pendiente'` and `paymentRef != null`.
- For each reservation it calls the payment provider to check the status. If it detects success (e.g. `succeeded`), it updates the reservation with `{ Estado: 'Confirmada', PagoVerificado: true, paymentInfo: { ... } }`.

Notes
- This is a template that uses Stripe; adapt `checkPaymentStatus` for other providers.
- Ensure the `paymentRef` field is set at the moment the reservation/payment is created (e.g., store the Stripe PaymentIntent id or provider-specific reference).

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const { type, data } = event;

  // Abonnement annulé ou paiement échoué
  if (type === 'customer.subscription.deleted' || type === 'invoice.payment_failed') {
    const customerId = data.object.customer;
    await supabase
      .from('users')
      .update({ subscription_status: 'inactive' })
      .eq('stripe_customer_id', customerId);

    // Désactiver les commissions liées
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (user) {
      await supabase
        .from('commissions')
        .update({ status: 'inactive' })
        .eq('referred_id', user.id);
    }
  }

  // Paiement mensuel réussi → recréer la commission du mois
  if (type === 'invoice.payment_succeeded') {
    const customerId = data.object.customer;
    const { data: user } = await supabase
      .from('users')
      .select('id, referred_by')
      .eq('stripe_customer_id', customerId)
      .single();

    if (user?.referred_by) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', user.referred_by)
        .single();

      if (referrer) {
        const month = new Date().toISOString().slice(0, 7);
        await supabase.from('commissions').upsert({
          referrer_id: referrer.id,
          referred_id: user.id,
          amount: 1.00,
          month,
          status: 'active',
        }, { onConflict: 'referrer_id,referred_id,month' });
      }
    }
  }

  res.status(200).json({ received: true });
}

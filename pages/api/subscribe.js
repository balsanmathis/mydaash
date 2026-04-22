import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CODE-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, fullName, password, paymentMethodId, referralCode } = req.body;

  if (!email || !fullName || !password || !paymentMethodId) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  try {
    // 1. Vérifier si l'email existe déjà
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    // 2. Vérifier le code de parrainage
    let referrerId = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode.toUpperCase())
        .single();
      if (referrer) referrerId = referrer.id;
    }

    // 3. Créer le client Stripe
    const customer = await stripe.customers.create({
      email,
      name: fullName,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 4. Créer l'abonnement Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    if (subscription.status !== 'active') {
      return res.status(400).json({ error: 'Paiement refusé, vérifie ta carte' });
    }

    // 5. Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Générer un code de parrainage unique
    let newReferralCode;
    let isUnique = false;
    while (!isUnique) {
      newReferralCode = generateReferralCode();
      const { data: check } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', newReferralCode)
        .single();
      if (!check) isUnique = true;
    }

    // 7. Créer l'utilisateur en base
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        full_name: fullName,
        password_hash: passwordHash,
        referral_code: newReferralCode,
        referred_by: referralCode || null,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        subscription_status: 'active',
        role: 'client',
      })
      .select()
      .single();

    if (userError) throw userError;

    // 8. Enregistrer la commission si parrainage
    if (referrerId) {
      const month = new Date().toISOString().slice(0, 7);
      await supabase.from('commissions').insert({
        referrer_id: referrerId,
        referred_id: newUser.id,
        amount: 1.00,
        month,
        status: 'active',
      });
    }

    return res.status(200).json({
      success: true,
      referralCode: newReferralCode,
      userId: newUser.id,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}

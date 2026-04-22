import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Subscribe() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);

  useEffect(() => {
    const ref = router.query.ref;
    if (ref) setReferralCode(ref.toUpperCase());

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      const s = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
      const els = s.elements({
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#7C3AED',
            colorBackground: '#1A1530',
            colorText: '#EDE9FE',
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '8px',
          }
        }
      });
      const cardNumber = els.create('cardNumber', { style: { base: { color: '#EDE9FE', fontSize: '14px', '::placeholder': { color: '#6B5E8A' } } } });
      const cardExpiry = els.create('cardExpiry', { style: { base: { color: '#EDE9FE', fontSize: '14px', '::placeholder': { color: '#6B5E8A' } } } });
      const cardCvc = els.create('cardCvc', { style: { base: { color: '#EDE9FE', fontSize: '14px', '::placeholder': { color: '#6B5E8A' } } } });
      cardNumber.mount('#card-number');
      cardExpiry.mount('#card-expiry');
      cardCvc.mount('#card-cvc');
      setStripe(s);
      setElements({ cardNumber, cardExpiry, cardCvc });
    };
    document.head.appendChild(script);
  }, [router.query]);

  const applyReferral = () => {
    if (referralCode.length >= 6) setReferralValid(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!fullName || !email || !password) return setError('Merci de remplir tous les champs.');
    if (password.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères.');

    setLoading(true);
    const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.cardNumber,
      billing_details: { name: fullName, email },
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, password, paymentMethodId: paymentMethod.id, referralCode }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || 'Erreur serveur');
    setSuccess(data.referralCode);
  };

  if (success) return (
    <>
      <Head><title>Bienvenue sur MyDaash !</title></Head>
      <style>{`
        body { background: #080612; color: #EDE9FE; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
      `}</style>
      <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10B98122', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>✓</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Bienvenue sur MyDaash !</h1>
        <p style={{ color: '#6B5E8A', fontSize: 14, marginBottom: 16 }}>Ton abonnement est actif. Voici ton code de parrainage :</p>
        <div style={{ background: '#7C3AED22', border: '1px solid #7C3AED', color: '#A78BFA', fontFamily: 'monospace', fontSize: 22, fontWeight: 700, padding: '12px 24px', borderRadius: 12, letterSpacing: '0.12em', display: 'inline-block', margin: '8px 0 16px' }}>{success}</div>
        <p style={{ color: '#6B5E8A', fontSize: 12, marginBottom: 24 }}>Partage ce code — tu gagnes 1€/mois par filleul actif</p>
        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Accéder à mon dashboard →
        </button>
      </div>
    </>
  );

  return (
    <>
      <Head>
        <title>MyDaash — S'abonner</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080612; color: #EDE9FE; font-family: 'DM Sans', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        input { width: 100%; background: #1A1530; border: 1px solid #2D2550; border-radius: 10px; padding: 11px 14px; color: #EDE9FE; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: #7C3AED; }
        input::placeholder { color: #6B5E8A; opacity: 0.5; }
        label { display: block; font-size: 12px; color: #6B5E8A; margin-bottom: 6px; font-weight: 500; }
        .stripe-box { background: #1A1530; border: 1px solid #2D2550; border-radius: 10px; padding: 11px 14px; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>My<span style={{ color: '#A78BFA' }}>Daash</span></span>
        </div>

        <div style={{ background: '#110D20', border: '1px solid #2D2550', borderRadius: 20, overflow: 'hidden' }}>
          {/* Plan */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #2D2550', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C3AED22', border: '1px solid #7C3AED', color: '#A78BFA', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>✦ Offre unique</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>MyDaash Pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
              <span style={{ fontSize: 18, color: '#6B5E8A' }}>€</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800 }}>3,99</span>
              <span style={{ fontSize: 13, color: '#6B5E8A' }}>/ mois</span>
            </div>
            {['Dashboards illimités', 'Personnalisation complète', 'Suivi des revenus', 'Code de parrainage (+1€/filleul/mois)'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', flexShrink: 0 }}>✓</div>
                {f}
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 11, color: '#6B5E8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Créer ton compte</div>

            <div style={{ marginBottom: 12 }}>
              <label>Prénom et nom</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@exemple.com" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Code de parrainage (optionnel)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} placeholder="CODE-XXXXXX" style={{ flex: 1 }} />
                <button onClick={applyReferral} style={{ background: referralValid ? '#10B981' : '#7C3AED22', border: `1px solid ${referralValid ? '#10B981' : '#7C3AED'}`, color: referralValid ? 'white' : '#A78BFA', fontSize: 12, fontWeight: 600, padding: '0 14px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                  {referralValid ? '✓ Actif' : 'Appliquer'}
                </button>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#6B5E8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Paiement sécurisé</div>

            <div style={{ marginBottom: 12 }}>
              <label>Numéro de carte</label>
              <div className="stripe-box"><div id="card-number" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label>Expiration</label>
                <div className="stripe-box"><div id="card-expiry" /></div>
              </div>
              <div>
                <label>CVC</label>
                <div className="stripe-box"><div id="card-cvc" /></div>
              </div>
            </div>

            {error && <div style={{ background: '#F43F5E22', border: '1px solid #F43F5E55', color: '#F87171', fontSize: 12, padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, padding: 15, fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Traitement...' : "S'abonner pour 3,99 €/mois"}
            </button>

            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#6B5E8A' }}>
              🔒 Paiement sécurisé par Stripe
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6B5E8A' }}>
          Déjà un compte ? <a href="/login" style={{ color: '#A78BFA', textDecoration: 'none' }}>Se connecter</a>
        </div>
      </div>
    </>
  );
}

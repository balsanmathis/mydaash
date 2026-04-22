import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) return setError('Merci de remplir tous les champs.');
    setLoading(true);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error || 'Erreur serveur');

    localStorage.setItem('mydaash_token', data.token);
    localStorage.setItem('mydaash_user', JSON.stringify(data.user));
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>MyDaash — Connexion</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080612; color: #EDE9FE; font-family: 'DM Sans', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        input { width: 100%; background: #1A1530; border: 1px solid #2D2550; border-radius: 10px; padding: 12px 14px; color: #EDE9FE; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: #7C3AED; }
        input::placeholder { color: #6B5E8A; opacity: 0.5; }
        label { display: block; font-size: 12px; color: #6B5E8A; margin-bottom: 6px; font-weight: 500; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            My<span style={{ color: '#A78BFA' }}>Daash</span>
          </div>
          <p style={{ fontSize: 14, color: '#6B5E8A' }}>Connecte-toi à ton compte</p>
        </div>

        <div style={{ background: '#110D20', border: '1px solid #2D2550', borderRadius: 20, padding: '28px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />

          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@exemple.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          {error && (
            <div style={{ background: '#F43F5E22', border: '1px solid #F43F5E55', color: '#F87171', fontSize: 12, padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6B5E8A' }}>
          Pas encore de compte ? <a href="/subscribe" style={{ color: '#A78BFA', textDecoration: 'none' }}>S'abonner pour 3,99€/mois</a>
        </div>
      </div>
    </>
  );
}

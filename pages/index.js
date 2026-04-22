import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>MyDaash — Créez vos dashboards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --accent: #7C3AED;
          --accent-light: #A78BFA;
          --bg: #080612;
          --card: #110D20;
          --border: #2D2550;
          --text: #EDE9FE;
          --muted: #6B5E8A;
        }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid var(--border);
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .logo span { color: var(--accent-light); }
        .nav-links { display: flex; gap: 12px; }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .btn-outline:hover { border-color: var(--accent); }
        .btn-primary {
          background: var(--accent);
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .hero {
          text-align: center;
          padding: 100px 20px 60px;
          max-width: 700px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #7C3AED22;
          border: 1px solid var(--accent);
          color: var(--accent-light);
          font-size: 12px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 20px;
          margin-bottom: 24px;
          letter-spacing: 0.04em;
        }
        h1 {
          font-family: 'Syne', sans-serif;
          font-size: 56px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        h1 span { color: var(--accent-light); }
        .hero p {
          font-size: 18px;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 36px;
        }
        .hero-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-big {
          background: var(--accent);
          border: none;
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          transition: opacity 0.2s;
        }
        .btn-big:hover { opacity: 0.9; }
        .btn-big-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .price-tag {
          font-size: 13px;
          color: var(--muted);
          margin-top: 16px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 900px;
          margin: 60px auto;
          padding: 0 20px;
        }
        .feature-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }
        .feature-icon {
          font-size: 24px;
          margin-bottom: 12px;
        }
        .feature-card h3 {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }
        .referral-section {
          max-width: 600px;
          margin: 0 auto 80px;
          padding: 0 20px;
          text-align: center;
        }
        .referral-card {
          background: var(--card);
          border: 1px solid var(--accent);
          border-radius: 20px;
          padding: 32px;
        }
        .referral-card h2 {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .referral-card p {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }
        .money-highlight {
          font-size: 36px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          color: var(--accent-light);
          margin: 16px 0;
        }
        @media (max-width: 600px) {
          h1 { font-size: 36px; }
          .features-grid { grid-template-columns: 1fr; }
          nav { padding: 16px 20px; }
        }
      `}</style>

      <nav>
        <div className="logo">My<span>Daash</span></div>
        <div className="nav-links">
          <button className="btn-outline" onClick={() => router.push('/login')}>Se connecter</button>
          <button className="btn-primary" onClick={() => router.push('/subscribe')}>Commencer</button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-badge">✦ 3,99 € / mois seulement</div>
        <h1>Crée tes <span>dashboards</span> pro en quelques clics</h1>
        <p>MyDaash te permet de visualiser tes données, suivre tes revenus et gagner de l'argent en parrainant tes amis.</p>
        <div className="hero-btns">
          <button className="btn-big" onClick={() => router.push('/subscribe')}>Démarrer maintenant →</button>
          <button className="btn-big-outline" onClick={() => router.push('/login')}>J'ai déjà un compte</button>
        </div>
        <p className="price-tag">3,99 €/mois · Sans engagement · Annulable à tout moment</p>
      </div>

      <div className="features-grid">
        {[
          { icon: '◫', title: 'Dashboard builder', desc: 'Crée des dashboards visuels avec des graphiques, tableaux et métriques personnalisables.' },
          { icon: '◈', title: 'Suivi des revenus', desc: 'Visualise tes gains en temps réel, tes filleuls actifs et tes commissions du mois.' },
          { icon: '◎', title: 'Parrainage qui paie', desc: 'Chaque filleul actif te rapporte 1 €/mois automatiquement, pour toujours.' },
          { icon: '▦', title: 'Thèmes & polices', desc: '6 thèmes, 5 polices, couleurs personnalisables — ton dashboard, ton style.' },
          { icon: '⊞', title: 'Multi-blocs', desc: 'Métriques, barres, courbes, camembert, tableaux, progressions — tout y est.' },
          { icon: '✦', title: 'Accès immédiat', desc: 'Ton compte est actif dès le paiement. Aucune attente, aucune validation.' },
        ].map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="referral-section">
        <div className="referral-card">
          <h2>Gagne de l'argent en dormant</h2>
          <div className="money-highlight">1 € / filleul / mois</div>
          <p>Partage ton code unique avec tes amis. Chaque mois qu'ils restent abonnés, tu touches 1 €. 10 filleuls = 10 €/mois. 100 filleuls = 100 €/mois.</p>
          <button className="btn-big" style={{ marginTop: 24 }} onClick={() => router.push('/subscribe')}>
            Obtenir mon code →
          </button>
        </div>
      </div>
    </>
  );
}

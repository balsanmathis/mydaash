import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('overview');

  useEffect(() => {
    const stored = localStorage.getItem('mydaash_user');
    const token = localStorage.getItem('mydaash_token');
    if (!stored || !token) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem('mydaash_token');
    localStorage.removeItem('mydaash_user');
    router.push('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const navItems = [
    { id: 'overview', icon: '▦', label: 'Vue générale' },
    { id: 'dashboards', icon: '◫', label: 'Mes dashboards' },
    { id: 'revenus', icon: '◈', label: 'Revenus' },
    { id: 'parrainage', icon: '◎', label: 'Parrainage' },
    ...(isAdmin ? [{ id: 'admin', icon: '⊞', label: 'Tous les clients' }] : []),
  ];

  return (
    <>
      <Head>
        <title>MyDaash — Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --accent: #7C3AED; --accent-light: #A78BFA;
          --bg: #080612; --card: #110D20; --card2: #1A1530;
          --text: #EDE9FE; --muted: #6B5E8A; --border: #2D2550;
          --success: #10B981; --warning: #F59E0B;
        }
        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; margin: 0; }
        .app { display: flex; height: 100vh; overflow: hidden; }
        .sidebar { width: 210px; background: var(--card); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 0; flex-shrink: 0; }
        .logo { padding: 20px 16px; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; border-bottom: 1px solid var(--border); }
        .logo span { color: var(--accent-light); }
        .nav { flex: 1; padding: 12px 0; }
        .nav-section { font-size: 9px; color: var(--muted); padding: 10px 16px 4px; text-transform: uppercase; letter-spacing: 0.08em; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; font-size: 13px; color: var(--muted); cursor: pointer; transition: background 0.1s; }
        .nav-item:hover { background: var(--card2); color: var(--text); }
        .nav-item.active { background: #7C3AED22; color: var(--accent-light); border-right: 2px solid var(--accent); }
        .nav-icon { font-size: 14px; width: 16px; text-align: center; }
        .sidebar-footer { padding: 14px 16px; border-top: 1px solid var(--border); }
        .user-row { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 30px; height: 30px; border-radius: 50%; background: #7C3AED22; border: 1px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--accent-light); flex-shrink: 0; }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 12px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 10px; color: var(--muted); }
        .logout-btn { font-size: 11px; color: var(--muted); cursor: pointer; background: none; border: none; padding: 0; font-family: 'DM Sans', sans-serif; }
        .logout-btn:hover { color: var(--text); }
        .main { flex: 1; overflow-y: auto; padding: 24px; }
        .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
        .badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
        .badge-admin { background: #7C3AED22; color: var(--accent-light); border: 1px solid var(--accent); }
        .badge-client { background: #10B98122; color: var(--success); border: 1px solid var(--success); }
        .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .metric { background: var(--card2); border-radius: 10px; padding: 14px; }
        .metric-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .metric-value { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; }
        .metric-sub { font-size: 11px; color: var(--success); margin-top: 4px; }
        .section { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 14px; font-family: 'Syne', sans-serif; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; padding: 6px 8px; color: var(--muted); font-weight: 500; border-bottom: 1px solid var(--border); font-size: 10px; text-transform: uppercase; }
        td { padding: 9px 8px; color: var(--text); border-bottom: 1px solid var(--border); }
        tr:last-child td { border-bottom: none; }
        .status { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
        .status-active { background: #10B98122; color: var(--success); }
        .status-inactive { background: #F59E0B22; color: var(--warning); }
        .ref-code { background: #7C3AED22; color: var(--accent-light); font-family: monospace; font-size: 14px; font-weight: 700; padding: 8px 16px; border-radius: 10px; border: 1px solid var(--accent); display: inline-block; letter-spacing: 0.1em; }
        .mini-bar { display: flex; align-items: flex-end; gap: 3px; height: 48px; }
        .bar { background: var(--accent); border-radius: 2px 2px 0 0; width: 100%; opacity: 0.7; }
        .bar:last-child { opacity: 1; }
        .copy-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: 11px; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .copy-btn:hover { border-color: var(--accent); color: var(--accent-light); }
        .step { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
        .step-num { width: 24px; height: 24px; border-radius: 50%; background: #7C3AED22; color: var(--accent-light); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid var(--accent); }
        .step-text h4 { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
        .step-text p { font-size: 11px; color: var(--muted); }
      `}</style>

      <div className="app">
        <div className="sidebar">
          <div className="logo">My<span>Daash</span></div>
          <div className="nav">
            <div className="nav-section">Menu</div>
            {navItems.map(item => (
              <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="user-row">
              <div className="avatar">{user.fullName?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="user-info">
                <div className="user-name">{user.fullName}</div>
                <div className="user-role">{isAdmin ? 'Administrateur' : 'Client'}</div>
              </div>
              <button className="logout-btn" onClick={logout}>↩</button>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="page-title">{navItems.find(n => n.id === page)?.label}</div>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-client'}`}>{isAdmin ? '⊞ Admin' : '✦ Pro'}</span>
          </div>

          {page === 'overview' && (
            <>
              <div className="cards-grid">
                <div className="metric"><div className="metric-label">Revenus ce mois</div><div className="metric-value">{isAdmin ? '566 €' : '7,99 €'}</div><div className="metric-sub">↑ +12% vs mois dernier</div></div>
                <div className="metric"><div className="metric-label">{isAdmin ? 'Clients totaux' : 'Filleuls actifs'}</div><div className="metric-value">{isAdmin ? '142' : '2'}</div><div className="metric-sub">↑ {isAdmin ? '+12 ce mois' : '+1 ce mois'}</div></div>
                <div className="metric"><div className="metric-label">Dashboards créés</div><div className="metric-value">{isAdmin ? '348' : '3'}</div></div>
                <div className="metric"><div className="metric-label">{isAdmin ? 'Revenu net' : 'Abonnement'}</div><div className="metric-value" style={{fontSize:16,paddingTop:6}}>{isAdmin ? '424 €' : <span className="status status-active">Actif</span>}</div></div>
              </div>
              <div className="section">
                <div className="section-title">Activité récente</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:4,height:60}}>
                  {[40,55,35,70,60,80,65,90,75,95,70,100].map((v,i) => (
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                      <div className="bar" style={{height:`${Math.round(v*0.55)}px`}}/>
                      <span style={{fontSize:8,color:'var(--muted)'}}>{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {page === 'dashboards' && (
            <>
              <div className="section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <div className="section-title" style={{margin:0}}>Mes dashboards</div>
                  <button style={{background:'var(--accent)',color:'white',border:'none',padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Syne, sans-serif'}}>+ Nouveau</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                  {['Dashboard ventes','Suivi clients','KPIs mensuels'].map((n,i) => (
                    <div key={i} style={{background:'var(--card2)',border:'1px solid var(--border)',borderRadius:10,padding:14,cursor:'pointer'}}>
                      <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>{n}</div>
                      <div style={{display:'flex',alignItems:'flex-end',gap:3,height:32}}>
                        {[50,70,45,85,60].map((v,j) => <div key={j} className="bar" style={{height:`${Math.round(v*0.35)}px`}}/>)}
                      </div>
                      <div style={{fontSize:10,color:'var(--muted)',marginTop:8}}>Modifié il y a {i+1}j</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="section">
                <div className="section-title">Personnalisation</div>
                <div style={{display:'flex',gap:24,alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:11,color:'var(--muted)',marginBottom:6}}>Couleur principale</div>
                    <div style={{display:'flex',gap:6}}>
                      {['#7C3AED','#10B981','#3B82F6','#F43F5E'].map(c => (
                        <div key={c} style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',border:`2px solid ${c==='#7C3AED'?'white':'transparent'}`}}/>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:'var(--muted)',marginBottom:6}}>Langue</div>
                    <select style={{background:'var(--card2)',border:'1px solid var(--border)',color:'var(--text)',borderRadius:8,padding:'5px 8px',fontSize:12,fontFamily:'DM Sans, sans-serif'}}>
                      <option>Français</option><option>English</option><option>Español</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {page === 'revenus' && (
            <>
              <div className="cards-grid">
                <div className="metric"><div className="metric-label">Ce mois</div><div className="metric-value">{isAdmin ? '566 €' : '7,99 €'}</div></div>
                <div className="metric"><div className="metric-label">Total cumulé</div><div className="metric-value">{isAdmin ? '2 840 €' : '23,97 €'}</div></div>
                <div className="metric"><div className="metric-label">{isAdmin ? 'Commissions versées' : 'Filleuls actifs'}</div><div className="metric-value">{isAdmin ? '142 €' : '2'}</div></div>
                <div className="metric"><div className="metric-label">{isAdmin ? 'Revenu net' : 'Prochain paiement'}</div><div className="metric-value" style={{fontSize:isAdmin?24:16,paddingTop:isAdmin?0:6}}>{isAdmin ? '424 €' : 'Dans 8j'}</div></div>
              </div>
              <div className="section">
                <div className="section-title">{isAdmin ? 'Revenus par mois' : 'Détail du parrainage'}</div>
                {isAdmin ? (
                  <table>
                    <thead><tr><th>Mois</th><th>MRR brut</th><th>Commissions</th><th>Net</th></tr></thead>
                    <tbody>
                      {[['Janvier','180 €','45 €','135 €'],['Février','240 €','60 €','180 €'],['Mars','350 €','87 €','263 €'],['Avril','566 €','142 €','424 €']].map((r,i) => (
                        <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td style={{color:'var(--warning)'}}>{r[2]}</td><td style={{color:'var(--success)',fontWeight:600}}>{r[3]}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    <thead><tr><th>Filleul</th><th>Depuis</th><th>Statut</th><th>Gain/mois</th></tr></thead>
                    <tbody>
                      <tr><td>alex****@gmail.com</td><td>Jan 2025</td><td><span className="status status-active">Actif</span></td><td style={{color:'var(--success)'}}>1,00 €</td></tr>
                      <tr><td>marie****@gmail.com</td><td>Fév 2025</td><td><span className="status status-active">Actif</span></td><td style={{color:'var(--success)'}}>1,00 €</td></tr>
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {page === 'parrainage' && (
            <>
              <div className="section">
                <div className="section-title">Mon code de parrainage</div>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  <div className="ref-code">{user.referralCode || 'CODE-ADMIN1'}</div>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(`https://mydaash.vercel.app/subscribe?ref=${user.referralCode || 'CODE-ADMIN1'}`)}>
                    Copier le lien
                  </button>
                </div>
                <div style={{fontSize:13,color:'var(--muted)'}}>Partage ce lien — tu gagnes <strong style={{color:'var(--accent-light)'}}>1€/mois</strong> pour chaque personne abonnée.</div>
              </div>
              <div className="section">
                <div className="section-title">Comment ça marche</div>
                <div className="step"><div className="step-num">1</div><div className="step-text"><h4>Partage ton lien</h4><p>Envoie ton lien de parrainage à tes contacts</p></div></div>
                <div className="step"><div className="step-num">2</div><div className="step-text"><h4>Ils s'abonnent</h4><p>Ils créent un compte avec ton code</p></div></div>
                <div className="step"><div className="step-num">3</div><div className="step-text"><h4>Tu gagnes</h4><p>1€ par mois tant qu'ils restent abonnés</p></div></div>
              </div>
            </>
          )}

          {page === 'admin' && isAdmin && (
            <>
              <div className="cards-grid">
                <div className="metric"><div className="metric-label">Clients totaux</div><div className="metric-value">142</div></div>
                <div className="metric"><div className="metric-label">Abonnements actifs</div><div className="metric-value">138</div></div>
                <div className="metric"><div className="metric-label">MRR total</div><div className="metric-value">566 €</div></div>
                <div className="metric"><div className="metric-label">Taux rétention</div><div className="metric-value">97%</div></div>
              </div>
              <div className="section">
                <div className="section-title">Gestion des clients</div>
                <table>
                  <thead><tr><th>Nom</th><th>Email</th><th>Parrain</th><th>Filleuls</th><th>Statut</th><th>MRR</th></tr></thead>
                  <tbody>
                    {[['Lucas M.','lucas@email.com','—','3','active','3,99 €'],['Emma R.','emma@email.com','CODE-A1B2','1','active','3,99 €'],['Noah K.','noah@email.com','CODE-C3D4','0','inactive','—']].map((r,i) => (
                      <tr key={i}>
                        <td style={{fontWeight:500}}>{r[0]}</td>
                        <td style={{color:'var(--muted)'}}>{r[1]}</td>
                        <td><span style={{fontFamily:'monospace',fontSize:11,color:'var(--accent-light)'}}>{r[2]}</span></td>
                        <td>{r[3]}</td>
                        <td><span className={`status status-${r[4]}`}>{r[4] === 'active' ? 'Actif' : 'Inactif'}</span></td>
                        <td style={{color:'var(--success)'}}>{r[5]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

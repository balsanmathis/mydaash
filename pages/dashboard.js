import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const THEMES = [
  { id: 'violet', accent: '#7C3AED', light: '#A78BFA', bg: '#080612', card: '#110D20', card2: '#1A1530', border: '#2D2550' },
  { id: 'emerald', accent: '#10B981', light: '#6EE7B7', bg: '#071912', card: '#0D2420', card2: '#132E28', border: '#1A4030' },
  { id: 'blue', accent: '#3B82F6', light: '#93C5FD', bg: '#03080F', card: '#071525', card2: '#0D1E35', border: '#1A3050' },
  { id: 'rose', accent: '#F43F5E', light: '#FDA4AF', bg: '#150610', card: '#231020', card2: '#2E1528', border: '#4A1535' },
];

const WIDGET_TYPES = [
  { id: 'metric', label: 'Métrique', icon: '◈' },
  { id: 'bar', label: 'Barres', icon: '▦' },
  { id: 'line', label: 'Courbe', icon: '◝' },
  { id: 'pie', label: 'Camembert', icon: '◕' },
  { id: 'table', label: 'Tableau', icon: '▤' },
  { id: 'progress', label: 'Progrès', icon: '▬' },
];

function WidgetPreview({ widget, accent }) {
  const bars = [40, 60, 35, 80, 55, 90, 70];
  if (widget.type === 'metric') return (
    <div>
      <div style={{ fontSize: 10, color: '#6B5E8A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{widget.title || 'Métrique'}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#EDE9FE' }}>{widget.value || '0'}</div>
      {widget.subtitle && <div style={{ fontSize: 11, color: accent, marginTop: 4 }}>{widget.subtitle}</div>}
    </div>
  );
  if (widget.type === 'bar') return (
    <div>
      <div style={{ fontSize: 10, color: '#6B5E8A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{widget.title || 'Barres'}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
        {bars.map((v, i) => <div key={i} style={{ flex: 1, background: i === bars.length - 1 ? accent : accent + '55', borderRadius: '2px 2px 0 0', height: `${Math.round(v * 0.55)}px` }} />)}
      </div>
    </div>
  );
  if (widget.type === 'line') return (
    <div>
      <div style={{ fontSize: 10, color: '#6B5E8A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{widget.title || 'Courbe'}</div>
      <svg width="100%" height="44" viewBox="0 0 200 44">
        <polyline fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" points="0,36 30,28 60,32 90,16 120,20 150,8 200,12" />
        <polygon fill={accent + '22'} points="0,44 0,36 30,28 60,32 90,16 120,20 150,8 200,12 200,44" />
      </svg>
    </div>
  );
  if (widget.type === 'pie') return (
    <div>
      <div style={{ fontSize: 10, color: '#6B5E8A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{widget.title || 'Camembert'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="44" height="44" viewBox="0 0 48 48">
          <path d="M24,24 L24,4 A20,20 0 0,1 44,24 Z" fill={accent} />
          <path d="M24,24 L44,24 A20,20 0 0,1 14,41 Z" fill={accent + '88'} />
          <path d="M24,24 L14,41 A20,20 0 0,1 4,24 Z" fill={accent + '55'} />
          <path d="M24,24 L4,24 A20,20 0 0,1 24,4 Z" fill={accent + '33'} />
        </svg>
        <div style={{ fontSize: 10, color: '#6B5E8A' }}>4 segments</div>
      </div>
    </div>
  );
  if (widget.type === 'progress') return (
    <div>
      <div style={{ fontSize: 10, color: '#6B5E8A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{widget.title || 'Progrès'}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#EDE9FE' }}>{widget.value || 0}%</div>
      <div style={{ height: 6, background: '#6B5E8A33', borderRadius: 3 }}>
        <div style={{ height: 6, background: accent, borderRadius: 3, width: `${widget.value || 0}%` }} />
      </div>
    </div>
  );
  return <div style={{ fontSize: 12, color: '#6B5E8A' }}>{widget.title || widget.type}</div>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('overview');
  const [themeId, setThemeId] = useState('violet');
  const [dashboards, setDashboards] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedDash, setSelectedDash] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [copied, setCopied] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    const stored = localStorage.getItem('mydaash_user');
    const token = localStorage.getItem('mydaash_token');
    if (!stored || !token) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchData(u, token);
  }, []);

  const fetchData = async (u, token) => {
    try {
      const res = await fetch('/api/data', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDashboards(data.dashboards || []);
        setCommissions(data.commissions || []);
        setTotalRevenue(data.totalRevenue || 0);
        if (u.role === 'admin') setAllUsers(data.allUsers || []);
      }
    } catch (e) { console.error(e); }
  };

  const createDashboard = async () => {
    if (!newDashName.trim()) return;
    const token = localStorage.getItem('mydaash_token');
    const res = await fetch('/api/dashboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newDashName, theme: themeId, widgets: [] })
    });
    if (res.ok) {
      const data = await res.json();
      setDashboards(prev => [...prev, data.dashboard]);
      setNewDashName('');
      setShowBuilder(false);
    }
  };

  const deleteDashboard = async (id) => {
    const token = localStorage.getItem('mydaash_token');
    await fetch(`/api/dashboards?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setDashboards(prev => prev.filter(d => d.id !== id));
    if (selectedDash?.id === id) setSelectedDash(null);
  };

  const addWidget = async (dash, type) => {
    const token = localStorage.getItem('mydaash_token');
    const newWidget = { id: Date.now().toString(), type, title: WIDGET_TYPES.find(w => w.id === type)?.label, value: type === 'progress' ? 50 : '0', subtitle: '' };
    const updated = { ...dash, widgets: [...(dash.widgets || []), newWidget] };
    await fetch('/api/dashboards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(updated)
    });
    setDashboards(prev => prev.map(d => d.id === dash.id ? updated : d));
    setSelectedDash(updated);
  };

  const removeWidget = async (dash, widgetId) => {
    const token = localStorage.getItem('mydaash_token');
    const updated = { ...dash, widgets: dash.widgets.filter(w => w.id !== widgetId) };
    await fetch('/api/dashboards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(updated)
    });
    setDashboards(prev => prev.map(d => d.id === dash.id ? updated : d));
    setSelectedDash(updated);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://mydaash.vercel.app/subscribe?ref=${user?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logout = () => {
    localStorage.removeItem('mydaash_token');
    localStorage.removeItem('mydaash_user');
    router.push('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const monthRevenue = commissions.reduce((s, c) => s + parseFloat(c.amount || 0), 0).toFixed(2);

  const navItems = [
    { id: 'overview', icon: '▦', label: 'Vue générale' },
    { id: 'dashboards', icon: '◫', label: 'Mes dashboards' },
    { id: 'revenus', icon: '◈', label: 'Revenus' },
    { id: 'parrainage', icon: '◎', label: 'Parrainage' },
    ...(isAdmin ? [{ id: 'admin', icon: '⊞', label: 'Tous les clients' }] : []),
  ];

  const s = {
    app: { display: 'flex', height: '100vh', overflow: 'hidden' },
    sidebar: { width: 210, background: theme.card, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 },
    main: { flex: 1, overflowY: 'auto', padding: 24, background: theme.bg },
    section: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, marginBottom: 16 },
    metric: { background: theme.card2, borderRadius: 10, padding: 14 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
    btnPrimary: { background: theme.accent, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
    btnOutline: { background: 'transparent', border: `1px solid ${theme.border}`, color: '#6B5E8A', fontSize: 11, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
    empty: { textAlign: 'center', padding: '40px 20px', color: '#6B5E8A' },
  };

  return (
    <>
      <Head>
        <title>MyDaash</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:${theme.bg};color:#EDE9FE;font-family:'DM Sans',sans-serif}input[type=text]{background:${theme.card2};border:1px solid ${theme.border};border-radius:8px;padding:9px 12px;color:#EDE9FE;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;width:100%}input[type=text]:focus{border-color:${theme.accent}}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;padding:6px 8px;color:#6B5E8A;font-weight:500;border-bottom:1px solid ${theme.border};font-size:10px;text-transform:uppercase}td{padding:9px 8px;border-bottom:1px solid ${theme.border}}tr:last-child td{border-bottom:none}`}</style>

      <div style={s.app}>
        {/* SIDEBAR */}
        <div style={s.sidebar}>
          <div style={{ padding: '20px 16px', fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, borderBottom: `1px solid ${theme.border}` }}>
            My<span style={{ color: theme.light }}>Daash</span>
          </div>
          <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            <div style={{ fontSize: 9, color: '#6B5E8A', padding: '10px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Menu</div>
            {navItems.map(item => (
              <div key={item.id} onClick={() => { setPage(item.id); setSelectedDash(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: page === item.id ? theme.light : '#6B5E8A', cursor: 'pointer', background: page === item.id ? theme.accent + '22' : 'transparent', borderRight: page === item.id ? `2px solid ${theme.accent}` : '2px solid transparent' }}>
                <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{item.icon}</span>{item.label}
              </div>
            ))}
            <div style={{ fontSize: 9, color: '#6B5E8A', padding: '14px 16px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Thème</div>
            <div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>
              {THEMES.map(t => (
                <div key={t.id} onClick={() => setThemeId(t.id)}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: t.accent, cursor: 'pointer', border: `2px solid ${themeId === t.id ? 'white' : 'transparent'}` }} />
              ))}
            </div>
          </div>
          <div style={{ padding: '14px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: theme.accent + '22', border: `1px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: theme.light, flexShrink: 0 }}>
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
              <div style={{ fontSize: 10, color: '#6B5E8A' }}>{isAdmin ? 'Admin' : 'Pro'}</div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#6B5E8A', cursor: 'pointer', fontSize: 16 }}>↩</button>
          </div>
        </div>

        {/* MAIN */}
        <div style={s.main}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>{navItems.find(n => n.id === page)?.label}</div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: theme.accent + '22', color: theme.light, border: `1px solid ${theme.accent}` }}>{isAdmin ? '⊞ Admin' : '✦ Pro'}</span>
          </div>

          {/* OVERVIEW */}
          {page === 'overview' && <>
            <div style={s.grid4}>
              {[
                { label: 'Revenus ce mois', value: `${monthRevenue} €`, sub: commissions.length ? `${commissions.length} filleul(s)` : 'Partage ton code !' },
                { label: 'Filleuls actifs', value: commissions.length, sub: commissions.length ? `+${(commissions.length).toFixed(0)} €/mois` : 'Aucun encore' },
                { label: 'Dashboards', value: dashboards.length, sub: dashboards.length ? 'créé(s)' : 'Crée le tien !' },
                { label: 'Abonnement', value: null, sub: null },
              ].map((m, i) => (
                <div key={i} style={s.metric}>
                  <div style={{ fontSize: 10, color: '#6B5E8A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                  {i === 3 ? <span style={{ background: '#10B98122', color: '#10B981', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, marginTop: 6, display: 'inline-block' }}>Actif</span>
                    : <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>{m.value}</div>}
                  {m.sub && <div style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>{m.sub}</div>}
                </div>
              ))}
            </div>
            <div style={s.section}>
              {dashboards.length === 0 && commissions.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>◫</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#EDE9FE', marginBottom: 8 }}>Bienvenue sur MyDaash !</div>
                  <div style={{ fontSize: 13, marginBottom: 20 }}>Crée ton premier dashboard ou partage ton code pour commencer à gagner.</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button style={s.btnPrimary} onClick={() => setPage('dashboards')}>Créer un dashboard</button>
                    <button style={s.btnOutline} onClick={() => setPage('parrainage')}>Mon code parrainage</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Derniers dashboards</div>
                  {dashboards.slice(0, 3).map(d => (
                    <div key={d.id} onClick={() => { setPage('dashboards'); setSelectedDash(d); }}
                      style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13 }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: '#6B5E8A' }}>{d.widgets?.length || 0} blocs →</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>}

          {/* DASHBOARDS LIST */}
          {page === 'dashboards' && !selectedDash && <>
            <div style={s.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600 }}>Mes dashboards ({dashboards.length})</div>
                <button style={s.btnPrimary} onClick={() => setShowBuilder(true)}>+ Nouveau</button>
              </div>
              {showBuilder && (
                <div style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#6B5E8A', marginBottom: 8 }}>Nom du dashboard</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={newDashName} onChange={e => setNewDashName(e.target.value)} placeholder="Ex: Ventes Q1 2025" onKeyDown={e => e.key === 'Enter' && createDashboard()} />
                    <button style={s.btnPrimary} onClick={createDashboard}>Créer</button>
                    <button style={s.btnOutline} onClick={() => setShowBuilder(false)}>Annuler</button>
                  </div>
                </div>
              )}
              {dashboards.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>◫</div>
                  <div style={{ fontSize: 14, color: '#EDE9FE', marginBottom: 6 }}>Aucun dashboard encore</div>
                  <div style={{ fontSize: 12 }}>Clique "+ Nouveau" pour créer ton premier dashboard</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {dashboards.map(d => (
                    <div key={d.id} style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: '#6B5E8A', marginBottom: 12 }}>{d.widgets?.length || 0} bloc(s)</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ ...s.btnOutline, flex: 1, textAlign: 'center' }} onClick={() => setSelectedDash(d)}>Ouvrir</button>
                        <button onClick={() => deleteDashboard(d.id)} style={{ background: '#F43F5E22', border: '1px solid #F43F5E55', color: '#F87171', fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {/* DASHBOARD BUILDER */}
          {page === 'dashboards' && selectedDash && <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button style={s.btnOutline} onClick={() => setSelectedDash(null)}>← Retour</button>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{selectedDash.name}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
              <div style={{ ...s.section, padding: 14 }}>
                <div style={{ fontSize: 10, color: '#6B5E8A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Ajouter un bloc</div>
                {WIDGET_TYPES.map(w => (
                  <button key={w.id} onClick={() => addWidget(selectedDash, w.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#EDE9FE', fontFamily: 'DM Sans, sans-serif', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: theme.accent }}>{w.icon}</span>{w.label}
                  </button>
                ))}
              </div>
              <div>
                {!selectedDash.widgets?.length ? (
                  <div style={s.section}><div style={s.empty}>
                    <div style={{ fontSize: 24, opacity: 0.4, marginBottom: 8 }}>+</div>
                    <div style={{ fontSize: 13 }}>Ajoute des blocs depuis le panneau gauche</div>
                  </div></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {selectedDash.widgets.map(widget => (
                      <div key={widget.id} style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, position: 'relative' }}>
                        <button onClick={() => removeWidget(selectedDash, widget.id)}
                          style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#F43F5E', border: 'none', color: 'white', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        <WidgetPreview widget={widget} accent={theme.accent} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>}

          {/* REVENUS */}
          {page === 'revenus' && <>
            <div style={s.grid4}>
              {[
                { label: 'Ce mois', value: `${monthRevenue} €` },
                { label: 'Total cumulé', value: `${totalRevenue.toFixed(2)} €` },
                { label: 'Filleuls actifs', value: commissions.length },
                { label: 'Gain par filleul', value: '1,00 €/mois' },
              ].map((m, i) => (
                <div key={i} style={s.metric}>
                  <div style={{ fontSize: 10, color: '#6B5E8A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={s.section}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Mes commissions</div>
              {commissions.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: 28, opacity: 0.4, marginBottom: 10 }}>◈</div>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>Aucune commission encore — partage ton code !</div>
                  <button style={s.btnPrimary} onClick={() => setPage('parrainage')}>Voir mon code →</button>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Filleul</th><th>Mois</th><th>Statut</th><th>Gain</th></tr></thead>
                  <tbody>
                    {commissions.map((c, i) => (
                      <tr key={i}>
                        <td>Filleul #{i + 1}</td>
                        <td style={{ color: '#6B5E8A' }}>{c.month}</td>
                        <td><span style={{ background: '#10B98122', color: '#10B981', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>Actif</span></td>
                        <td style={{ color: '#10B981', fontWeight: 600 }}>{parseFloat(c.amount).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>}

          {/* PARRAINAGE */}
          {page === 'parrainage' && <>
            <div style={s.section}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Mon code de parrainage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ background: theme.accent + '22', color: theme.light, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, padding: '10px 18px', borderRadius: 10, border: `1px solid ${theme.accent}`, letterSpacing: '0.1em' }}>
                  {user.referralCode || 'CODE-ADMIN1'}
                </div>
                <button style={s.btnOutline} onClick={copyLink}>{copied ? '✓ Copié !' : 'Copier le lien'}</button>
              </div>
              <div style={{ background: theme.card2, borderRadius: 8, padding: 10, fontSize: 11, color: '#6B5E8A', wordBreak: 'break-all', marginBottom: 12 }}>
                https://mydaash.vercel.app/subscribe?ref={user.referralCode || 'CODE-ADMIN1'}
              </div>
              <div style={{ fontSize: 13, color: '#6B5E8A' }}>
                Partage ce lien — tu gagnes <strong style={{ color: theme.light }}>1€/mois</strong> pour chaque personne abonnée avec ton code.
              </div>
            </div>
            <div style={s.section}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Comment ça marche</div>
              {[['1', 'Partage ton lien', 'Envoie-le à tes contacts, sur les réseaux, par email...'], ['2', "Ils s'abonnent", 'Ils créent leur compte avec ton code'], ['3', 'Tu gagnes', '1€ automatiquement chaque mois']].map(([n, t, sub]) => (
                <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: theme.accent + '22', border: `1px solid ${theme.accent}`, color: theme.light, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t}</div><div style={{ fontSize: 11, color: '#6B5E8A' }}>{sub}</div></div>
                </div>
              ))}
            </div>
          </>}

          {/* ADMIN */}
          {page === 'admin' && isAdmin && <>
            <div style={s.grid4}>
              {[
                { label: 'Clients totaux', value: allUsers.length },
                { label: 'Actifs', value: allUsers.filter(u => u.subscription_status === 'active').length },
                { label: 'MRR brut', value: `${(allUsers.filter(u => u.subscription_status === 'active').length * 3.99).toFixed(2)} €` },
                { label: 'Revenu net', value: `${(allUsers.filter(u => u.subscription_status === 'active').length * 2.99).toFixed(2)} €` },
              ].map((m, i) => (
                <div key={i} style={s.metric}>
                  <div style={{ fontSize: 10, color: '#6B5E8A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={s.section}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Tous les clients</div>
              {allUsers.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: 28, opacity: 0.4, marginBottom: 10 }}>⊞</div>
                  <div style={{ fontSize: 13 }}>Aucun client encore — partage MyDaash !</div>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Nom</th><th>Email</th><th>Code parrainage</th><th>Statut</th><th>Rôle</th></tr></thead>
                  <tbody>
                    {allUsers.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{u.full_name || '—'}</td>
                        <td style={{ color: '#6B5E8A' }}>{u.email}</td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: theme.light }}>{u.referral_code || '—'}</span></td>
                        <td><span style={{ background: u.subscription_status === 'active' ? '#10B98122' : '#F59E0B22', color: u.subscription_status === 'active' ? '#10B981' : '#F59E0B', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>{u.subscription_status === 'active' ? 'Actif' : 'Inactif'}</span></td>
                        <td style={{ color: u.role === 'admin' ? theme.light : '#6B5E8A' }}>{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>}
        </div>
      </div>
    </>
  );
}


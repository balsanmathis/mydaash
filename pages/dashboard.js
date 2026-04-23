import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const THEMES = [
  { id: 'violet', label: 'Violet', accent: '#7C3AED', light: '#A78BFA', bg: '#080612', card: '#110D20', card2: '#1A1530', border: '#2D2550' },
  { id: 'emerald', label: 'Émeraude', accent: '#10B981', light: '#6EE7B7', bg: '#071912', card: '#0D2420', card2: '#132E28', border: '#1A4030' },
  { id: 'blue', label: 'Océan', accent: '#3B82F6', light: '#93C5FD', bg: '#03080F', card: '#071525', card2: '#0D1E35', border: '#1A3050' },
  { id: 'rose', label: 'Rose', accent: '#F43F5E', light: '#FDA4AF', bg: '#150610', card: '#231020', card2: '#2E1528', border: '#4A1535' },
  { id: 'amber', label: 'Ambre', accent: '#F59E0B', light: '#FCD34D', bg: '#130E00', card: '#1E1600', card2: '#2A1E00', border: '#3A2C00' },
  { id: 'light', label: 'Clair', accent: '#6366F1', light: '#4338CA', bg: '#F8F7FF', card: '#FFFFFF', card2: '#F1F0FF', border: '#E0DFFF' },
];

const FONTS = ['DM Sans', 'Syne', 'Space Grotesk', 'IBM Plex Mono', 'Playfair Display', 'Unbounded'];

const WIDGET_TYPES = [
  { id: 'metric', label: 'Métrique', icon: '◈', desc: 'Chiffre clé + tendance' },
  { id: 'metric2', label: 'Double métrique', icon: '◈◈', desc: '2 chiffres côte à côte' },
  { id: 'bar', label: 'Barres', icon: '▦', desc: 'Graphique en barres' },
  { id: 'line', label: 'Courbe', icon: '◝', desc: 'Évolution dans le temps' },
  { id: 'pie', label: 'Camembert', icon: '◕', desc: 'Répartition en parts' },
  { id: 'progress', label: 'Progrès', icon: '▬', desc: 'Barre de progression' },
  { id: 'table', label: 'Tableau', icon: '▤', desc: 'Données en lignes' },
  { id: 'text', label: 'Texte libre', icon: '✦', desc: 'Note ou titre personnalisé' },
  { id: 'divider', label: 'Séparateur', icon: '—', desc: 'Ligne de séparation' },
];

function WidgetDisplay({ widget, accent, light, textColor, mutedColor, card2, border, font, onEdit }) {
  const bars = (widget.barValues || '40,65,35,80,55,90,70').split(',').map(Number);
  const linePoints = (widget.lineValues || '30,50,38,65,52,78,68,85,77,90').split(',').map(Number);
  const max = Math.max(...bars);
  const lineMax = Math.max(...linePoints);
  const lineMin = Math.min(...linePoints);
  const W = 200, H = 50;
  const linePts = linePoints.map((v, i) => {
    const x = Math.round((i / (linePoints.length - 1)) * W);
    const y = Math.round(H - ((v - lineMin) / (lineMax - lineMin + 1)) * (H - 8) - 4);
    return `${x},${y}`;
  }).join(' ');

  const pieSlices = (widget.pieLabels || 'A,B,C,D').split(',');
  const pieValues = (widget.pieValues || '35,28,22,15').split(',').map(Number);
  const pieTotal = pieValues.reduce((s, v) => s + v, 0);
  const pieColors = [accent, accent + 'BB', accent + '77', accent + '44'];

  const base = {
    fontFamily: `'${font}', sans-serif`,
    background: card2,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: '14px 16px',
    color: textColor,
    position: 'relative',
    cursor: onEdit ? 'pointer' : 'default',
  };

  const editBtn = onEdit ? (
    <button onClick={e => { e.stopPropagation(); onEdit(widget); }}
      style={{ position: 'absolute', top: 8, right: 8, background: accent + '33', border: `1px solid ${accent}55`, color: light, fontSize: 10, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontFamily: `'${font}', sans-serif` }}>
      ✎ Éditer
    </button>
  ) : null;

  if (widget.type === 'metric') return (
    <div style={base}>
      {editBtn}
      <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{widget.title || 'Métrique'}</div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: textColor }}>{widget.value || '0'}</div>
      {widget.subtitle && <div style={{ fontSize: 11, color: widget.subtitleColor === 'green' ? '#10B981' : widget.subtitleColor === 'red' ? '#F43F5E' : mutedColor, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {widget.subtitleColor === 'green' ? '▲' : widget.subtitleColor === 'red' ? '▼' : ''} {widget.subtitle}
      </div>}
    </div>
  );

  if (widget.type === 'metric2') return (
    <div style={base}>
      {editBtn}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{widget.title || 'Métrique 1'}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: textColor }}>{widget.value || '0'}</div>
          {widget.subtitle && <div style={{ fontSize: 10, color: '#10B981', marginTop: 2 }}>{widget.subtitle}</div>}
        </div>
        <div>
          <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{widget.title2 || 'Métrique 2'}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: textColor }}>{widget.value2 || '0'}</div>
          {widget.subtitle2 && <div style={{ fontSize: 10, color: '#F43F5E', marginTop: 2 }}>{widget.subtitle2}</div>}
        </div>
      </div>
    </div>
  );

  if (widget.type === 'bar') return (
    <div style={base}>
      {editBtn}
      <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{widget.title || 'Barres'}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
        {bars.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', background: i === bars.length - 1 ? accent : accent + '55', borderRadius: '2px 2px 0 0', height: `${Math.round((v / max) * 44)}px`, transition: 'height 0.3s' }} />
            {widget.barLabels && <div style={{ fontSize: 8, color: mutedColor }}>{widget.barLabels.split(',')[i] || ''}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  if (widget.type === 'line') return (
    <div style={base}>
      {editBtn}
      <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{widget.title || 'Courbe'}</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#grad-${widget.id})`} points={`0,${H} ${linePts} ${W},${H}`} />
        <polyline fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={linePts} />
      </svg>
    </div>
  );

  if (widget.type === 'pie') return (
    <div style={base}>
      {editBtn}
      <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{widget.title || 'Camembert'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          {(() => {
            let cum = 0;
            return pieValues.map((v, i) => {
              const start = (cum / pieTotal) * 2 * Math.PI - Math.PI / 2;
              cum += v;
              const end = (cum / pieTotal) * 2 * Math.PI - Math.PI / 2;
              const r = 28, cx = 32, cy = 32;
              const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
              const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
              const large = v / pieTotal > 0.5 ? 1 : 0;
              return <path key={i} d={`M${cx},${cy} L${Math.round(x1)},${Math.round(y1)} A${r},${r} 0 ${large},1 ${Math.round(x2)},${Math.round(y2)} Z`} fill={pieColors[i % pieColors.length]} />;
            });
          })()}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pieSlices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: textColor }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: pieColors[i % pieColors.length], flexShrink: 0 }} />
              <span style={{ opacity: 0.8 }}>{s.trim()}</span>
              <span style={{ color: mutedColor, marginLeft: 'auto', paddingLeft: 8 }}>{pieValues[i]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (widget.type === 'progress') return (
    <div style={base}>
      {editBtn}
      <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{widget.title || 'Progrès'}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, color: textColor }}>{widget.value || 0}%</div>
      <div style={{ height: 8, background: mutedColor + '22', borderRadius: 4 }}>
        <div style={{ height: 8, background: `linear-gradient(90deg, ${accent}, ${light})`, borderRadius: 4, width: `${Math.min(widget.value || 0, 100)}%`, transition: 'width 0.5s' }} />
      </div>
      {widget.subtitle && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: mutedColor, marginTop: 6 }}>
        <span>{widget.subtitle}</span><span>{widget.value}%</span>
      </div>}
    </div>
  );

  if (widget.type === 'table') return (
    <div style={base}>
      {editBtn}
      <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{widget.title || 'Tableau'}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: `'${font}', sans-serif` }}>
        {widget.tableHeaders && <thead><tr>{widget.tableHeaders.split(',').map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '4px 6px', color: mutedColor, fontSize: 9, textTransform: 'uppercase', borderBottom: `1px solid ${border}` }}>{h.trim()}</th>)}</tr></thead>}
        <tbody>
          {(widget.tableRows || '').split('\n').filter(Boolean).map((row, i) => (
            <tr key={i}>
              {row.split(',').map((cell, j) => <td key={j} style={{ padding: '6px 6px', color: textColor, borderBottom: `1px solid ${border}`, opacity: j === 0 ? 1 : 0.7 }}>{cell.trim()}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (widget.type === 'text') return (
    <div style={{ ...base, background: 'transparent', border: `1px dashed ${border}` }}>
      {editBtn}
      <div style={{ fontSize: widget.textSize === 'large' ? 22 : widget.textSize === 'small' ? 12 : 15, fontWeight: widget.textBold ? 700 : 400, color: widget.textColor2 || textColor, lineHeight: 1.5 }}>
        {widget.value || 'Texte libre...'}
      </div>
    </div>
  );

  if (widget.type === 'divider') return (
    <div style={{ ...base, background: 'transparent', border: 'none', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: border }} />
      {widget.title && <span style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{widget.title}</span>}
      <div style={{ flex: 1, height: 1, background: border }} />
    </div>
  );

  return null;
}

function WidgetEditor({ widget, onSave, onClose, accent, light, card, card2, border, textColor, mutedColor, font }) {
  const [w, setW] = useState({ ...widget });
  const set = (k, v) => setW(prev => ({ ...prev, [k]: v }));

  const fieldStyle = { background: card2, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px', color: textColor, fontFamily: `'${font}', sans-serif`, fontSize: 13, outline: 'none', width: '100%' };
  const labelStyle = { fontSize: 11, color: mutedColor, marginBottom: 5, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto', fontFamily: `'${font}', sans-serif` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: textColor }}>✎ Éditer le bloc</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: mutedColor, fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Titre</label>
            <input style={fieldStyle} value={w.title || ''} onChange={e => set('title', e.target.value)} placeholder="Titre du bloc" />
          </div>

          {['metric', 'metric2', 'progress'].includes(w.type) && <>
            <div>
              <label style={labelStyle}>{w.type === 'progress' ? 'Valeur (0-100)' : 'Valeur principale'}</label>
              <input style={fieldStyle} value={w.value || ''} onChange={e => set('value', e.target.value)} placeholder={w.type === 'progress' ? '75' : '24 890 €'} />
            </div>
            <div>
              <label style={labelStyle}>Sous-titre / tendance</label>
              <input style={fieldStyle} value={w.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="+12% ce mois" />
            </div>
            {w.type !== 'progress' && <div>
              <label style={labelStyle}>Couleur du sous-titre</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['none', 'Neutre'], ['green', '▲ Vert'], ['red', '▼ Rouge']].map(([v, l]) => (
                  <button key={v} onClick={() => set('subtitleColor', v)}
                    style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${w.subtitleColor === v ? accent : border}`, background: w.subtitleColor === v ? accent + '22' : 'transparent', color: textColor, fontSize: 11, cursor: 'pointer', fontFamily: `'${font}', sans-serif` }}>{l}</button>
                ))}
              </div>
            </div>}
          </>}

          {w.type === 'metric2' && <>
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12 }}>
              <label style={labelStyle}>Titre 2</label>
              <input style={fieldStyle} value={w.title2 || ''} onChange={e => set('title2', e.target.value)} placeholder="Deuxième métrique" />
            </div>
            <div>
              <label style={labelStyle}>Valeur 2</label>
              <input style={fieldStyle} value={w.value2 || ''} onChange={e => set('value2', e.target.value)} placeholder="1 234" />
            </div>
            <div>
              <label style={labelStyle}>Sous-titre 2</label>
              <input style={fieldStyle} value={w.subtitle2 || ''} onChange={e => set('subtitle2', e.target.value)} placeholder="-3% ce mois" />
            </div>
          </>}

          {w.type === 'bar' && <>
            <div>
              <label style={labelStyle}>Valeurs (séparées par des virgules)</label>
              <input style={fieldStyle} value={w.barValues || ''} onChange={e => set('barValues', e.target.value)} placeholder="40,65,35,80,55,90,70" />
            </div>
            <div>
              <label style={labelStyle}>Étiquettes (optionnel)</label>
              <input style={fieldStyle} value={w.barLabels || ''} onChange={e => set('barLabels', e.target.value)} placeholder="Jan,Fév,Mar,Avr,Mai,Jun,Jul" />
            </div>
          </>}

          {w.type === 'line' && <div>
            <label style={labelStyle}>Valeurs (séparées par des virgules)</label>
            <input style={fieldStyle} value={w.lineValues || ''} onChange={e => set('lineValues', e.target.value)} placeholder="30,50,38,65,52,78,68,85" />
          </div>}

          {w.type === 'pie' && <>
            <div>
              <label style={labelStyle}>Labels (séparés par des virgules)</label>
              <input style={fieldStyle} value={w.pieLabels || ''} onChange={e => set('pieLabels', e.target.value)} placeholder="Direct,SEO,Social,Autre" />
            </div>
            <div>
              <label style={labelStyle}>Valeurs en % (séparés par des virgules, total = 100)</label>
              <input style={fieldStyle} value={w.pieValues || ''} onChange={e => set('pieValues', e.target.value)} placeholder="35,28,22,15" />
            </div>
          </>}

          {w.type === 'table' && <>
            <div>
              <label style={labelStyle}>En-têtes (séparés par des virgules)</label>
              <input style={fieldStyle} value={w.tableHeaders || ''} onChange={e => set('tableHeaders', e.target.value)} placeholder="Nom,Valeur,Statut" />
            </div>
            <div>
              <label style={labelStyle}>Lignes (une par ligne, valeurs séparées par des virgules)</label>
              <textarea style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' }} value={w.tableRows || ''} onChange={e => set('tableRows', e.target.value)} placeholder={"Lucas M.,1 200 €,Actif\nEmma R.,800 €,Actif"} />
            </div>
          </>}

          {w.type === 'text' && <>
            <div>
              <label style={labelStyle}>Contenu du texte</label>
              <textarea style={{ ...fieldStyle, minHeight: 60, resize: 'vertical' }} value={w.value || ''} onChange={e => set('value', e.target.value)} placeholder="Votre texte ici..." />
            </div>
            <div>
              <label style={labelStyle}>Taille</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['small', 'Petit'], ['normal', 'Normal'], ['large', 'Grand']].map(([v, l]) => (
                  <button key={v} onClick={() => set('textSize', v)}
                    style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${w.textSize === v ? accent : border}`, background: w.textSize === v ? accent + '22' : 'transparent', color: textColor, fontSize: 11, cursor: 'pointer', fontFamily: `'${font}', sans-serif` }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => set('textBold', !w.textBold)}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${w.textBold ? accent : border}`, background: w.textBold ? accent + '22' : 'transparent', color: textColor, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: `'${font}', sans-serif` }}>Gras</button>
            </div>
          </>}

          {w.type === 'divider' && <div>
            <label style={labelStyle}>Texte du séparateur (optionnel)</label>
            <input style={fieldStyle} value={w.title || ''} onChange={e => set('title', e.target.value)} placeholder="SECTION" />
          </div>}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => onSave(w)}
            style={{ flex: 1, background: accent, color: 'white', border: 'none', padding: 12, borderRadius: 10, fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Sauvegarder
          </button>
          <button onClick={onClose}
            style={{ padding: '12px 20px', background: 'transparent', border: `1px solid ${border}`, color: mutedColor, borderRadius: 10, cursor: 'pointer', fontFamily: `'${font}', sans-serif`, fontSize: 13 }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('overview');
  const [themeId, setThemeId] = useState('violet');
  const [globalFont, setGlobalFont] = useState('DM Sans');
  const [dashboards, setDashboards] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [adminCommissions, setAdminCommissions] = useState([]);
  const [adminGrandTotal, setAdminGrandTotal] = useState(0);
  const [adminMonth, setAdminMonth] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedDash, setSelectedDash] = useState(null);
  const [showNewDash, setShowNewDash] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [newDashTheme, setNewDashTheme] = useState('violet');
  const [newDashFont, setNewDashFont] = useState('DM Sans');
  const [editingWidget, setEditingWidget] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const isLight = themeId === 'light';
  const textColor = isLight ? '#1E1B4B' : '#EDE9FE';
  const mutedColor = isLight ? '#6B7280' : '#6B5E8A';

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

  const fetchAdminCommissions = async () => {
    const token = localStorage.getItem('mydaash_token');
    const res = await fetch('/api/commissions', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setAdminCommissions(data.commissions || []);
      setAdminGrandTotal(data.grandTotal || 0);
      setAdminMonth(data.month || '');
    }
  };

  useEffect(() => {
    if (page === 'commissions' && user?.role === 'admin') fetchAdminCommissions();
  }, [page]);

  const createDashboard = async () => {
    if (!newDashName.trim()) return;
    const token = localStorage.getItem('mydaash_token');
    const res = await fetch('/api/dashboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newDashName, theme: newDashTheme, font: newDashFont, widgets: [], cols: 2 })
    });
    if (res.ok) {
      const data = await res.json();
      setDashboards(prev => [data.dashboard, ...prev]);
      setNewDashName('');
      setShowNewDash(false);
    }
  };

  const deleteDashboard = async (id) => {
    const token = localStorage.getItem('mydaash_token');
    await fetch(`/api/dashboards?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setDashboards(prev => prev.filter(d => d.id !== id));
    if (selectedDash?.id === id) setSelectedDash(null);
  };

  const saveDashboard = async (dash) => {
    setSaving(true);
    const token = localStorage.getItem('mydaash_token');
    await fetch('/api/dashboards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(dash)
    });
    setDashboards(prev => prev.map(d => d.id === dash.id ? dash : d));
    setSaving(false);
  };

  const addWidget = async (type) => {
    if (!selectedDash) return;
    const newWidget = { id: Date.now().toString(), type, title: WIDGET_TYPES.find(w => w.id === type)?.label, value: type === 'progress' ? 50 : type === 'bar' ? '' : '0', subtitle: '', barValues: '40,65,35,80,55,90,70', lineValues: '30,50,38,65,52,78,68,85', pieLabels: 'A,B,C,D', pieValues: '35,28,22,15', tableHeaders: 'Nom,Valeur', tableRows: '' };
    const updated = { ...selectedDash, widgets: [...(selectedDash.widgets || []), newWidget] };
    setSelectedDash(updated);
    await saveDashboard(updated);
  };

  const removeWidget = async (widgetId) => {
    if (!selectedDash) return;
    const updated = { ...selectedDash, widgets: selectedDash.widgets.filter(w => w.id !== widgetId) };
    setSelectedDash(updated);
    await saveDashboard(updated);
  };

  const saveWidget = async (updatedWidget) => {
    const updated = { ...selectedDash, widgets: selectedDash.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w) };
    setSelectedDash(updated);
    setEditingWidget(null);
    await saveDashboard(updated);
  };

  const updateDashCols = async (cols) => {
    const updated = { ...selectedDash, cols };
    setSelectedDash(updated);
    await saveDashboard(updated);
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
    ...(isAdmin ? [
      { id: 'admin', icon: '⊞', label: 'Tous les clients' },
      { id: 'commissions', icon: '💰', label: 'Commissions à payer' },
    ] : []),
  ];

  const dashTheme = selectedDash ? (THEMES.find(t => t.id === selectedDash.theme) || THEMES[0]) : theme;
  const dashFont = selectedDash?.font || globalFont;

  const S = {
    section: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, marginBottom: 16 },
    metric: { background: theme.card2, borderRadius: 10, padding: 14 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
    btnPrimary: { background: theme.accent, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: `'${globalFont}', sans-serif` },
    btnOutline: { background: 'transparent', border: `1px solid ${theme.border}`, color: mutedColor, fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: `'${globalFont}', sans-serif` },
    input: { background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', color: textColor, fontFamily: `'${globalFont}', sans-serif`, fontSize: 13, outline: 'none', width: '100%' },
    empty: { textAlign: 'center', padding: '40px 20px', color: mutedColor },
    sectionTitle: { fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 14 },
  };

  return (
    <>
      <Head>
        <title>MyDaash</title>
        <link href={`https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&family=Space+Grotesk:wght@400;500&family=IBM+Plex+Mono&family=Playfair+Display:wght@400;700&family=Unbounded:wght@400;700&display=swap`} rel="stylesheet" />
      </Head>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:${theme.bg};color:${textColor};font-family:'${globalFont}',sans-serif}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;padding:6px 8px;color:${mutedColor};font-weight:500;border-bottom:1px solid ${theme.border};font-size:10px;text-transform:uppercase}td{padding:9px 8px;border-bottom:1px solid ${theme.border};color:${textColor}}tr:last-child td{border-bottom:none}`}</style>

      {editingWidget && (
        <WidgetEditor
          widget={editingWidget}
          onSave={saveWidget}
          onClose={() => setEditingWidget(null)}
          accent={dashTheme.accent} light={dashTheme.light}
          card={dashTheme.card} card2={dashTheme.card2} border={dashTheme.border}
          textColor={dashTheme.id === 'light' ? '#1E1B4B' : '#EDE9FE'}
          mutedColor={dashTheme.id === 'light' ? '#6B7280' : '#6B5E8A'}
          font={dashFont}
        />
      )}

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* SIDEBAR */}
        <div style={{ width: 210, background: theme.card, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px', fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, borderBottom: `1px solid ${theme.border}`, color: textColor }}>
            My<span style={{ color: theme.light }}>Daash</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
            <div style={{ fontSize: 9, color: mutedColor, padding: '8px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Menu</div>
            {navItems.map(item => (
              <div key={item.id} onClick={() => { setPage(item.id); setSelectedDash(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: page === item.id ? theme.light : mutedColor, cursor: 'pointer', background: page === item.id ? theme.accent + '22' : 'transparent', borderRight: `2px solid ${page === item.id ? theme.accent : 'transparent'}`, transition: 'all 0.1s' }}>
                <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{item.icon}</span>{item.label}
              </div>
            ))}
            <div style={{ fontSize: 9, color: mutedColor, padding: '14px 16px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Apparence</div>
            <div style={{ padding: '0 16px', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: mutedColor, marginBottom: 6 }}>Thème</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {THEMES.map(t => (
                  <div key={t.id} onClick={() => setThemeId(t.id)} title={t.label}
                    style={{ width: 18, height: 18, borderRadius: '50%', background: t.accent, cursor: 'pointer', border: `2px solid ${themeId === t.id ? (isLight ? '#1E1B4B' : 'white') : 'transparent'}`, transition: 'transform 0.15s' }} />
                ))}
              </div>
            </div>
            <div style={{ padding: '0 16px' }}>
              <div style={{ fontSize: 10, color: mutedColor, marginBottom: 6 }}>Police</div>
              <select value={globalFont} onChange={e => setGlobalFont(e.target.value)}
                style={{ background: theme.card2, border: `1px solid ${theme.border}`, color: textColor, borderRadius: 6, padding: '4px 8px', fontSize: 11, fontFamily: `'${globalFont}', sans-serif`, width: '100%', outline: 'none' }}>
                {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>)}
              </select>
            </div>
          </div>
          <div style={{ padding: '14px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.accent + '22', border: `1px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: theme.light, flexShrink: 0 }}>
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: textColor }}>{user.fullName}</div>
              <div style={{ fontSize: 10, color: mutedColor }}>{isAdmin ? 'Admin' : 'Pro'}</div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: mutedColor, cursor: 'pointer', fontSize: 16 }}>↩</button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: theme.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: textColor }}>
              {selectedDash ? selectedDash.name : navItems.find(n => n.id === page)?.label}
            </div>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: theme.accent + '22', color: theme.light, border: `1px solid ${theme.accent}` }}>{isAdmin ? '⊞ Admin' : '✦ Pro'}</span>
          </div>

          {/* OVERVIEW */}
          {page === 'overview' && !selectedDash && <>
            <div style={S.grid4}>
              {[
                { label: 'Revenus ce mois', value: `${monthRevenue} €`, sub: commissions.length ? `${commissions.length} filleul(s)` : 'Partage ton code !' },
                { label: 'Filleuls actifs', value: commissions.length, sub: commissions.length ? `+${commissions.length}€/mois` : 'Aucun encore' },
                { label: 'Dashboards', value: dashboards.length, sub: 'créé(s)' },
                { label: 'Abonnement', value: null },
              ].map((m, i) => (
                <div key={i} style={S.metric}>
                  <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                  {i === 3 ? <span style={{ background: '#10B98122', color: '#10B981', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, marginTop: 6, display: 'inline-block' }}>Actif</span>
                    : <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: textColor }}>{m.value}</div>}
                  {m.sub && <div style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>{m.sub}</div>}
                </div>
              ))}
            </div>
            <div style={S.section}>
              {dashboards.length === 0 ? (
                <div style={S.empty}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◫</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: textColor, marginBottom: 8 }}>Bienvenue sur MyDaash !</div>
                  <div style={{ fontSize: 13, marginBottom: 20 }}>Crée ton premier dashboard ou partage ton code pour commencer.</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button style={S.btnPrimary} onClick={() => setPage('dashboards')}>Créer un dashboard</button>
                    <button style={S.btnOutline} onClick={() => setPage('parrainage')}>Mon code parrainage</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={S.sectionTitle}>Derniers dashboards</div>
                  {dashboards.slice(0, 4).map(d => (
                    <div key={d.id} onClick={() => { setPage('dashboards'); setSelectedDash(d); }}
                      style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: textColor }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: mutedColor }}>{d.widgets?.length || 0} blocs →</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>}

          {/* DASHBOARDS LIST */}
          {page === 'dashboards' && !selectedDash && <>
            <div style={S.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={S.sectionTitle} >Mes dashboards ({dashboards.length})</div>
                <button style={S.btnPrimary} onClick={() => setShowNewDash(true)}>+ Nouveau</button>
              </div>

              {showNewDash && (
                <div style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: mutedColor, marginBottom: 10, fontWeight: 600 }}>Nouveau dashboard</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: mutedColor, marginBottom: 5 }}>Nom</div>
                    <input style={S.input} value={newDashName} onChange={e => setNewDashName(e.target.value)} placeholder="Ex: Ventes Q2 2025" onKeyDown={e => e.key === 'Enter' && createDashboard()} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: mutedColor, marginBottom: 5 }}>Thème</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {THEMES.map(t => <div key={t.id} onClick={() => setNewDashTheme(t.id)} title={t.label} style={{ width: 20, height: 20, borderRadius: '50%', background: t.accent, cursor: 'pointer', border: `2px solid ${newDashTheme === t.id ? 'white' : 'transparent'}` }} />)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: mutedColor, marginBottom: 5 }}>Police</div>
                      <select value={newDashFont} onChange={e => setNewDashFont(e.target.value)} style={{ ...S.input, padding: '5px 8px', fontSize: 11 }}>
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={S.btnPrimary} onClick={createDashboard}>Créer</button>
                    <button style={S.btnOutline} onClick={() => setShowNewDash(false)}>Annuler</button>
                  </div>
                </div>
              )}

              {dashboards.length === 0 ? (
                <div style={S.empty}>
                  <div style={{ fontSize: 28, opacity: 0.3, marginBottom: 10 }}>◫</div>
                  <div style={{ fontSize: 13, color: textColor, marginBottom: 6 }}>Aucun dashboard encore</div>
                  <div style={{ fontSize: 12 }}>Clique "+ Nouveau" pour créer ton premier dashboard</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {dashboards.map(d => {
                    const dt = THEMES.find(t => t.id === d.theme) || THEMES[0];
                    return (
                      <div key={d.id} style={{ background: dt.card, border: `2px solid ${dt.border}`, borderRadius: 12, padding: 14, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: dt.accent }} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: dt.id === 'light' ? '#1E1B4B' : '#EDE9FE', marginBottom: 4 }}>{d.name}</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: dt.accent }} />
                          <span style={{ fontSize: 10, color: dt.id === 'light' ? '#6B7280' : '#6B5E8A' }}>{dt.label} · {d.font || 'DM Sans'}</span>
                        </div>
                        <div style={{ fontSize: 11, color: dt.id === 'light' ? '#6B7280' : '#6B5E8A', marginBottom: 12 }}>{d.widgets?.length || 0} bloc(s)</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ flex: 1, background: dt.accent + '22', border: `1px solid ${dt.accent}55`, color: dt.light, fontSize: 11, padding: '6px 0', borderRadius: 8, cursor: 'pointer', fontFamily: `'${globalFont}', sans-serif` }} onClick={() => setSelectedDash(d)}>Ouvrir</button>
                          <button onClick={() => deleteDashboard(d.id)} style={{ background: '#F43F5E22', border: '1px solid #F43F5E44', color: '#F87171', fontSize: 12, padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>×</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>}

          {/* DASHBOARD BUILDER */}
          {page === 'dashboards' && selectedDash && <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <button style={S.btnOutline} onClick={() => setSelectedDash(null)}>← Retour</button>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: mutedColor }}>Colonnes :</span>
                {[1, 2, 3].map(c => (
                  <button key={c} onClick={() => updateDashCols(c)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${selectedDash.cols === c ? theme.accent : theme.border}`, background: selectedDash.cols === c ? theme.accent + '22' : 'transparent', color: textColor, fontSize: 12, cursor: 'pointer', fontFamily: `'${globalFont}', sans-serif` }}>{c}</button>
                ))}
              </div>
              {saving && <span style={{ fontSize: 11, color: mutedColor }}>Sauvegarde...</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 16 }}>
              <div style={{ ...S.section, padding: 12, alignSelf: 'start' }}>
                <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Ajouter un bloc</div>
                {WIDGET_TYPES.map(w => (
                  <button key={w.id} onClick={() => addWidget(w.type || w.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: textColor, fontFamily: `'${globalFont}', sans-serif`, fontSize: 12, marginBottom: 5, textAlign: 'left' }}>
                    <span style={{ color: theme.accent, fontSize: 13, width: 16 }}>{w.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{w.label}</div>
                      <div style={{ fontSize: 9, color: mutedColor }}>{w.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                {!selectedDash.widgets?.length ? (
                  <div style={S.section}><div style={S.empty}>
                    <div style={{ fontSize: 24, opacity: 0.3, marginBottom: 8 }}>+</div>
                    <div style={{ fontSize: 13 }}>Ajoute des blocs depuis le panneau gauche</div>
                  </div></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedDash.cols || 2}, 1fr)`, gap: 12 }}>
                    {selectedDash.widgets.map(widget => (
                      <div key={widget.id} style={{ position: 'relative' }}>
                        <WidgetDisplay
                          widget={widget}
                          accent={dashTheme.accent} light={dashTheme.light}
                          textColor={dashTheme.id === 'light' ? '#1E1B4B' : '#EDE9FE'}
                          mutedColor={dashTheme.id === 'light' ? '#6B7280' : '#6B5E8A'}
                          card2={dashTheme.card2} border={dashTheme.border}
                          font={dashFont}
                          onEdit={setEditingWidget}
                        />
                        <button onClick={() => removeWidget(widget.id)}
                          style={{ position: 'absolute', bottom: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#F43F5E', border: 'none', color: 'white', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>}

          {/* REVENUS */}
          {page === 'revenus' && <>
            <div style={S.grid4}>
              {[
                { label: 'Ce mois', value: `${monthRevenue} €` },
                { label: 'Total cumulé', value: `${totalRevenue.toFixed(2)} €` },
                { label: 'Filleuls actifs', value: commissions.length },
                { label: 'Gain par filleul', value: '1,00 €/mois' },
              ].map((m, i) => (
                <div key={i} style={S.metric}>
                  <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: textColor }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={S.section}>
              <div style={S.sectionTitle}>Mes commissions</div>
              {commissions.length === 0 ? (
                <div style={S.empty}>
                  <div style={{ fontSize: 28, opacity: 0.3, marginBottom: 10 }}>◈</div>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>Aucune commission encore — partage ton code !</div>
                  <button style={S.btnPrimary} onClick={() => setPage('parrainage')}>Voir mon code →</button>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Filleul</th><th>Mois</th><th>Statut</th><th>Gain</th></tr></thead>
                  <tbody>
                    {commissions.map((c, i) => (
                      <tr key={i}>
                        <td>Filleul #{i + 1}</td>
                        <td style={{ color: mutedColor }}>{c.month}</td>
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
            <div style={S.section}>
              <div style={S.sectionTitle}>Mon code de parrainage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ background: theme.accent + '22', color: theme.light, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, padding: '10px 18px', borderRadius: 10, border: `1px solid ${theme.accent}`, letterSpacing: '0.1em' }}>
                  {user.referralCode || 'CODE-ADMIN1'}
                </div>
                <button style={S.btnOutline} onClick={copyLink}>{copied ? '✓ Copié !' : 'Copier le lien'}</button>
              </div>
              <div style={{ background: theme.card2, borderRadius: 8, padding: 10, fontSize: 11, color: mutedColor, wordBreak: 'break-all', marginBottom: 12 }}>
                https://mydaash.vercel.app/subscribe?ref={user.referralCode || 'CODE-ADMIN1'}
              </div>
              <div style={{ fontSize: 13, color: mutedColor }}>
                Partage ce lien — tu gagnes <strong style={{ color: theme.light }}>1€/mois</strong> pour chaque abonné avec ton code.
              </div>
            </div>
            <div style={S.section}>
              <div style={S.sectionTitle}>Comment ça marche</div>
              {[['1', 'Partage ton lien', 'Envoie-le à tes contacts, sur les réseaux...'], ['2', "Ils s'abonnent", 'Ils créent leur compte avec ton code'], ['3', 'Tu gagnes', '1€ automatiquement chaque mois']].map(([n, t, sub]) => (
                <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: theme.accent + '22', border: `1px solid ${theme.accent}`, color: theme.light, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: textColor }}>{t}</div><div style={{ fontSize: 11, color: mutedColor }}>{sub}</div></div>
                </div>
              ))}
            </div>
          </>}

          {/* ADMIN — CLIENTS */}
          {page === 'admin' && isAdmin && <>
            <div style={S.grid4}>
              {[
                { label: 'Clients totaux', value: allUsers.length },
                { label: 'Actifs', value: allUsers.filter(u => u.subscription_status === 'active').length },
                { label: 'MRR brut', value: `${(allUsers.filter(u => u.subscription_status === 'active').length * 3.99).toFixed(2)} €` },
                { label: 'Revenu net', value: `${(allUsers.filter(u => u.subscription_status === 'active').length * 2.99).toFixed(2)} €` },
              ].map((m, i) => (
                <div key={i} style={S.metric}>
                  <div style={{ fontSize: 10, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: textColor }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={S.section}>
              <div style={S.sectionTitle}>Tous les clients</div>
              {allUsers.length === 0 ? (
                <div style={S.empty}><div style={{ fontSize: 13 }}>Aucun client encore</div></div>
              ) : (
                <table>
                  <thead><tr><th>Nom</th><th>Email</th><th>Code parrainage</th><th>Statut</th><th>Rôle</th><th>Inscrit le</th></tr></thead>
                  <tbody>
                    {allUsers.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{u.full_name || '—'}</td>
                        <td style={{ color: mutedColor }}>{u.email}</td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: theme.light }}>{u.referral_code || '—'}</span></td>
                        <td><span style={{ background: u.subscription_status === 'active' ? '#10B98122' : '#F59E0B22', color: u.subscription_status === 'active' ? '#10B981' : '#F59E0B', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>{u.subscription_status === 'active' ? 'Actif' : 'Inactif'}</span></td>
                        <td style={{ color: u.role === 'admin' ? theme.light : mutedColor }}>{u.role}</td>
                        <td style={{ color: mutedColor }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>}

          {/* ADMIN — COMMISSIONS À PAYER */}
          {page === 'commissions' && isAdmin && <>
            <div style={{ ...S.section, border: `1px solid ${theme.accent}55`, background: theme.accent + '11', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Total à verser ce mois ({adminMonth})</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: theme.light }}>{adminGrandTotal.toFixed(2)} €</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Parrains à payer</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: textColor }}>{adminCommissions.length}</div>
                </div>
              </div>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Détail des commissions à verser</div>
              {adminCommissions.length === 0 ? (
                <div style={S.empty}>
                  <div style={{ fontSize: 28, opacity: 0.3, marginBottom: 10 }}>💰</div>
                  <div style={{ fontSize: 13 }}>Aucune commission ce mois — pas encore de parrainages actifs</div>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Parrain</th><th>Email</th><th>Code</th><th>Filleuls</th><th>À verser</th><th>Payé ?</th></tr></thead>
                  <tbody>
                    {adminCommissions.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{c.full_name}</td>
                        <td style={{ color: mutedColor }}>{c.email}</td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: theme.light }}>{c.referral_code}</span></td>
                        <td style={{ color: textColor }}>{c.filleuls}</td>
                        <td style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>{c.total.toFixed(2)} €</td>
                        <td>
                          <span style={{ background: '#F59E0B22', color: '#F59E0B', fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600, cursor: 'pointer' }}>
                            À verser
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ ...S.section, borderColor: theme.border }}>
              <div style={S.sectionTitle}>Comment verser les paiements</div>
              {[
                ['1', 'Copie l\'email du parrain', 'Depuis le tableau ci-dessus'],
                ['2', 'Envoie le montant via PayPal ou virement', 'Le montant exact est indiqué dans la colonne "À verser"'],
                ['3', 'Marque comme payé', 'Pour garder un suivi (fonctionnalité automatique bientôt disponible)'],
              ].map(([n, t, sub]) => (
                <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: theme.accent + '22', border: `1px solid ${theme.accent}`, color: theme.light, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: textColor }}>{t}</div><div style={{ fontSize: 11, color: mutedColor }}>{sub}</div></div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
    </>
  );
}

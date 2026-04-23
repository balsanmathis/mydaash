import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Non autorisé' });

  let decoded;
  try {
    decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch { return res.status(401).json({ error: 'Token invalide' }); }

  if (decoded.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const { data: commissions } = await supabase
      .from('commissions')
      .select('*, referrer:referrer_id(email, full_name, referral_code)')
      .eq('status', 'active')
      .eq('month', currentMonth);

    // Grouper par parrain
    const byReferrer = {};
    for (const c of commissions || []) {
      const key = c.referrer_id;
      if (!byReferrer[key]) {
        byReferrer[key] = {
          referrer_id: key,
          email: c.referrer?.email || '—',
          full_name: c.referrer?.full_name || '—',
          referral_code: c.referrer?.referral_code || '—',
          filleuls: 0,
          total: 0,
        };
      }
      byReferrer[key].filleuls += 1;
      byReferrer[key].total += parseFloat(c.amount || 0);
    }

    const result = Object.values(byReferrer).sort((a, b) => b.total - a.total);
    const grandTotal = result.reduce((s, r) => s + r.total, 0);

    return res.status(200).json({ commissions: result, grandTotal, month: currentMonth });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

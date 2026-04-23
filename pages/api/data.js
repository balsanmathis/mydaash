import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Non autorisé' });

  let decoded;
  try {
    decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }

  try {
    const { data: dashboards } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false });

    const { data: commissions } = await supabase
      .from('commissions')
      .select('*')
      .eq('referrer_id', decoded.userId)
      .eq('status', 'active');

    const totalRevenue = (commissions || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);

    let allUsers = [];
    if (decoded.role === 'admin') {
      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name, referral_code, subscription_status, role, created_at')
        .order('created_at', { ascending: false });
      allUsers = users || [];
    }

    return res.status(200).json({
      dashboards: dashboards || [],
      commissions: commissions || [],
      totalRevenue,
      allUsers,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function getUser(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try { return jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET); }
  catch { return null; }
}

export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Non autorisé' });

  if (req.method === 'POST') {
    const { name, theme, widgets, cols, font } = req.body;
    const { data, error } = await supabase
      .from('dashboards')
      .insert({ user_id: user.userId, name, theme: theme || 'violet', widgets: widgets || [], cols: cols || 2, font: font || 'DM Sans' })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ dashboard: data });
  }

  if (req.method === 'PUT') {
    const { id, name, theme, widgets, cols, font } = req.body;
    const { data, error } = await supabase
      .from('dashboards')
      .update({ name, theme, widgets, cols, font, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', user.userId)
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ dashboard: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase
      .from('dashboards')
      .delete().eq('id', id).eq('user_id', user.userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

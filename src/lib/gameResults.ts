import { supabase } from '../lib/supabaseClient';

export async function saveGameResult(score: number, extraData: Record<string, any> = {}) {
  const session = await supabase.auth.getSession();
  const user = session.data.session?.user;
  if (!user) throw new Error('Usuario no autenticado');

  const { error } = await supabase.from('game_results').insert([
    {
      user_id: user.id,
      score,
      ...extraData,
    },
  ]);
  if (error) throw error;
}

export async function getUserGameResults() {
  const session = await supabase.auth.getSession();
  const user = session.data.session?.user;
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('game_results')
    .select('user_id, score, created_at')
    .order('score', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

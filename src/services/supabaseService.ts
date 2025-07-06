import supabase from '../supabase';

// Tipo para as entradas do leaderboard
export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  player_score: number;
  created_at?: string;
}

// Listar todas as entradas da tabela leaderboards ordenadas por score (decrescente)
export const find = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .order('player_score', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar leaderboard:', error);
    throw error;
  }
};

// Inserir uma nova entrada na tabela leaderboards
export const create = async (entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<LeaderboardEntry> => {
  try {
    const { data, error } = await supabase
      .from('leaderboards')
      .insert([
        {
          player_name: entry.player_name,
          player_score: entry.player_score
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar entrada no leaderboard:', error);
    throw error;
  }
};
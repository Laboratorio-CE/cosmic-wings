// Tipos para o sistema de áudio
export type MusicTrack = 'menu' | 'wave-1' | 'wave-2' | 'wave-3';
export type SoundEffect = 'boost' | 'boss-kill' | 'enemy-fire';

export interface AudioState {
  musicMuted: boolean;
  soundMuted: boolean;
  currentTrack: MusicTrack | null;
}
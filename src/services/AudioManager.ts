// Importações dos arquivos de áudio
import menuMusic from '../assets/audios/music/ost-menu.mp3';
import wave1Music from '../assets/audios/music/ost-wave-1.mp3';
import wave2Music from '../assets/audios/music/ost-wave-2.mp3';
import wave3Music from '../assets/audios/music/ost-wave-3.mp3';

import boostSfx from '../assets/audios/sfx/boost.wav';
import bossKillSfx from '../assets/audios/sfx/boss-kill.wav';
import enemyFireSfx from '../assets/audios/sfx/enemy-fire.wav';
import enemyKillSfx from '../assets/audios/sfx/enemy-kill.wav';
import engineSfx from '../assets/audios/sfx/engine.wav';
import menuConfirmSfx from '../assets/audios/sfx/menu-confirm.wav';
import menuNavigateSfx from '../assets/audios/sfx/menu-navigate.wav';
import playerFireSfx from '../assets/audios/sfx/player-fire.wav';
import playerKillSfx from '../assets/audios/sfx/player-kill.wav';
import powerupSfx from '../assets/audios/sfx/powerup.wav';

// Tipos para o sistema de áudio
export type MusicTrack = 'menu' | 'wave-1' | 'wave-2' | 'wave-3';
export type SoundEffect = 'boost' | 'boss-kill' | 'enemy-fire' | 'enemy-kill' | 'engine' | 'menu-confirm' | 'menu-navigate' | 'player-fire' | 'player-kill' | 'powerup';

export interface AudioState {
  musicMuted: boolean;
  soundMuted: boolean;
  currentTrack: MusicTrack | null;
}

// Singleton para gerenciar todo o sistema de áudio
class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement | null = null;
  private soundEffects: Map<SoundEffect, HTMLAudioElement> = new Map();
  private musicMuted: boolean = false;
  private soundMuted: boolean = false;
  private currentTrack: MusicTrack | null = null;
  private fadeInterval: NodeJS.Timeout | null = null;

  // Mapeamento dos arquivos de música
  private musicTracks: Record<MusicTrack, string> = {
    'menu': menuMusic,
    'wave-1': wave1Music,
    'wave-2': wave2Music,
    'wave-3': wave3Music,
  };

  // Mapeamento dos arquivos de efeitos sonoros
  private soundEffectFiles: Record<SoundEffect, string> = {
    'boost': boostSfx,
    'boss-kill': bossKillSfx,
    'enemy-fire': enemyFireSfx,
    'enemy-kill': enemyKillSfx,
    'engine': engineSfx,
    'menu-confirm': menuConfirmSfx,
    'menu-navigate': menuNavigateSfx,
    'player-fire': playerFireSfx,
    'player-kill': playerKillSfx,
    'powerup': powerupSfx,
  };

  // Construtor privado para implementar Singleton
  private constructor() {
    this.preloadSoundEffects();
  }

  // Método estático para obter a instância única
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Pré-carrega todos os efeitos sonoros
  private preloadSoundEffects(): void {
    Object.entries(this.soundEffectFiles).forEach(([effect, file]) => {
      try {
        const audio = new Audio(file);
        audio.preload = 'auto';
        audio.volume = 0.3; // Volume moderado para efeitos
        this.soundEffects.set(effect as SoundEffect, audio);
      } catch (error) {
        console.warn(`Erro ao pré-carregar efeito sonoro ${effect}:`, error);
      }
    });
  }

  // Reproduz música de fundo
  async playBackgroundMusic(track: MusicTrack): Promise<void> {
    // Se a mesma música já está tocando, não fazer nada
    if (this.currentTrack === track && this.backgroundMusic && !this.backgroundMusic.paused) {
      return;
    }

    // Parar música atual se existir
    this.stopBackgroundMusic();

    // Não iniciar se estiver mutado
    if (this.musicMuted) {
      this.currentTrack = track;
      return;
    }

    try {
      const musicFile = this.musicTracks[track];
      this.backgroundMusic = new Audio(musicFile);
      this.backgroundMusic.volume = 0.1; // Volume baixo para música de fundo
      this.backgroundMusic.loop = true;
      this.currentTrack = track;

      // Aguardar carregamento
      await new Promise<void>((resolve, reject) => {
        const handleCanPlay = () => {
          this.backgroundMusic?.removeEventListener('canplay', handleCanPlay);
          this.backgroundMusic?.removeEventListener('error', handleError);
          resolve();
        };

        const handleError = (error: Event) => {
          this.backgroundMusic?.removeEventListener('canplay', handleCanPlay);
          this.backgroundMusic?.removeEventListener('error', handleError);
          reject(error);
        };

        this.backgroundMusic?.addEventListener('canplay', handleCanPlay);
        this.backgroundMusic?.addEventListener('error', handleError);
      });

      // Reproduzir se ainda não estiver mutado
      if (!this.musicMuted && this.backgroundMusic) {
        await this.backgroundMusic.play();
      }
    } catch (error) {
      console.error(`Erro ao reproduzir música ${track}:`, error);
    }
  }

  // Para música de fundo com fade out
  stopBackgroundMusic(): void {
    if (!this.backgroundMusic) return;

    // Limpar fade anterior se existir
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const fadeOutDuration = 1000; // 1 segundo
    const fadeSteps = 20;
    const volumeStep = this.backgroundMusic.volume / fadeSteps;
    const stepDuration = fadeOutDuration / fadeSteps;

    this.fadeInterval = setInterval(() => {
      if (this.backgroundMusic && this.backgroundMusic.volume > volumeStep) {
        this.backgroundMusic.volume -= volumeStep;
      } else {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        if (this.backgroundMusic) {
          this.backgroundMusic.pause();
          this.backgroundMusic.currentTime = 0;
          this.backgroundMusic = null;
        }
        this.currentTrack = null;
      }
    }, stepDuration);
  }

  // Reproduz efeito sonoro
  playSoundEffect(effect: SoundEffect): void {
    if (this.soundMuted) return;

    const audio = this.soundEffects.get(effect);
    if (audio) {
      try {
        // Reset para permitir múltiplas reproduções
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.warn(`Erro ao reproduzir efeito ${effect}:`, error);
        });
      } catch (error) {
        console.warn(`Erro ao reproduzir efeito ${effect}:`, error);
      }
    }
  }

  // Toggle música de fundo
  async toggleMusic(): Promise<void> {
    this.musicMuted = !this.musicMuted;

    if (this.musicMuted) {
      // Pausar música atual
      if (this.backgroundMusic && !this.backgroundMusic.paused) {
        this.backgroundMusic.pause();
      }
    } else {
      // Retomar música se havia uma tocando
      if (this.currentTrack) {
        try {
          await this.playBackgroundMusic(this.currentTrack);
        } catch (error) {
          console.error('Erro ao retomar música:', error);
        }
      }
    }
  }

  // Toggle efeitos sonoros
  toggleSound(): void {
    this.soundMuted = !this.soundMuted;
    
    // Mutar/desmutar todos os efeitos sonoros
    this.soundEffects.forEach(audio => {
      audio.muted = this.soundMuted;
    });
  }

  // Getters para estado atual
  get isMusicMuted(): boolean {
    return this.musicMuted;
  }

  get isSoundMuted(): boolean {
    return this.soundMuted;
  }

  get getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  get getAudioState(): AudioState {
    return {
      musicMuted: this.musicMuted,
      soundMuted: this.soundMuted,
      currentTrack: this.currentTrack,
    };
  }

  // Método para limpar recursos (cleanup)
  dispose(): void {
    // Parar música
    this.stopBackgroundMusic();

    // Limpar efeitos sonoros
    this.soundEffects.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.soundEffects.clear();

    // Limpar fade interval
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }
}

export default AudioManager;
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
  private userInteracted: boolean = false;
  private originalMusicVolume: number = 0.1;
  private originalSoundVolume: number = 0.3;
  private autoplayListeners: { tryPlay: () => Promise<void> } | null = null;

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
        audio.volume = this.originalSoundVolume; // Volume moderado para efeitos
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

    // Definir a track atual sempre, mesmo se mutado
    this.currentTrack = track;

    // Não iniciar se estiver mutado
    if (this.musicMuted) {
      return;
    }

    try {
      const musicFile = this.musicTracks[track];
      this.backgroundMusic = new Audio(musicFile);
      this.backgroundMusic.volume = this.originalMusicVolume;
      this.backgroundMusic.loop = true;

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

      // Tentar reproduzir imediatamente com diferentes estratégias
      if (this.backgroundMusic) {
        await this.attemptAutoplay();
      }
    } catch (error) {
      console.error(`Erro ao reproduzir música ${track}:`, error);
    }
  }

  // Método para tentar autoplay com diferentes estratégias
  private async attemptAutoplay(): Promise<void> {
    if (!this.backgroundMusic || this.musicMuted) return;

    // Estratégia 1: Tentar reproduzir diretamente
    try {
      await this.backgroundMusic.play();
      this.userInteracted = true;
      console.log('Música iniciada automaticamente');
      return;
    } catch (error) {
      console.log('Autoplay bloqueado pelo navegador, aguardando interação do usuário');
    }

    // Estratégia 2: Configurar para tentar novamente em eventos específicos
    this.setupAutoplayListeners();
  }

  // Configura listeners para tentar autoplay em eventos específicos
  private setupAutoplayListeners(): void {
    if (this.userInteracted || !this.backgroundMusic || this.autoplayListeners) return;

    const tryPlay = async () => {
      if (this.userInteracted || !this.backgroundMusic || this.musicMuted) return;
      
      try {
        await this.backgroundMusic.play();
        this.userInteracted = true;
        console.log('Música iniciada após interação do usuário');
        this.removeAutoplayListeners();
      } catch (error) {
        // Ainda não conseguiu, listeners continuam ativos
        console.log('Tentativa de reprodução falhou, aguardando próxima interação');
      }
    };

    // Adicionar listeners para diferentes tipos de interação
    document.addEventListener('click', tryPlay, { once: false });
    document.addEventListener('keydown', tryPlay, { once: false });
    document.addEventListener('touchstart', tryPlay, { once: false });
    document.addEventListener('mousedown', tryPlay, { once: false });
    
    // Também tentar em eventos de visibilidade
    document.addEventListener('visibilitychange', tryPlay, { once: false });
    window.addEventListener('focus', tryPlay, { once: false });

    // Armazenar referência para remoção posterior
    this.autoplayListeners = { tryPlay };
  }

  // Remove listeners de autoplay
  private removeAutoplayListeners(): void {
    if (this.autoplayListeners) {
      const { tryPlay } = this.autoplayListeners;
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('keydown', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('mousedown', tryPlay);
      document.removeEventListener('visibilitychange', tryPlay);
      window.removeEventListener('focus', tryPlay);
      this.autoplayListeners = null;
    }
  }

  // Para música de fundo com fade out
  stopBackgroundMusic(): void {
    if (!this.backgroundMusic) return;

    // Limpar listeners de autoplay ativos
    this.removeAutoplayListeners();

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
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Marcar como interagido se conseguir reproduzir
            this.userInteracted = true;
          }).catch(error => {
            // Se falhar por falta de interação, não fazer nada especial
            if (!this.userInteracted) {
              console.log(`Efeito ${effect} aguardando primeira interação`);
            } else {
              console.warn(`Erro ao reproduzir efeito ${effect}:`, error);
            }
          });
        }
      } catch (error) {
        console.warn(`Erro ao reproduzir efeito ${effect}:`, error);
      }
    }
  }

  // Toggle música de fundo
  async toggleMusic(): Promise<void> {
    this.musicMuted = !this.musicMuted;

    if (this.musicMuted) {
      // Setar volume para 0 em vez de pausar
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = 0;
      }
    } else {
      // Retomar volume original
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = this.originalMusicVolume;
      } else if (this.currentTrack && this.userInteracted) {
        // Se não há música tocando mas deveria ter, iniciar
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
    
    // Setar volume para 0 ou volume original para todos os efeitos sonoros
    this.soundEffects.forEach(audio => {
      audio.volume = this.soundMuted ? 0 : this.originalSoundVolume;
    });
  }

  // Método para tentar iniciar música após interação do usuário
  async tryStartPendingMusic(): Promise<void> {
    if (this.userInteracted) return; // Já foi iniciado
    
    this.userInteracted = true;
    
    // Tentar iniciar música se houver uma pendente
    if (this.currentTrack && !this.musicMuted && this.backgroundMusic && this.backgroundMusic.paused) {
      try {
        await this.backgroundMusic.play();
        console.log('Música pendente iniciada com sucesso');
      } catch (error) {
        console.error('Erro ao iniciar música pendente:', error);
        // Reset do estado para permitir nova tentativa
        this.userInteracted = false;
      }
    }
  }

  // Método para resetar estado de interação (usado principalmente para debugging/testes)
  resetUserInteraction(): void {
    this.userInteracted = false;
    this.removeAutoplayListeners();
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

    // Limpar listeners de autoplay
    this.removeAutoplayListeners();

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
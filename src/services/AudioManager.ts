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
  // Desbloqueia contexto de áudio para todos os elementos de áudio
  unlockAudioContext(): void {
    // Tenta reproduzir e pausar rapidamente todos os efeitos e música para desbloquear contexto
    if (this.backgroundMusic) {
      try {
      this.backgroundMusic.play().then(() => {
        this.backgroundMusic?.pause();
      }).catch((error) => {
        console.warn('Erro ao desbloquear contexto de áudio da música:', error);
      });
      } catch (error) {
      console.warn('Erro ao tentar desbloquear contexto de áudio da música:', error);
      }
    }
    this.soundEffects.forEach(audio => {
      try {
      audio.play().then(() => {
        audio.pause();
      }).catch((error) => {
        console.warn('Erro ao desbloquear contexto de áudio do efeito:', error);
      });
      } catch (error) {
      console.warn('Erro ao tentar desbloquear contexto de áudio do efeito:', error);
      }
    });
    // Marca que o usuário interagiu para liberar tentativas futuras
    this.userInteracted = true;
    // Remove listeners de autoplay se existirem
    this.removeAutoplayListeners();
  }
  private static instance: AudioManager | undefined;
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
    if (AudioManager.instance) {
      // Se já existe instância, retorna ela
      return AudioManager.instance;
    }
    this.preloadSoundEffects();
    AudioManager.instance = this;
  }

  // Método estático para obter a instância única
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  
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
    if (this.currentTrack === track && this.backgroundMusic && !this.backgroundMusic.paused && !this.musicMuted) {
      return;
    }

    // Parar música atual se existir
    if (this.backgroundMusic && this.currentTrack !== track) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
    
    // Definir a track atual
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

      // Tentar reproduzir imediatamente
      await this.backgroundMusic.play();
    } catch (error) {
      // console.error(`Erro ao reproduzir música ${track}:`, error);
      // Tentar novamente após interação do usuário
      this.setupAutoplayListeners();
    }
  }

  // Método para tentar autoplay com diferentes estratégias
  private async attemptAutoplay(): Promise<void> {
    if (!this.backgroundMusic || this.musicMuted) return;

    // Estratégia 1: Tentar reproduzir diretamente
    try {
      await this.backgroundMusic.play();
      this.userInteracted = true;

      return;
    } catch (error) {
      console.warn('Erro ao tentar autoplay da música:', error);
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

        this.removeAutoplayListeners();
      } catch (error) {
        console.warn('Erro ao tentar autoplay da música após interação:', error);
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

  /**
   * Para música de fundo imediatamente (usado para transição de música).
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    this.removeAutoplayListeners();
  }

  /**
   * Versão assíncrona para aguardar fade out.
   * Use para garantir que a música do menu pare suavemente antes de iniciar a do gamecanvas.
   */
  async stopBackgroundMusicAsync(fadeOutDuration: number = 1000): Promise<void> {
    if (!this.backgroundMusic) return;
    this.removeAutoplayListeners();
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    const fadeSteps = 20;
    const volumeStep = this.backgroundMusic.volume / fadeSteps;
    const stepDuration = fadeOutDuration / fadeSteps;
    return new Promise<void>((resolve) => {
      let steps = 0;
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
          resolve();
        }
        steps++;
        if (steps >= fadeSteps) {
          // Garante que não fique preso
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
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Pausa imediatamente a música de fundo.
   * Use no momento do gameover para evitar sobreposição.
   */
  public pauseBackgroundMusic(): void {
    if (this.backgroundMusic && !this.backgroundMusic.paused) {
      this.backgroundMusic.pause();
    }
  }

  // Retoma música pausada (usado para unmute)
  private resumeBackgroundMusic(): void {
    if (this.backgroundMusic && this.backgroundMusic.paused) {
      this.backgroundMusic.play().catch(error => {
        console.warn('Erro ao retomar música:', error);
      });
    }
  }

  
  playSoundEffect(effect: SoundEffect): void {
    // Proteção extra: se o Map estiver vazio, tenta re-preload
    if (this.soundEffects.size === 0) {

      this.preloadSoundEffects();
    }



    this.markUserInteraction();
    if (this.soundMuted) {

      return;
    }
    const audio = this.soundEffects.get(effect);
    if (audio) {
      try {

        // Reset para permitir múltiplas reproduções
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise

            .catch(error => {
              console.warn(`Erro ao reproduzir efeito ${effect}:`, error);
            });
        }
      } catch (error) {
        console.warn(`Erro ao reproduzir efeito ${effect}:`, error);
      }
    } else {


    }
  }

  // Toggle música de fundo
  async toggleMusic(): Promise<void> {
    // Marcar interação do usuário
    this.markUserInteraction();
    
    this.musicMuted = !this.musicMuted;

    if (this.musicMuted) {
      // Pausar música em vez de zerar volume
      this.pauseBackgroundMusic();
    } else {
      // Se há música carregada, retomar
      if (this.backgroundMusic) {
        this.resumeBackgroundMusic();
      } else if (this.currentTrack) {
        // Se não há música carregada mas há uma track definida, iniciar
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
    // Marcar interação do usuário
    this.markUserInteraction();
    
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
    if (this.currentTrack && !this.musicMuted) {
      try {
        await this.playBackgroundMusic(this.currentTrack);

      } catch (error) {
        console.error('Erro ao iniciar música pendente:', error);
        // Reset do estado para permitir nova tentativa
        this.userInteracted = false;
      }
    }
  }

  // Método para forçar interação do usuário (chamado pelos botões)
  markUserInteraction(): void {
    if (!this.userInteracted) {
      this.userInteracted = true;
      // Se há uma música definida e não está mutada, tentar tocar
      if (this.currentTrack && !this.musicMuted) {
        this.playBackgroundMusic(this.currentTrack).catch(error => {
          console.error('Erro ao tentar tocar música após interação do usuário:', error);
        });
      }
    }
  }

  // Método para resetar estado de interação (usado principalmente para debugging/testes)
  resetUserInteraction(): void {
    this.userInteracted = false;
    this.removeAutoplayListeners();
  }

  // Método para obter track baseada na onda
  private getTrackForWave(wave: number): MusicTrack {
    // Música 1 para ondas 1, música 2 para ondas 2-3, música 3 para ondas 4-5, etc.
    const musicList: MusicTrack[] = ['wave-1', 'wave-2', 'wave-3'];
    if (wave === 1) return musicList[0];
    // Troca a cada onda par (2, 4, 6, ...)
    const trackIndex = Math.floor((wave - 2) / 5) + 1;
    return musicList[trackIndex % musicList.length];
  }

  // Método público para tocar música baseada na onda
  async playWaveMusic(wave: number): Promise<void> {
    const track = this.getTrackForWave(wave);
    // Só troca se a música realmente mudou
    if (this.currentTrack !== track) {
      await this.playBackgroundMusic(track);
    }
  }

  // Método para fazer transição suave da música do jogo para menu
  async transitionToMenuMusic(): Promise<void> {
    // Pausa imediatamente a música atual para evitar sobreposição
    this.pauseBackgroundMusic();
    
    // Aguarda um breve momento para garantir que a música parou
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Inicia música do menu
    await this.playBackgroundMusic('menu');
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
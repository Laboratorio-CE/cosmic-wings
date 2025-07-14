import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameUI from "./GameUI";
import ScoreSystem from "../game/systems/ScoreSystem";
import PositionManager from "../game/systems/PositionManager";
import AudioManager from "../services/AudioManager";
import EnemyTypeA from "../game/entities/EnemyTypeA";
import EnemyTypeB from "../game/entities/EnemyTypeB";
import EnemyTypeC from "../game/entities/EnemyTypeC";
import BossTypeA from "../game/entities/BossTypeA";
import BossTypeB from "../game/entities/BossTypeB";
import BossTypeC from "../game/entities/BossTypeC";
import ScrollingBackground from "./ScrollingBackground";

// Importar as imagens do player
import playerFrame1 from '../assets/images/player/player-frame-1.png';
import playerFrame2 from '../assets/images/player/player-frame-2.png';
import playerFrame3 from '../assets/images/player/player-frame-3.png';

// Importar sprite dos efeitos
import playerFire from '../assets/images/effects/player-fire.png';
import enemyFire from '../assets/images/effects/enemy-fire.png';

// Importar sprites de destruição
import deathFrame1 from '../assets/images/effects/death-frame-1.png';
import deathFrame2 from '../assets/images/effects/death-frame-2.png';
import deathFrame3 from '../assets/images/effects/death-frame-3.png';
import deathFrame4 from '../assets/images/effects/death-frame-4.png';
import deathFrame5 from '../assets/images/effects/death-frame-5.png';
import deathFrame6 from '../assets/images/effects/death-frame-6.png';
import deathFrame7 from '../assets/images/effects/death-frame-7.png';
import deathFrame8 from '../assets/images/effects/death-frame-8.png';
import deathFrame9 from '../assets/images/effects/death-frame-9.png';

// Importar sprites do inimigo tipo A
import enemyAFrame1 from '../assets/images/enemy/enemy-A-frame-1.png';
import enemyAFrame2 from '../assets/images/enemy/enemy-A-frame-2.png';
import enemyAFrame3 from '../assets/images/enemy/enemy-A-frame-3.png';

// Importar sprites do inimigo tipo B
import enemyBFrame1 from '../assets/images/enemy/enemy-B-frame-1.png';
import enemyBFrame2 from '../assets/images/enemy/enemy-B-frame-2.png';
import enemyBFrame3 from '../assets/images/enemy/enemy-B-frame-3.png';

// Importar sprites do inimigo tipo C
import enemyCFrame1 from '../assets/images/enemy/enemy-C-frame-1.png';
import enemyCFrame2 from '../assets/images/enemy/enemy-C-frame-2.png';
import enemyCFrame3 from '../assets/images/enemy/enemy-C-frame-3.png';

// Importar sprites do boss tipo A
import bossAFrame1 from '../assets/images/enemy/boss-A-frame-1.png';
import bossAFrame2 from '../assets/images/enemy/boss-A-frame-2.png';
import bossAFrame3 from '../assets/images/enemy/boss-A-frame-3.png';

// Importar sprites do boss tipo B
import bossBFrame1 from '../assets/images/enemy/boss-B-frame-1.png';
import bossBFrame2 from '../assets/images/enemy/boss-B-frame-2.png';
import bossBFrame3 from '../assets/images/enemy/boss-B-frame-3.png';

// Importar sprites do boss tipo C
import bossCFrame1 from '../assets/images/enemy/boss-C-frame-1.png';
import bossCFrame2 from '../assets/images/enemy/boss-C-frame-2.png';
import bossCFrame3 from '../assets/images/enemy/boss-C-frame-3.png';

// Importar sprite do tiro do boss
import bossFire from '../assets/images/effects/boss-fire.png';

// Importar os audios do jogador
import playerShoot from '../assets/audios/sfx/player-fire.wav';
import playerKill from "../assets/audios/sfx/player-kill.wav";

// Importar os audios dos inimigos
import enemyShoot from '../assets/audios/sfx/enemy-fire.wav';
import enemyKill from "../assets/audios/sfx/enemy-kill.wav";
import bossKill from "../assets/audios/sfx/boss-kill.wav";

// Importar o audio de transição de onda
import boost from '../assets/audios/sfx/boost.wav';
import engine from '../assets/audios/sfx/engine.wav';

// Importar o audio de vida extra
import powerup from '../assets/audios/sfx/powerup.wav';

// Importar as músicas de fundo
import ostWave1 from '../assets/audios/music/ost-wave-1.mp3';
import ostWave2 from '../assets/audios/music/ost-wave-2.mp3';
import ostWave3 from '../assets/audios/music/ost-wave-3.mp3';

interface GameCanvasProps {
  backgroundSpeed?: number;
  onNavigate?: (route: string, data?: { score?: number }) => void;
  showUI?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ backgroundSpeed = .75, onNavigate, showUI = true }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const scoreSystemRef = useRef<ScoreSystem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'paused' | 'gameOver'>('preparing');
  const [lives, setLives] = useState(3);
  const [, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [currentBackgroundSpeed, setCurrentBackgroundSpeed] = useState(backgroundSpeed);
  const [showWaveMessage, setShowWaveMessage] = useState(false);
  const [waveMessageText, setWaveMessageText] = useState('');
  
  // Ref para acessar hiScore atual não causar reexecução do useEffect
  const hiScoreRef = useRef(hiScore);

  // Instância do AudioManager
  const audioManager = AudioManager.getInstance();

  // Sistema do Konami Code
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  const konamiInputRef = useRef<string[]>([]);
  
  // Sistema de invencibilidade permanente
  const invincibleSequence = ['KeyI', 'KeyA', 'KeyM', 'KeyI', 'KeyN', 'KeyV', 'KeyI', 'KeyN', 'KeyC', 'KeyI', 'KeyB', 'KeyL', 'KeyE'];
  const invincibleInputRef = useRef<string[]>([]);

  // Event listener para pausa global
  useEffect(() => {
    const handleTogglePause = () => {
  
      
      if (gameState === 'playing') {

        setGameState('paused');
        // Pausar o background
        setCurrentBackgroundSpeed(0);
        // Pausar o jogo Phaser completamente
        if (gameRef.current) {

          gameRef.current.scene.pause('MainGameScene');
        }
      } else if (gameState === 'paused') {

        setGameState('playing');
        // Retomar o background
        setCurrentBackgroundSpeed(backgroundSpeed);
        // Retomar o jogo Phaser
        if (gameRef.current) {

          gameRef.current.scene.resume('MainGameScene');
        }
      }
    };

    window.addEventListener('toggleGamePause', handleTogglePause);
    
    return () => {
      window.removeEventListener('toggleGamePause', handleTogglePause);
    };
  }, [gameState, backgroundSpeed]);

  // Listener para tecla ESC e Konami Code
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Dispatchar evento de pausa/retomada
        window.dispatchEvent(new CustomEvent('toggleGamePause'));
      }
      
      // Detectar códigos apenas quando pausado
      if (gameState === 'paused') {
        // Konami Code
        konamiInputRef.current = [...konamiInputRef.current, event.code];
        if (konamiInputRef.current.length > 10) {
          konamiInputRef.current.shift();
        }
        if (konamiInputRef.current.length === 10) {
          const isKonamiCode = konamiInputRef.current.every((key, index) => key === konamiSequence[index]);
          if (isKonamiCode) {
            if (gameRef.current) {
              const scene = gameRef.current.scene.getScene('MainGameScene') as any;
              if (scene) {
                scene.playerLives++;
                setLives(scene.playerLives);
                audioManager.playSoundEffect('powerup');
              }
            }
            konamiInputRef.current = [];
          }
        }
        
        // Código de invencibilidade
        invincibleInputRef.current = [...invincibleInputRef.current, event.code];
        if (invincibleInputRef.current.length > 13) {
          invincibleInputRef.current.shift();
        }
        if (invincibleInputRef.current.length === 13) {
          const isInvincibleCode = invincibleInputRef.current.every((key, index) => key === invincibleSequence[index]);
          if (isInvincibleCode) {
            if (gameRef.current) {
              const scene = gameRef.current.scene.getScene('MainGameScene') as any;
              if (scene) {
                scene.isPermanentlyInvulnerable = !scene.isPermanentlyInvulnerable;
                audioManager.playSoundEffect('boost');
              }
            }
            invincibleInputRef.current = [];
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, audioManager]);

  // Sincronizar estado do jogo com outros componentes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('gameStateChange', { 
      detail: { gameState } 
    }));
    
    // Limpar inputs dos códigos quando não estiver pausado
    if (gameState !== 'paused') {
      konamiInputRef.current = [];
      invincibleInputRef.current = [];
    }
  }, [gameState]);
  
  // Atualizar ref sempre que hiScore mudar
  useEffect(() => {
    hiScoreRef.current = hiScore;
  }, [hiScore]);

  // Listener para mudanças de velocidade do background durante transições
  useEffect(() => {
    const handleBackgroundSpeedChange = (event: CustomEvent) => {
      setCurrentBackgroundSpeed(event.detail.speed);
    };

    const handleShowWaveMessage = (event: CustomEvent) => {
      setWaveMessageText(event.detail.message);
      setShowWaveMessage(true);
      
      // Ocultar mensagem após 3 segundos
      setTimeout(() => {
        setShowWaveMessage(false);
      }, 3000);
    };

    const handlePhaserPreloadComplete = () => {

      setIsLoading(false);
      
      // Sequência de mensagens: "Preparar" (1s) → "Onda 1" (1s) → iniciar jogo
      setTimeout(() => {
        setWaveMessageText('Preparar');
        setShowWaveMessage(true);
        
        setTimeout(() => {
          setWaveMessageText('Onda 1');
          
          setTimeout(() => {
            setShowWaveMessage(false);
            
            // Iniciar o jogo
            if (gameRef.current) {
              const gameScene = gameRef.current.scene.getScene('MainGameScene') as Phaser.Scene & { startGame?: () => void };
              if (gameScene && gameScene.startGame) {
                gameScene.startGame();
              }
            }
          }, 1000);
        }, 1000);
      }, 100); // Pequeno delay para garantir que a tela de loading seja removida
    };

    window.addEventListener('changeBackgroundSpeed', handleBackgroundSpeedChange as EventListener);
    window.addEventListener('showWaveMessage', handleShowWaveMessage as EventListener);
    window.addEventListener('phaserPreloadComplete', handlePhaserPreloadComplete as EventListener);
    
    return () => {
      window.removeEventListener('changeBackgroundSpeed', handleBackgroundSpeedChange as EventListener);
      window.removeEventListener('showWaveMessage', handleShowWaveMessage as EventListener);
      window.removeEventListener('phaserPreloadComplete', handlePhaserPreloadComplete as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // =============================================
    // CLASSE DE ANIMAÇÃO DE DESTRUIÇÃO
    // =============================================
    class DeathAnimation {
      scene: Phaser.Scene;
      sprite: Phaser.GameObjects.Sprite;
      onComplete?: () => void;
      
      constructor(scene: Phaser.Scene, x: number, y: number, onComplete?: () => void) {
        this.scene = scene;
        this.onComplete = onComplete;
        
        // Criar sprite da animação de destruição
        this.sprite = scene.add.sprite(x, y, 'death-frame-1');
        this.sprite.setScale(0.8);
        
        // Executar animação sequencial
        this.playDeathAnimation();
      }
      
      private playDeathAnimation() {
        let currentFrame = 1;
        
        const nextFrame = () => {
          if (currentFrame <= 9) {
            this.sprite.setTexture(`death-frame-${currentFrame}`);
            currentFrame++;
            
            // Próximo frame após 80ms
            this.scene.time.delayedCall(80, nextFrame);
          } else {
            // Animação concluída
            this.sprite.destroy();
            if (this.onComplete) {
              this.onComplete();
            }
          }
        };
        
        nextFrame();
      }
    }


    // =============================================
    // CLASSE DA CENA DO JOGO
    // =============================================
    class GameScene extends Phaser.Scene {
      constructor() {
        super({ key: "MainGameScene" });
        // Inicializar o AudioManager
        this.audioManager = AudioManager.getInstance();
      }

      // Sistema de áudio centralizado
      audioManager: AudioManager;

      player: Phaser.GameObjects.Sprite | null = null;
      cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
      wasd: { [key: string]: Phaser.Input.Keyboard.Key } | null = null;
      playerSpeed = 300;
      lastMoveDirection = { x: 0, y: 0 };

      // Sistema de projéteis
      playerBullets: Phaser.GameObjects.Group | null = null;
      enemyBullets: Phaser.GameObjects.Group | null = null;
      enemies: (EnemyTypeA | EnemyTypeB | EnemyTypeC)[] = [];
      bulletSpeed = 650;
      fireRate = 150; // Milissegundos entre tiros
      lastFireTime = 0;
      fireKeys: { [key: string]: Phaser.Input.Keyboard.Key } | null = null;

      // Sistema de vidas do jogador
      playerLives = 3;
      isPlayerDead = false;
      isPlayerInvulnerable = false;
      isPermanentlyInvulnerable = false; // Invencibilidade permanente via código
      invulnerabilityDuration = 5000; // 5 segundos de invencibilidade
      invulnerabilityStartTime = 0;
      respawnDelay = 2000; // 2 segundos para respawn
      
      // Inicializar posição do jogador como dinâmica
      originalPlayerPosition = { x: 0, y: 0 };

      // Sistema de sub-ondas
      currentSubWave = 1;
      maxSubWaves = 3;
      subWaveDelay = 2000; // 2 segundos entre sub-ondas
      lastEnemyKilledTime = 0;

      // Sistema de contagem de inimigos
      enemiesDefeated = 0; // Contador de inimigos derrotados
      maxEnemiesInWave = 15; // Máximo de inimigos por onda
      currentWave = 1;

      // Sistema de boss
      currentBoss: BossTypeA | BossTypeB | BossTypeC | null = null;
      bossSpawnTimer = 0;
      shouldSpawnBoss = false;
      bossSpawnDelay = 5000; // 5 segundos

      // Sistema de controle de posições ocupadas
      positionManager!: PositionManager;

      // Sistema de limpeza de projéteis
      lastCleanupTime = 0;
      cleanupInterval = 2000; // Limpeza a cada 2 segundos

      // Sistema de transição de onda
      isInWaveTransition = false;
      playerControlsEnabled = true;
      transitionMoveSpeed = 150;

      // Sistema de spawn de inimigos
      enemySpawnEnabled = true;

      // Sistema de game over
      gameOverOverlay: Phaser.GameObjects.Rectangle | null = null;
      isGameOver = false;

      // Sistema de música removido - usando AudioManager centralizado
      
      // Sistema de pontuação
      scoreSystem: ScoreSystem | null = null;
      fadeInDuration = 1000; // 1 segundo para fade in

      // Controles móveis - estado das "teclas virtuais"
      mobileControls = {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false
      };



      // Reserva uma posição ocupada por um inimigo
      reservePosition(x: number, y: number, enemyId: string) {
        this.positionManager.reservePosition(x, y, enemyId);
      }

      // Libera uma posição ocupada por um inimigo
      releasePosition(enemyId: string) {
        this.positionManager.releasePosition(enemyId);
      }

      // Encontra uma posição livre próxima de (x, y) que não esteja ocupada
      findFreePosition(x: number, y: number): { x: number; y: number } {
        return this.positionManager.findFreePosition(x, y);
      }

      // Método para criar esmaecimento de game over
      createGameOverFade() {
        if (this.gameOverOverlay || this.isGameOver) return;

        this.isGameOver = true;

        // Criar retângulo preto que cobre toda a tela
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        this.gameOverOverlay = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x000000);
        this.gameOverOverlay.setAlpha(0); // Começa transparente
        this.gameOverOverlay.setDepth(1000); // Garantir que fique acima de tudo

        // Animar fade para preto
        this.tweens.add({
          targets: this.gameOverOverlay,
          alpha: 1, // Fade para 100% opaco (preto)
          duration: 2000, // 2 segundos para fazer o fade
          ease: "Power2",
          onComplete: () => {

          },
        });
      }

      preload() {
        // Carregar imagens do player
        this.load.image("player-frame-1", playerFrame1);
        this.load.image("player-frame-2", playerFrame2);
        this.load.image("player-frame-3", playerFrame3);

        // Carregar sprite do tiro do jogador
        this.load.image("player-fire", playerFire);

        // Carregar sprite do tiro do inimigo
        this.load.image("enemy-fire", enemyFire);

        // Carregar sprites de destruição
        this.load.image("death-frame-1", deathFrame1);
        this.load.image("death-frame-2", deathFrame2);
        this.load.image("death-frame-3", deathFrame3);
        this.load.image("death-frame-4", deathFrame4);
        this.load.image("death-frame-5", deathFrame5);
        this.load.image("death-frame-6", deathFrame6);
        this.load.image("death-frame-7", deathFrame7);
        this.load.image("death-frame-8", deathFrame8);
        this.load.image("death-frame-9", deathFrame9);

        // Carregar sprites do inimigo tipo A
        this.load.image("enemy-A-frame-1", enemyAFrame1);
        this.load.image("enemy-A-frame-2", enemyAFrame2);
        this.load.image("enemy-A-frame-3", enemyAFrame3);

        // Carregar sprites do inimigo tipo B
        this.load.image("enemy-B-frame-1", enemyBFrame1);
        this.load.image("enemy-B-frame-2", enemyBFrame2);
        this.load.image("enemy-B-frame-3", enemyBFrame3);

        // Carregar sprites do inimigo tipo C
        this.load.image("enemy-C-frame-1", enemyCFrame1);
        this.load.image("enemy-C-frame-2", enemyCFrame2);
        this.load.image("enemy-C-frame-3", enemyCFrame3);

        // Carregar sprites do boss tipo A
        this.load.image("boss-A-frame-1", bossAFrame1);
        this.load.image("boss-A-frame-2", bossAFrame2);
        this.load.image("boss-A-frame-3", bossAFrame3);

        // Carregar sprites do boss tipo B
        this.load.image("boss-B-frame-1", bossBFrame1);
        this.load.image("boss-B-frame-2", bossBFrame2);
        this.load.image("boss-B-frame-3", bossBFrame3);

        // Carregar sprites do boss tipo C
        this.load.image("boss-C-frame-1", bossCFrame1);
        this.load.image("boss-C-frame-2", bossCFrame2);
        this.load.image("boss-C-frame-3", bossCFrame3);

        // Carregar sprite do tiro do boss
        this.load.image("boss-fire", bossFire);

        // Carregar áudios
        this.load.audio("player-shoot", playerShoot);
        this.load.audio("player-kill", playerKill);
        this.load.audio("enemy-shoot", enemyShoot);
        this.load.audio("enemy-kill", enemyKill);
        this.load.audio("boss-kill", bossKill);
        this.load.audio("boost", boost);
        this.load.audio("engine", engine);
        this.load.audio("powerup", powerup);

        // Carregar músicas de fundo
        this.load.audio("ost-wave-1", ostWave1);
        this.load.audio("ost-wave-2", ostWave2);
        this.load.audio("ost-wave-3", ostWave3);
      }

      create() {
        // Sinalizar que o preload foi concluído
        window.dispatchEvent(new CustomEvent("phaserPreloadComplete"));

        // Instanciar o sistema de posições
        const canvasWidth = this.cameras.main.width;
        const canvasHeight = this.cameras.main.height;
        this.positionManager = new PositionManager(canvasWidth, canvasHeight);

        // Instanciar o sistema de pontuação
        this.scoreSystem = new ScoreSystem((score, hiScore) => {
          setScore(score);
          setHiScore(hiScore);
        });
        
        // Configurar callback para vida extra
        this.scoreSystem.setOnExtraLifeCallback(() => {
          this.playerLives++;
          setLives(this.playerLives);
          
          // Tocar som de powerup
          audioManager.playSoundEffect('powerup');
          

        });
        
        // Armazenar referência no ref para acesso externo
        scoreSystemRef.current = this.scoreSystem;

        // Criar o player no centro do fundo da tela
        const playerAreaWidth = this.cameras.main.width;
        const playerAreaHeight = this.cameras.main.height;
        const playerX = playerAreaWidth / 2;
        const playerY = playerAreaHeight - 50; // 50px da borda inferior
        


        
        this.player = this.add.sprite(playerX, playerY, "player-frame-1");
        this.player.setScale(0.8); // Ajustar tamanho se necessário
        
        // Atualizar posição original do jogador
        this.originalPlayerPosition = { x: playerX, y: playerY };

        // Criar grupo de projéteis do jogador
        this.playerBullets = this.add.group({
          classType: Phaser.GameObjects.Sprite,
          maxSize: 50,
          runChildUpdate: true,
        });

        // Criar grupo de projéteis dos inimigos
        this.enemyBullets = this.add.group({
          classType: Phaser.GameObjects.Sprite,
          maxSize: 200, // Aumentado para acomodar mais projéteis simultâneos
          runChildUpdate: true,
        });

        // Configurar controles
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        this.wasd =
          (this.input.keyboard?.addKeys("W,S,A,D") as {
            [key: string]: Phaser.Input.Keyboard.Key;
          }) || null;

        // Configurar teclas de disparo
        this.fireKeys =
          (this.input.keyboard?.addKeys("SPACE,F,NUMPAD_FIVE") as {
            [key: string]: Phaser.Input.Keyboard.Key;
          }) || null;

        // Definir os limites do player dentro do canvas
        if (this.player) {
          const boundsWidth = this.cameras.main.width;
          const boundsHeight = this.cameras.main.height;
          
          this.player.setData("minX", this.player.width * 0.4);
          this.player.setData("maxX", boundsWidth - this.player.width * 0.4);
          this.player.setData("minY", this.player.height * 0.4);
          this.player.setData("maxY", boundsHeight - this.player.height * 0.4);
        }

        // Não iniciar o jogo imediatamente - aguardar sequência de mensagens
        // setGameState('playing') será chamado após as mensagens

        // Inicializar sistema de ondas (mas não iniciar ainda)
        this.currentWave = 1;
        this.calculateMaxEnemiesForWave(this.currentWave);

        // Aguardar evento para iniciar o jogo
        this.scene.pause();
      }

      update() {
        if (!this.player || !this.cursors) return;

        // Parar todas as atualizações se o game over estiver ativo
        if (this.isGameOver) return;

        let velocityX = 0;
        let velocityY = 0;

        // Verificar input de movimento apenas se controles estão habilitados
        if (this.playerControlsEnabled) {
          // Movimento horizontal - teclado ou controles móveis
          if (this.cursors.left.isDown || this.wasd?.A?.isDown || this.mobileControls.left) {
            velocityX = -1;
          } else if (this.cursors.right.isDown || this.wasd?.D?.isDown || this.mobileControls.right) {
            velocityX = 1;
          }

          // Movimento vertical - teclado ou controles móveis
          if (this.cursors.up.isDown || this.wasd?.W?.isDown || this.mobileControls.up) {
            velocityY = -1;
          } else if (this.cursors.down.isDown || this.wasd?.S?.isDown || this.mobileControls.down) {
            velocityY = 1;
          }

          // Verificar input de disparo - teclado ou controles móveis
          const currentTime = this.time.now;
          if (
            this.fireKeys &&
            (this.fireKeys.SPACE?.isDown ||
              this.fireKeys.F?.isDown ||
              this.fireKeys.NUMPAD_FIVE?.isDown ||
              this.mobileControls.fire)
          ) {
            if (currentTime - this.lastFireTime > this.fireRate) {
              this.fireBullet();
              this.lastFireTime = currentTime;
            }
          }
        }

        // Normalizar o vetor de movimento para manter velocidade constante
        const magnitude = Math.sqrt(
          velocityX * velocityX + velocityY * velocityY
        );
        if (magnitude > 0) {
          velocityX = (velocityX / magnitude) * this.playerSpeed;
          velocityY = (velocityY / magnitude) * this.playerSpeed;
        }

        // Atualizar posição do player
        const deltaTime = this.game.loop.delta / 1000;
        const newX = this.player.x + velocityX * deltaTime;
        const newY = this.player.y + velocityY * deltaTime;

        // Aplicar limites
        const minX = this.player.getData("minX");
        const maxX = this.player.getData("maxX");
        const minY = this.player.getData("minY");
        const maxY = this.player.getData("maxY");

        this.player.x = Phaser.Math.Clamp(newX, minX, maxX);
        this.player.y = Phaser.Math.Clamp(newY, minY, maxY);

        // Atualizar frame do player baseado no movimento (apenas se controles estão habilitados)
        if (this.playerControlsEnabled) {
          this.updatePlayerFrame(velocityX);
        }

        // Atualizar projéteis
        this.updateBullets();

        // Limpeza periódica de projéteis (a cada 2 segundos)
        const currentTime = this.time.now;
        if (currentTime - this.lastCleanupTime > this.cleanupInterval) {
          this.forceCleanupBullets();
          this.lastCleanupTime = currentTime;
        }

        // Atualizar inimigos
        this.updateEnemies();

        // Atualizar sistema de invencibilidade
        this.updateInvulnerability();

        // Verificar colisões
        this.checkCollisions();
      }

      updatePlayerFrame(velocityX: number) {
        if (!this.player) return;

        // Se não há movimento horizontal, usar frame 1 (nave em repouso)
        if (velocityX === 0) {
          this.player.setTexture("player-frame-1");
          this.player.setFlipX(false);
          this.lastMoveDirection.x = 0;
          return;
        }

        // Movimento para a esquerda (padrão)
        if (velocityX < 0) {
          if (this.lastMoveDirection.x !== -1) {
            // Transição para esquerda - frame 2
            this.player.setTexture("player-frame-2");
            this.player.setFlipX(false);
            this.lastMoveDirection.x = -1;

            // Depois de um tempo, mudar para frame 3
            this.time.delayedCall(100, () => {
              if (this.player && velocityX < 0) {
                this.player.setTexture("player-frame-3");
                this.player.setFlipX(false);
              }
            });
          }
        }

        // Movimento para a direita (espelhado)
        else if (velocityX > 0) {
          if (this.lastMoveDirection.x !== 1) {
            // Transição para direita - frame 2 espelhado
            this.player.setTexture("player-frame-2");
            this.player.setFlipX(true);
            this.lastMoveDirection.x = 1;

            // Depois de um tempo, mudar para frame 3 espelhado
            this.time.delayedCall(100, () => {
              if (this.player && velocityX > 0) {
                this.player.setTexture("player-frame-3");
                this.player.setFlipX(true);
              }
            });
          }
        }
      }

      fireBullet() {
        if (!this.player || !this.playerBullets) return;

        // Reproduzir som do tiro do jogador
        audioManager.playSoundEffect('player-fire');

        // Criar projétil na posição do jogador
        const bullet = this.playerBullets.get(
          this.player.x,
          this.player.y - 30,
          "player-fire"
        );

        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(1); // Ajustar tamanho do projétil

          // Configurar dados do projétil
          bullet.setData("speed", -this.bulletSpeed); // Negativo para ir para cima
          bullet.setData("damage", 1); // Dano que o projétil causa
        }
      }

      updateBullets() {
        if (!this.playerBullets || !this.enemyBullets) return;

        // Atualizar projéteis do jogador
        this.playerBullets.children.entries.forEach((bullet) => {
          const sprite = bullet as Phaser.GameObjects.Sprite;
          if (sprite.active) {
            // Mover projétil para cima
            const deltaTime = this.game.loop.delta / 1000;
            sprite.y += sprite.getData("speed") * deltaTime;

            // Remover projétil se sair da tela (expandir área para garantir limpeza)
            if (sprite.y < -50) {
              sprite.setActive(false);
              sprite.setVisible(false);
            }
          }
        });

        // Atualizar projéteis dos inimigos
        this.enemyBullets.children.entries.forEach((bullet) => {
          const sprite = bullet as Phaser.GameObjects.Sprite;
          if (sprite.active) {
            const deltaTime = this.game.loop.delta / 1000;

            // Verificar se é projétil do boss
            if (sprite.getData("isBossBullet")) {
              // Verificar se é projétil angular do boss (Boss Type B) ou direcionado (Boss Type C)
              if (sprite.getData("isAngled") || sprite.getData("isDirected")) {
                // Movimento baseado em velocidade X e Y para projéteis angulares/direcionados do boss
                sprite.x += sprite.getData("velocityX") * deltaTime;
                sprite.y += sprite.getData("velocityY") * deltaTime;
              } else {
                // Boss Type A: sempre move em linha reta para baixo
                sprite.y += sprite.getData("speed") * deltaTime;
                // Não alterar X - manter trajetória vertical
              }
            }
            // Verificar se é projétil angular (inimigo tipo B) ou direcionado (inimigo tipo C)
            else if (
              sprite.getData("isAngled") ||
              sprite.getData("isDirected")
            ) {
              // Movimento baseado em velocidade X e Y
              sprite.x += sprite.getData("velocityX") * deltaTime;
              sprite.y += sprite.getData("velocityY") * deltaTime;
            } else {
              // Movimento padrão para baixo (inimigo tipo A)
              sprite.y += sprite.getData("speed") * deltaTime;
            }

            // Remover projétil se sair da tela (área expandida para garantir limpeza completa)
            const gameWidth = this.cameras.main.width;
            const gameHeight = this.cameras.main.height;
            
            if (
              sprite.y > gameHeight + 50 ||
              sprite.y < -50 ||
              sprite.x < -50 ||
              sprite.x > gameWidth + 50
            ) {
              sprite.setActive(false);
              sprite.setVisible(false);
            }
          }
        });
      }

      forceCleanupBullets() {
        if (!this.playerBullets || !this.enemyBullets) return;

        // Limpeza agressiva de projéteis do jogador
        this.playerBullets.children.entries.forEach((bullet) => {
          const sprite = bullet as Phaser.GameObjects.Sprite;
          if (
            sprite.active &&
            (sprite.y < -100 || sprite.x < -100 || sprite.x > 900)
          ) {
            sprite.setActive(false);
            sprite.setVisible(false);
          }
        });

        // Limpeza agressiva de projéteis dos inimigos
        this.enemyBullets.children.entries.forEach((bullet) => {
          const sprite = bullet as Phaser.GameObjects.Sprite;
          const cleanupWidth = this.cameras.main.width;
          const cleanupHeight = this.cameras.main.height;
          
          if (
            sprite.active &&
            (sprite.y > cleanupHeight + 100 ||
              sprite.y < -100 ||
              sprite.x < -100 ||
              sprite.x > cleanupWidth + 100)
          ) {
            sprite.setActive(false);
            sprite.setVisible(false);
          }
        });

      }

      updateEnemies() {
        // Atualizar todos os inimigos e remover os destruídos
        const previousEnemyCount = this.enemies.length;
        let enemiesKilledByPlayer = 0;

        this.enemies = this.enemies.filter((enemy) => {
          if (!enemy.isDestroyed) {
            enemy.update();
            return true;
          } else {
            // Garantir que a posição seja liberada quando o inimigo for removido
            this.releasePosition(enemy.id);

            // Contar apenas inimigos mortos pelo jogador
            if (enemy.isKilledByPlayer) {
              enemiesKilledByPlayer++;
            }

            return false;
          }
        });

        // Atualizar boss se existir
        if (this.currentBoss) {
          if (!this.currentBoss.isDestroyed) {
            this.currentBoss.update();
          } else {
            this.currentBoss = null;
          }
        }

        // Atualizar contador de inimigos derrotados apenas com os que foram mortos pelo jogador
        if (enemiesKilledByPlayer > 0) {
          this.enemiesDefeated += enemiesKilledByPlayer;
          this.lastEnemyKilledTime = this.time.now;
        }

        // Log de inimigos que saíram da tela
        const enemiesThatLeft =
          previousEnemyCount - this.enemies.length - enemiesKilledByPlayer;
        if (enemiesThatLeft > 0) {

        }

        // Verificar se deve spawnar boss (apenas se não estivermos em transição de onda)
        if (
          this.enemiesDefeated >= this.maxEnemiesInWave &&
          !this.currentBoss &&
          !this.shouldSpawnBoss &&
          !this.isInWaveTransition
        ) {

          this.shouldSpawnBoss = true;
          this.bossSpawnTimer = this.time.now;
        }

        // Spawnar boss após delay (apenas se não estivermos em transição de onda)
        if (
          this.shouldSpawnBoss &&
          this.time.now - this.bossSpawnTimer > this.bossSpawnDelay &&
          !this.isInWaveTransition
        ) {
          this.spawnBoss();
          this.shouldSpawnBoss = false;
        }

        // Sistema de sub-ondas (apenas se boss não foi spawnado ainda e spawn está habilitado)
        if (
          !this.shouldSpawnBoss &&
          !this.currentBoss &&
          this.enemySpawnEnabled
        ) {
          if (
            this.enemies.length === 0 &&
            this.enemiesDefeated < this.maxEnemiesInWave
          ) {
            // Verificar se passou tempo suficiente desde o último inimigo morto
            if (this.time.now - this.lastEnemyKilledTime > this.subWaveDelay) {
              this.currentSubWave++;
              this.spawnSubWave(this.currentSubWave);
            }
          }
        }
      }

      spawnSubWave(subWave: number) {



        // Primeiras 5 sub-ondas da onda 1 são fixas
        if (this.currentWave === 1 && subWave <= 5) {
          switch (subWave) {
            // =============================================
            // TUTORIAL SILENCIOSO
            // =============================================

            // Onda 1: 1 inimigo tipo A
            case 1:
              this.spawnMultipleEnemiesTypeA(1);
              break;
            // Onda 2: 1 inimigo tipo B
            case 2:
              this.spawnMultipleEnemiesTypeB(1);
              break;
            // Onda 3: 1 inimigo tipo C
            case 3:
              this.spawnMultipleEnemiesTypeC(1);
              break;
            case 4:
              // 1 inimigo tipo A + 1 inimigos tipo B
              this.spawnMultipleEnemiesTypeA(1);
              this.spawnMultipleEnemiesTypeB(1);
              break;
            case 5:
              // 1 inimigo tipo A + 3 inimigos tipo B + 1 inimigo tipo C
              this.spawnMultipleEnemiesTypeA(1);
              this.spawnMultipleEnemiesTypeB(3);
              this.spawnMultipleEnemiesTypeC(1);
              break;
          }
        } else {
          // A partir da 6ª sub-onda da onda 1 ou qualquer sub-onda das ondas seguintes
          this.spawnRandomEnemies();
        }
      }

      calculateMaxEnemiesForWave(wave: number) {
        if (wave === 1) {
          // Onda 1: Sub-onda 1 (5A) + Sub-onda 2 (3B) + Sub-onda 3 (1C) + Sub-onda 4 (3A+2B) + Sub-onda 5 (1A+3B+1C) = 19 inimigos
          this.maxEnemiesInWave = 15;
        } else if (wave <= 3) {
          this.maxEnemiesInWave = 15 + 5 * (wave - 1);
        } else {
          // A partir da onda 4, incremento aleatório entre 5 e 10
          const previousMax = wave === 4 ? 25 : this.maxEnemiesInWave;
          const increment = Phaser.Math.Between(5, 10);
          this.maxEnemiesInWave = previousMax + increment;
          if (this.maxEnemiesInWave > 42) {
            this.maxEnemiesInWave = 42; // Limite máximo de inimigos por onda
          }
        }

      }

      spawnMultipleEnemiesTypeA(count: number) {
        for (let i = 0; i < count; i++) {
          this.spawnEnemyA();
        }
      }

      spawnMultipleEnemiesTypeB(count: number) {
        for (let i = 0; i < count; i++) {
          this.spawnEnemyB();
        }
      }

      spawnMultipleEnemiesTypeC(count: number) {
        for (let i = 0; i < count; i++) {
          this.spawnEnemyC();
        }
      }

      spawnRandomEnemies() {
        // Calcular quantos inimigos spawnar baseado na onda
        let enemiesToSpawn = 5 + Math.floor((this.currentWave - 1) / 2);
        enemiesToSpawn = Math.min(enemiesToSpawn, 15); // Máximo de 15 inimigos por spawn



        for (let i = 0; i < enemiesToSpawn; i++) {
          const enemyType = Phaser.Math.Between(1, 3);

          switch (enemyType) {
            case 1:
              this.spawnEnemyA();
              break;
            case 2:
              this.spawnEnemyB();
              break;
            case 3:
              this.spawnEnemyC();
              break;
          }
        }
      }

      spawnEnemyA() {
        // Spawnar inimigo do tipo A no topo da tela, posição aleatória
        const screenWidth = this.cameras.main.width;
        const x = Phaser.Math.Between(screenWidth * 0.125, screenWidth * 0.875); // Entre 12.5% e 87.5% da largura
        const y = -100; // Fora da tela, no topo (aumentei para -100 para garantir que fique fora)

        const enemy = new EnemyTypeA(this, x, y);
        enemy.adjustForWave(this.currentWave);
        
        // Configurar callback para pontuação quando morto pelo jogador
        enemy.setOnKilledByPlayerCallback((entity) => {
          if (this.scoreSystem) {
            this.scoreSystem.addScoreForEnemyKilled(entity);
          }
        });
        
        this.enemies.push(enemy);


      }

      spawnEnemyB() {
        // Spawnar inimigo do tipo B no topo da tela, posição aleatória
        const screenWidth = this.cameras.main.width;
        const x = Phaser.Math.Between(screenWidth * 0.25, screenWidth * 0.75); // Posição mais centralizada para a curva (25%-75%)
        const y = -100; // Fora da tela, no topo (aumentei para -100)

        const enemy = new EnemyTypeB(this, x, y);
        enemy.adjustForWave(this.currentWave);
        
        // Configurar callback para pontuação quando morto pelo jogador
        enemy.setOnKilledByPlayerCallback((entity) => {
          if (this.scoreSystem) {
            this.scoreSystem.addScoreForEnemyKilled(entity);
          }
        });
        
        this.enemies.push(enemy);


      }

      spawnEnemyC() {
        // Spawnar inimigo do tipo C no topo da tela, posição aleatória
        const screenWidth = this.cameras.main.width;
        const x = Phaser.Math.Between(screenWidth * 0.31, screenWidth * 0.69); // Posição centralizada (31%-69%)
        const y = -100; // Fora da tela, no topo (aumentei para -100)

        const enemy = new EnemyTypeC(this, x, y);
        enemy.adjustForWave(this.currentWave);
        
        // Configurar callback para pontuação quando morto pelo jogador
        enemy.setOnKilledByPlayerCallback((entity) => {
          if (this.scoreSystem) {
            this.scoreSystem.addScoreForEnemyKilled(entity);
          }
        });
        
        this.enemies.push(enemy);


      }

      spawnBoss() {


        // Spawnar boss no centro superior da tela
        const bossX = this.cameras.main.width / 2; // Centro da tela dinamicamente
        const bossY = -100; // Fora da tela, no topo

        if (this.currentWave === 1) {
          // Boss tipo A fixo para onda 1
          this.currentBoss = new BossTypeA(this, bossX, bossY);
          this.currentBoss.adjustForWave(this.currentWave);
          // Configurar callback para pontuação quando morto pelo jogador
          this.currentBoss.setOnKilledByPlayerCallback((entity) => {
            if (this.scoreSystem) {
              this.scoreSystem.addScoreForEnemyKilled(entity);
            }
          });

        } else if (this.currentWave === 2) {
          // Boss tipo B fixo para onda 2
          this.currentBoss = new BossTypeB(this, bossX, bossY);
          this.currentBoss.adjustForWave(this.currentWave);
          // Configurar callback para pontuação quando morto pelo jogador
          this.currentBoss.setOnKilledByPlayerCallback((entity) => {
            if (this.scoreSystem) {
              this.scoreSystem.addScoreForEnemyKilled(entity);
            }
          });

        } else if (this.currentWave === 3) {
          // Boss tipo C fixo para onda 3
          this.currentBoss = new BossTypeC(this, bossX, bossY);
          this.currentBoss.adjustForWave(this.currentWave);
          // Configurar callback para pontuação quando morto pelo jogador
          this.currentBoss.setOnKilledByPlayerCallback((entity) => {
            if (this.scoreSystem) {
              this.scoreSystem.addScoreForEnemyKilled(entity);
            }
          });

        } else {
          // Da onda 4 em diante: spawnar boss aleatório
          const randomBossType = Phaser.Math.Between(1, 3);

          if (randomBossType === 1) {
            this.currentBoss = new BossTypeA(this, bossX, bossY);
            this.currentBoss.adjustForWave(this.currentWave);
            // Configurar callback para pontuação quando morto pelo jogador
            this.currentBoss.setOnKilledByPlayerCallback((entity) => {
              if (this.scoreSystem) {
                this.scoreSystem.addScoreForEnemyKilled(entity);
              }
            });

          } else if (randomBossType === 2) {
            this.currentBoss = new BossTypeB(this, bossX, bossY);
            this.currentBoss.adjustForWave(this.currentWave);
            // Configurar callback para pontuação quando morto pelo jogador
            this.currentBoss.setOnKilledByPlayerCallback((entity) => {
              if (this.scoreSystem) {
                this.scoreSystem.addScoreForEnemyKilled(entity);
              }
            });

          } else {
            this.currentBoss = new BossTypeC(this, bossX, bossY);
            this.currentBoss.adjustForWave(this.currentWave);
            // Configurar callback para pontuação quando morto pelo jogador
            this.currentBoss.setOnKilledByPlayerCallback((entity) => {
              if (this.scoreSystem) {
                this.scoreSystem.addScoreForEnemyKilled(entity);
              }
            });

          }
        }
      }

      checkCollisions() {
        if (!this.playerBullets || !this.enemyBullets || !this.player) return;

        // Colisão projéteis do jogador vs inimigos
        this.playerBullets.children.entries.forEach((bullet) => {
          const bulletSprite = bullet as Phaser.GameObjects.Sprite;
          if (!bulletSprite.active) return;

          // Verificar colisão com inimigos normais
          this.enemies.forEach((enemy) => {
            if (enemy.isDestroyed) return;

            // Verificar colisão simples usando distância
            const distance = Phaser.Math.Distance.Between(
              bulletSprite.x,
              bulletSprite.y,
              enemy.sprite.x,
              enemy.sprite.y
            );

            if (distance < 30) {
              // Raio de colisão
              // Projétil atingiu inimigo
              bulletSprite.setActive(false);
              bulletSprite.setVisible(false);

              // Marcar que foi morto pelo jogador antes de aplicar dano
              enemy.markAsKilledByPlayer();

              // Inimigo recebe dano
              enemy.takeDamage(bulletSprite.getData("damage") || 1);
            }
          });

          // Verificar colisão com boss
          if (this.currentBoss && !this.currentBoss.isDestroyed) {
            const distance = Phaser.Math.Distance.Between(
              bulletSprite.x,
              bulletSprite.y,
              this.currentBoss.x,
              this.currentBoss.y
            );

            if (distance < 50) {
              // Raio de colisão maior para o boss
              // Projétil atingiu boss
              bulletSprite.setActive(false);
              bulletSprite.setVisible(false);

              // Marcar que foi morto pelo jogador antes de aplicar dano
              this.currentBoss.markAsKilledByPlayer();

              // Boss recebe dano
              this.currentBoss.takeDamage(bulletSprite.getData("damage") || 1);
            }
          }
        });

        // Colisão projéteis dos inimigos vs jogador
        if (!this.isPlayerDead && !this.isPlayerInvulnerable && !this.isPermanentlyInvulnerable) {
          this.enemyBullets.children.entries.forEach((bullet) => {
            const bulletSprite = bullet as Phaser.GameObjects.Sprite;
            if (!bulletSprite.active) return;

            // Verificar colisão com jogador
            const distance = Phaser.Math.Distance.Between(
              bulletSprite.x,
              bulletSprite.y,
              this.player!.x,
              this.player!.y
            );

            // Raio de colisão maior para projéteis do boss
            const collisionRadius = bulletSprite.getData("isBossBullet")
              ? 30
              : 25;

            if (distance < collisionRadius) {
              // Projétil atingiu jogador
              bulletSprite.setActive(false);
              bulletSprite.setVisible(false);

              this.playerTakeDamage();
            }
          });

          // Colisão jogador vs inimigos (colisão direta com naves)
          this.enemies.forEach((enemy) => {
            if (enemy.isDestroyed) return;

            // Verificar colisão direta com inimigo
            const distance = Phaser.Math.Distance.Between(
              this.player!.x,
              this.player!.y,
              enemy.sprite.x,
              enemy.sprite.y
            );

            if (distance < 35) {
              // Raio de colisão para nave vs nave

              this.playerTakeDamage();
              // Destruir o inimigo também na colisão
              enemy.destroy();
            }
          });

          // Colisão jogador vs boss
          if (this.currentBoss && !this.currentBoss.isDestroyed) {
            const distance = Phaser.Math.Distance.Between(
              this.player!.x,
              this.player!.y,
              this.currentBoss.x,
              this.currentBoss.y
            );

            if (distance < 60) {
              // Raio de colisão maior para o boss

              this.playerTakeDamage();
            }
          }
        }
      }

      // Sistema de vidas do jogador
      playerTakeDamage() {
        if (this.isPlayerDead || this.isPlayerInvulnerable || this.isPermanentlyInvulnerable) return;


        this.playerDie();
      }

      playerDie() {
        if (this.isPlayerDead) return;

        // Reproduzir som da morte do jogador
        audioManager.playSoundEffect('player-kill');

        this.isPlayerDead = true;
        this.playerControlsEnabled = false;
        this.playerLives--;



        // Atualizar vidas na UI
        setLives(this.playerLives);

        if (this.playerLives <= 0) {
          // Game Over


          // Fazer transição imediata da música para evitar sobreposição
          this.audioManager.transitionToMenuMusic();

          setGameState("gameOver");

          // Criar animação de morte na posição atual do jogador (última vida)
          if (this.player) {
            this.player.setVisible(false);
            new DeathAnimation(this, this.player.x, this.player.y, () => {});
          }

          // Criar esmaecimento para preto
          this.createGameOverFade();



          return;
        }

        // Criar animação de morte na posição atual do jogador
        if (this.player) {
          this.player.setVisible(false);
          new DeathAnimation(this, this.player.x, this.player.y, () => {});
        }

        // Agendar respawn após 2 segundos
        this.time.delayedCall(this.respawnDelay, () => {
          this.respawnPlayer();
        });
      }

      respawnPlayer() {
        if (!this.isPlayerDead) return;



        // Posicionar jogador fora da tela (parte inferior)
        if (this.player) {
          this.player.x = this.originalPlayerPosition.x;
          this.player.y = this.cameras.main.height + 100; // Fora da tela, embaixo
          this.player.setVisible(true);
          this.player.setTexture("player-frame-1");
          this.player.setFlipX(false);
        }

        // Animar entrada do jogador
        this.tweens.add({
          targets: this.player,
          y: this.originalPlayerPosition.y,
          duration: 1500, // 1.5 segundos para entrar
          ease: "Power2",
          onComplete: () => {
            // Após chegar na posição, reabilitar controles
            this.isPlayerDead = false;
            this.playerControlsEnabled = true;

            // Ativar invencibilidade por 15 segundos
            this.startInvulnerability();


          },
        });
      }

      startInvulnerability() {
        this.isPlayerInvulnerable = true;
        this.invulnerabilityStartTime = this.time.now;



        // Efeito visual de piscar durante invencibilidade
        this.tweens.add({
          targets: this.player,
          alpha: 0.5,
          duration: 200,
          yoyo: true,
          repeat: -1, // Repetir indefinidamente
          onComplete: () => {
            // Garantir que o player volte a ser totalmente visível
            if (this.player) {
              this.player.setAlpha(1);
            }
          },
        });
      }

      updateInvulnerability() {
        if (!this.isPlayerInvulnerable) return;

        // Verificar se o tempo de invencibilidade acabou
        if (
          this.time.now - this.invulnerabilityStartTime >
          this.invulnerabilityDuration
        ) {
          this.isPlayerInvulnerable = false;

          // Parar efeito de piscar
          if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.setAlpha(1);
          }


        }
      }

      addScore(points: number) {
        // Usar o ScoreSystem para adicionar pontos
        if (this.scoreSystem) {
          this.scoreSystem.addScore(points);
        }

        // Atualizar onda no estado do React (comentado temporariamente para debug)
        setWave(this.currentWave);

        // Registrar que um inimigo foi morto (para o sistema de sub-ondas)
        this.lastEnemyKilledTime = this.time.now;
      }

      // Método chamado quando um boss é derrotado
      onBossDefeated(points: number) {


        // Adicionar pontos do boss usando o ScoreSystem
        if (this.scoreSystem) {
          this.scoreSystem.addScoreForBossDefeated(points);
        }

        // Parar o spawn de novos inimigos
        this.enemySpawnEnabled = false;

        // Iniciar animação de transição de onda
        this.startWaveTransition();
      }

      // Método para iniciar a transição de onda
      startWaveTransition() {
        if (this.isInWaveTransition) return;

        this.isInWaveTransition = true;
        this.playerControlsEnabled = false;

        // Ativar invulnerabilidade durante a transição
        this.isPlayerInvulnerable = true;
        this.invulnerabilityStartTime = this.time.now;



        // Reproduzir áudio de boost no início da transição
        audioManager.playSoundEffect('engine');

        // Reproduzir áudio de engine após 1 segundo
        this.time.delayedCall(1000, () => {
          audioManager.playSoundEffect('boost');
        });

        // Aumentar velocidade do background para 50 (via callback para o React)
        // Vamos usar um evento customizado para comunicar com o componente React
        window.dispatchEvent(
          new CustomEvent("changeBackgroundSpeed", { detail: { speed: 50 } })
        );

        // Mover nave para o centro gradualmente
        this.movePlayerToCenter();
      }

      // Método para mover o jogador para o centro gradualmente
      movePlayerToCenter() {
        if (!this.player) return;

        const targetX = this.cameras.main.width / 2; // Centro da tela dinamicamente
        const targetY = this.cameras.main.height - 50; // Posição inferior baseada na altura da tela

        // Criar tween para movimento suave
        this.tweens.add({
          targets: this.player,
          x: targetX,
          y: targetY,
          duration: 2000, // 2 segundos para mover
          ease: "Power2",
          onComplete: () => {
            // Após mover o jogador, continuar com a transição
            this.continueWaveTransition();
          },
        });
      }

      // Continuar com a transição após mover o jogador
      continueWaveTransition() {
        // Voltar velocidade do background para 0.75
        window.dispatchEvent(
          new CustomEvent("changeBackgroundSpeed", { detail: { speed: 0.75 } })
        );

        // Incrementar número da onda
        this.currentWave++;
        
        // Trocar música a cada 5 ondas
        if (this.currentWave % 5 === 0) {
          this.audioManager.stopBackgroundMusic();
          // Aguardar um momento para garantir que a música parou antes de iniciar a nova
          this.time.delayedCall(200, () => {
            this.audioManager.playWaveMusic(this.currentWave);
          });
        }
        
        setWave(this.currentWave);

        // Mostrar mensagem da nova onda
        window.dispatchEvent(
          new CustomEvent("showWaveMessage", {
            detail: { message: `ONDA ${this.currentWave}` },
          })
        );

        // Aguardar 3 segundos para mostrar a mensagem da nova onda e finalizar
        this.time.delayedCall(3000, () => {
          this.finishWaveTransition();
        });
      }

      // Finalizar a transição de onda
      finishWaveTransition() {
        // Habilitar novamente os controles e spawn de inimigos
        this.playerControlsEnabled = true;
        this.enemySpawnEnabled = true;
        this.isInWaveTransition = false;

        // Remover invulnerabilidade após 2 segundos do início da transição
        this.time.delayedCall(2000 - (this.time.now - this.invulnerabilityStartTime), () => {
          this.isPlayerInvulnerable = false;
          if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.setAlpha(1);
          }
        });



        // Preparar nova onda - resetar dados DEPOIS de confirmar a onda
        this.resetWaveData();




        // Começar nova onda - definir sub-onda 1 e spawnar
        this.currentSubWave = 1;

        this.spawnSubWave(this.currentSubWave);
      }

      // Resetar dados da onda
      resetWaveData() {
        this.enemiesDefeated = 0;
        this.shouldSpawnBoss = false;
        this.bossSpawnTimer = 0;
        this.lastEnemyKilledTime = this.time.now;

        // Calcular novo máximo de inimigos para a onda
        this.calculateMaxEnemiesForWave(this.currentWave);

        // Limpar posições ocupadas
        this.positionManager.clearAllPositions();
      }

      // Método para recalcular posições do jogador baseado nas dimensões reais
      recalculatePlayerPosition() {
        if (!this.player) return;
        
        const actualWidth = this.cameras.main.width;
        const actualHeight = this.cameras.main.height;
        
        const playerX = actualWidth / 2;
        const playerY = actualHeight - 50; // 50px da borda inferior
        
        this.player.x = playerX;
        this.player.y = playerY;
        
        // Atualizar posição original
        this.originalPlayerPosition = { x: playerX, y: playerY };
        
        // Recalcular limites do jogador
        this.player.setData("minX", this.player.width * 0.4);
        this.player.setData("maxX", actualWidth - this.player.width * 0.4);
        this.player.setData("minY", this.player.height * 0.4);
        this.player.setData("maxY", actualHeight - this.player.height * 0.4);
        

      }

      // Método para iniciar o jogo após a sequência de mensagens
      startGame() {

        
        // Recalcular posição do jogador com as dimensões reais
        this.recalculatePlayerPosition();
        
        // Atualizar dimensões do position manager
        const actualWidth = this.cameras.main.width;
        const actualHeight = this.cameras.main.height;
        this.positionManager.updateScreenDimensions(actualWidth, actualHeight);
        
        setGameState("playing");
        this.scene.resume();

        // Iniciar com sub-onda 1 (inimigo tipo A)
        this.spawnSubWave(1);
        
        // Iniciar música baseada na onda atual
        this.audioManager.playWaveMusic(this.currentWave);
      }

      // Métodos para controles móveis
      setMobileControl(direction: 'up' | 'down' | 'left' | 'right', active: boolean) {
        this.mobileControls[direction] = active;
      }

      setMobileAction(active: boolean) {
        this.mobileControls.fire = active;
      }
    }

    // Configuração do Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      backgroundColor: "rgba(0,0,0,0)",
      transparent: true,

      // ↓ ScaleManager assume o tamanho do contêiner
      scale: {
        parent: canvasRef.current!, // div ref
        mode: Phaser.Scale.RESIZE, // Usar RESIZE em todos os casos para adaptar melhor
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800, // referência interna
        height: 600,
      },

      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: GameScene,
    };

    // Criar o jogo Phaser
    gameRef.current = new Phaser.Game(config);

    // Aplicar estilo ao canvas criado pelo Phaser
    setTimeout(() => {
      const phaserCanvas = canvasRef.current?.querySelector('canvas');
      if (phaserCanvas) {
        phaserCanvas.style.position = "relative";
        phaserCanvas.style.zIndex = "10";
        phaserCanvas.style.background = "transparent";
        phaserCanvas.style.pointerEvents = "auto";
        phaserCanvas.style.width = "100%"; 
        phaserCanvas.style.height = "100%"; 
      }
    }, 100);

    // Cleanup ao desmontar o componente
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [setLives]); // Manter apenas dependências que não mudam durante o jogo

  const handleMobileControl = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Implementar controles móveis usando o sistema de "teclas virtuais"
    if (!gameRef.current) return;
    
    const scene = gameRef.current.scene.getScene('MainGameScene') as any;
    if (!scene || !scene.player || !scene.playerControlsEnabled) return;

    // Ativar a direção específica
    scene.setMobileControl(direction, true);
  };

  const handleMobileAction = () => {
    // Implementar disparo móvel usando o sistema de "teclas virtuais"
    if (!gameRef.current) return;
    
    const scene = gameRef.current.scene.getScene('MainGameScene') as any;
    if (!scene || !scene.player || !scene.playerControlsEnabled) return;

    // Ativar disparo
    scene.setMobileAction(true);
  };

  // Funções para parar controles móveis
  const stopMobileControl = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameRef.current) return;
    
    const scene = gameRef.current.scene.getScene('MainGameScene') as any;
    if (!scene) return;

    // Desativar a direção específica
    scene.setMobileControl(direction, false);
  };

  const stopMobileAction = () => {
    if (!gameRef.current) return;
    
    const scene = gameRef.current.scene.getScene('MainGameScene') as any;
    if (!scene) return;

    // Desativar disparo
    scene.setMobileAction(false);
  };

  const handleNavigateToMenu = () => {
    onNavigate?.('/menu');
  };

  const handleNavigateToRankingRegister = () => {
    onNavigate?.('/ranking-register', { score: hiScore });
  };



  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Tela de Loading */}
      {isLoading && (
        <div
          className="absolute z-50 bg-black flex items-center justify-center border border-gray-600 rounded-lg
             w-full h-full
             sm:w-[800px] sm:h-[600px]"
        >
          <div className="text-center flex flex-col items-center justify-center">
            <div className="text-white text-2xl mb-4">Carregando...</div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Canvas container com background */}

      <div
        ref={canvasRef}
        className="border border-gray-600 rounded-lg overflow-hidden relative bg-transparent
             w-full h-full
             sm:w-[800px] sm:h-[600px]"
      >
        {/* Background scrolling dentro do canvas */}
        <div className="absolute inset-0 z-0">
          <ScrollingBackground
            speed={currentBackgroundSpeed}
          />
        </div>
        {/* Game UI overlay - restrita ao canvas */}
        {showUI && !isLoading && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <GameUI
              lives={lives}
              score={hiScore}
              wave={wave}
              gameState={gameState}
              showWaveMessage={showWaveMessage}
              waveMessageText={waveMessageText}
              onMobileControl={handleMobileControl}
              onMobileControlStop={stopMobileControl}
              onMobileAction={handleMobileAction}
              onMobileActionStop={stopMobileAction}
              onNavigateToMenu={handleNavigateToMenu}
              onNavigateToRankingRegister={handleNavigateToRankingRegister}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;

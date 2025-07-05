import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameUI from "./GameUI";

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

// Importar sprite do tiro do boss
import bossFire from '../assets/images/effects/boss-fire.png';

interface GameCanvasProps {
  backgroundSpeed?: number;
}

interface BackgroundScrollProps {
  speed: number;
  width: number;
  height: number;
}

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  shouldTwinkle: boolean;
}

// Componente Star para o canvas
const CanvasStar = React.memo(({ star }: { star: StarData }) => {
  return (
    <div
      className={`absolute bg-white rounded-full ${star.shouldTwinkle ? 'animate-pulse' : ''}`}
      style={{
        left: `${star.x}px`,
        top: `${star.y}px`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        opacity: star.opacity,
        animationDuration: star.shouldTwinkle ? `${star.duration}s` : undefined,
        animationDelay: star.shouldTwinkle ? `${star.delay}s` : undefined,
      }}
    />
  );
});

CanvasStar.displayName = 'CanvasStar';

// Background personalizado para o canvas do jogo
const CanvasBackground: React.FC<{ width: number; height: number; starCount: number; seed?: number }> = ({ width, height, starCount, seed = 0 }) => {
  const stars = React.useMemo(() => {
    const starArray: StarData[] = [];
    const maxAnimatedStars = Math.min(starCount * 0.3, 50);
    
    // Usar seed para gerar estrelas consistentes
    const random = (index: number) => {
      const x = Math.sin(seed + index * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    
    for (let i = 0; i < starCount; i++) {
      const star: StarData = {
        id: i,
        x: random(i * 4) * width,
        y: random(i * 4 + 1) * height,
        size: random(i * 4 + 2) * 3 + 1,
        opacity: random(i * 4 + 3) * 0.8 + 0.4,
        duration: random(i * 4 + 4) * 4 + 2,
        delay: random(i * 4 + 5) * 5,
        shouldTwinkle: i < maxAnimatedStars,
      };
      
      starArray.push(star);
    }
    
    return starArray;
  }, [starCount, width, height, seed]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-(--cosmic-darkest)/80"
    >
      {stars.map((star) => (
        <CanvasStar key={star.id} star={star} />
      ))}
    </div>
  );
};

// Componente Background com scroll para o GameCanvas
const ScrollingBackground: React.FC<BackgroundScrollProps> = ({ speed, width, height }) => {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + speed);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [speed]);
  
  // Calcular posições das três instâncias para scroll infinito suave
  const firstY = offset % height;
  const secondY = firstY - height;
  const thirdY = firstY + height;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Três instâncias do background para scroll infinito suave */}
      <div 
        className="absolute"
        style={{ 
          width: `${width}px`,
          height: `${height}px`,
          transform: `translateY(${firstY}px)`,
          transition: 'none'
        }}
      >
        <CanvasBackground width={width} height={height} starCount={100} seed={1} />
      </div>
      <div 
        className="absolute"
        style={{ 
          width: `${width}px`,
          height: `${height}px`,
          transform: `translateY(${secondY}px)`,
          transition: 'none'
        }}
      >
        <CanvasBackground width={width} height={height} starCount={100} seed={1} />
      </div>
      <div 
        className="absolute"
        style={{ 
          width: `${width}px`,
          height: `${height}px`,
          transform: `translateY(${thirdY}px)`,
          transition: 'none'
        }}
      >
        <CanvasBackground width={width} height={height} starCount={100} seed={1} />
      </div>
    </div>
  );
};

const GameCanvas: React.FC<GameCanvasProps> = ({ backgroundSpeed = .75 }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'preparing' | 'playing' | 'paused' | 'gameOver'>('preparing');
  const [lives] = useState(3);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);

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
    // CLASSE BASE ENEMY
    // =============================================
    abstract class Enemy {
      scene: Phaser.Scene;
      sprite: Phaser.GameObjects.Sprite;
      
      // Identificação única
      id: string;
      
      // Propriedades base
      hp: number;
      maxHp: number;
      speed: number;
      maxSpeed: number;
      
      // Sistema de disparo
      shotsPerBurst: number;
      maxShotsPerBurst: number;
      totalShots: number;
      maxTotalShots: number;
      shotsFired: number = 0;
      
      // Sistema de movimento
      movementsBeforeLeaving: number;
      maxMovements: number;
      movementCount: number = 0;
      
      // Estado
      lastMoveDirection = { x: 0, y: 0 };
      isDestroyed = false;
      isKilledByPlayer = false; // Distinguir se foi morto pelo jogador ou saiu da tela
      
      // Sistema de pontuação
      points: number;
      
      constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, textureKey);
        
        // Gerar ID único para o inimigo
        this.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Valores padrão - serão sobrescritos pelas subclasses
        this.hp = 1;
        this.maxHp = 1;
        this.speed = 100;
        this.maxSpeed = 300;
        this.shotsPerBurst = 1;
        this.maxShotsPerBurst = 5;
        this.totalShots = 3;
        this.maxTotalShots = 10;
        this.movementsBeforeLeaving = 1;
        this.maxMovements = 5;
        this.points = 50; // Pontuação padrão
      }
      
      // Método para ajustar stats baseado na onda
      adjustForWave(wave: number) {
        // Aumentar shots per burst baseado na onda, até o máximo
        this.shotsPerBurst = Math.min(this.maxShotsPerBurst, this.shotsPerBurst + Math.floor(wave / 2));
        
        // Aumentar total shots baseado na onda, até o máximo
        this.totalShots = Math.min(this.maxTotalShots, this.totalShots + wave);
        
        // Aumentar movimentos baseado na onda, até o máximo
        this.movementsBeforeLeaving = Math.min(this.maxMovements, this.movementsBeforeLeaving + Math.floor(wave / 3));
        
        // Aumentar velocidade baseado na onda, até o máximo
        this.speed = Math.min(this.maxSpeed, this.speed + (wave * 10));
      }
      
      // Método abstrato para definir comportamento de movimento específico
      abstract move(): void;
      
      // Método abstrato para definir padrão de disparo específico
      abstract shoot(): void;
      
      // Método para receber dano
      takeDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
          this.destroy();
        }
      }
      
      // Método para destruir o inimigo
      destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.isKilledByPlayer = true; // Marcar como morto pelo jogador
        
        // Liberar posição ocupada
        const gameScene = this.scene as GameScene;
        gameScene.releasePosition(this.id);
        
        // Criar animação de destruição na posição atual
        new DeathAnimation(this.scene, this.sprite.x, this.sprite.y, () => {
          // Callback após animação - incrementar pontuação
          const gameScene = this.scene as GameScene;
          gameScene.addScore(this.points);
        });
        
        // Remover sprite do inimigo
        this.sprite.destroy();
      }
      
      // Método de atualização chamado a cada frame
      update() {
        if (this.isDestroyed) return;
        
        // Verificar se saiu da tela (sair pela parte inferior ou superior)
        if (this.sprite.y > 650 || this.sprite.y < -100) {
          // Liberar posição antes de destruir
          const gameScene = this.scene as GameScene;
          gameScene.releasePosition(this.id);
          
          this.sprite.destroy();
          this.isDestroyed = true;
          // Não marcar isKilledByPlayer como true - inimigo saiu da tela
          return;
        }
        
        // Lógica de comportamento específico será implementada nas subclasses
      }
    }

    // =============================================
    // ENEMY TYPE A
    // =============================================
    class EnemyTypeA extends Enemy {
      // Estados do inimigo
      private state: 'entering' | 'moving_to_position' | 'shooting' | 'moving_to_next' | 'leaving' = 'entering';
      
      // Sistema de disparo
      private fireTimer = 0;
      private fireRate = 2000; // 2 segundos entre rajadas
      private burstTimer = 0;
      private burstRate = 300; // 300ms entre tiros da mesma rajada
      private currentBurstShots = 0;
      private isInBurst = false;
      private burstCount = 0; // Quantas rajadas já foram disparadas
      private maxBursts = 2; // Máximo de rajadas por posição (3 tiros + pausa + 3 tiros)
      
      // Sistema de movimento
      private targetX = 0;
      private targetY = 0;
      private moveSpeed = 150;
      private hasReachedFirstPosition = false;
      private hasCompletedFirstShooting = false;
      
      constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-A-frame-1');
        
        // Stats específicos do Enemy Type A
        this.hp = 1;
        this.maxHp = 1;
        this.speed = 200;
        this.maxSpeed = 400;
        this.shotsPerBurst = 1; // 3 tiros por rajada
        this.maxShotsPerBurst = 5;
        this.totalShots = 6; // Total de 6 tiros (2 rajadas de 3)
        this.maxTotalShots = 12;
        this.movementsBeforeLeaving = 2; // 2 posições de tiro
        this.maxMovements = 3;
        this.points = 100; // Inimigo tipo A dá 100 pontos
        
        // Configurar sprite
        this.sprite.setScale(0.8);
        this.sprite.setData('enemyType', 'A');
        this.sprite.setData('hp', this.hp);
        
        // Definir primeira posição aleatória na metade superior da tela
        this.setRandomTargetInUpperHalf();
      }
      
      private setRandomTargetInUpperHalf() {
        // Posição aleatória inicial na metade superior da tela
        const preferredX = Phaser.Math.Between(200, 600);
        const preferredY = Phaser.Math.Between(100, 250);
        
        // Encontrar posição livre
        const gameScene = this.scene as GameScene;
        const freePosition = gameScene.findFreePosition(preferredX, preferredY, this.id);
        
        this.targetX = freePosition.x;
        this.targetY = freePosition.y;
      }
      
      private setRandomTargetForSecondPosition() {
        // Segunda posição também na metade superior, mas diferente da primeira
        const minDistance = 80;
        let preferredX, preferredY;
        
        do {
          preferredX = Phaser.Math.Between(200, 600);
          preferredY = Phaser.Math.Between(100, 250);
        } while (Phaser.Math.Distance.Between(this.targetX, this.targetY, preferredX, preferredY) < minDistance);
        
        // Encontrar posição livre
        const gameScene = this.scene as GameScene;
        const freePosition = gameScene.findFreePosition(preferredX, preferredY, this.id);
        
        this.targetX = freePosition.x;
        this.targetY = freePosition.y;
      }
      
      private setExitTarget() {
        // Definir ponto de saída (fora da tela, na parte inferior)
        this.targetX = this.sprite.x; // Manter X atual
        this.targetY = 700; // Sair pela parte inferior
      }
      
      move() {
        const deltaTime = this.scene.game.loop.delta / 1000;
        
        // Calcular direção para o alvo
        const directionX = this.targetX - this.sprite.x;
        const directionY = this.targetY - this.sprite.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Se chegou perto o suficiente do alvo
        if (distance < 10) {
          this.onReachedTarget();
          return;
        }
        
        // Normalizar direção e aplicar velocidade
        const normalizedX = directionX / distance;
        const normalizedY = directionY / distance;
        
        this.sprite.x += normalizedX * this.moveSpeed * deltaTime;
        this.sprite.y += normalizedY * this.moveSpeed * deltaTime;
        
        // Atualizar animação de movimento
        this.updateMovementAnimation(normalizedX);
      }
      
      private onReachedTarget() {
        switch (this.state) {
          case 'moving_to_position': {
            if (!this.hasReachedFirstPosition) {
              // Chegou na primeira posição - reservar posição
              this.hasReachedFirstPosition = true;
              this.state = 'shooting';
              this.resetShooting();
              
              const gameScene = this.scene as GameScene;
              gameScene.reservePosition(this.sprite.x, this.sprite.y, this.id);
            }
            break;
          }
            
          case 'moving_to_next': {
            // Chegou na segunda posição - reservar nova posição
            this.state = 'shooting';
            this.resetShooting();
            
            const gameScene = this.scene as GameScene;
            gameScene.reservePosition(this.sprite.x, this.sprite.y, this.id);
            break;
          }
            
          case 'leaving':
            // Saiu da tela
            this.isDestroyed = true;
            // Não marcar isKilledByPlayer como true - inimigo saiu da tela
            break;
        }
      }
      
      private resetShooting() {
        this.burstCount = 0;
        this.shotsFired = 0;
        this.fireTimer = this.scene.time.now;
        this.sprite.setTexture('enemy-A-frame-1'); // Frame de repouso
      }
      
      shoot() {
        // Obter referência ao grupo de projéteis inimigos da scene
        const gameScene = this.scene as GameScene;
        if (!gameScene.enemyBullets) return;
        
        // Criar projétil inimigo usando o grupo
        const bullet = gameScene.enemyBullets.get(this.sprite.x, this.sprite.y + 30, 'enemy-fire');
        
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(0.7);
          bullet.setData('speed', 300); // Velocidade do projétil para baixo
          bullet.setData('damage', 1);
          bullet.setData('isEnemyBullet', true);
        }
        
        this.shotsFired++;
      }
      
      private updateMovementAnimation(directionX: number) {
        // Atualizar frame baseado na direção do movimento
        if (Math.abs(directionX) > 0.1) {
          // Está se movendo horizontalmente
          const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
          this.sprite.setTexture(`enemy-A-frame-${frame}`);
          
          // Espelhar sprite baseado na direção
          this.sprite.setFlipX(directionX > 0);
        } else {
          // Movimento apenas vertical ou parado
          this.sprite.setTexture('enemy-A-frame-1');
          this.sprite.setFlipX(false);
        }
      }
      
      update() {
        super.update();
        if (this.isDestroyed) return;
        
        const currentTime = this.scene.time.now;
        
        // Máquina de estados
        switch (this.state) {
          case 'entering':
            // Verificar se entrou na tela
            if (this.sprite.y > 0) {
              this.state = 'moving_to_position';
            } else {
              // Continuar entrando (movimento para baixo)
              this.sprite.y += this.moveSpeed * (this.scene.game.loop.delta / 1000);
            }
            break;
            
          case 'moving_to_position':
          case 'moving_to_next':
          case 'leaving':
            this.move();
            break;
            
          case 'shooting':
            // Só atira quando está parado
            if (!this.isInBurst) {
              // Verificar se é hora de iniciar uma nova rajada
              if (currentTime - this.fireTimer > this.fireRate && this.burstCount < this.maxBursts) {
                this.isInBurst = true;
                this.currentBurstShots = 0;
                this.burstTimer = currentTime;
              } else if (this.burstCount >= this.maxBursts) {
                // Completou todas as rajadas nesta posição
                this.onCompletedShooting();
              }
            } else {
              // Executando rajada
              if (currentTime - this.burstTimer > this.burstRate && this.currentBurstShots < this.shotsPerBurst) {
                this.shoot();
                this.currentBurstShots++;
                this.burstTimer = currentTime;
                
                // Verificar se rajada terminou
                if (this.currentBurstShots >= this.shotsPerBurst) {
                  this.isInBurst = false;
                  this.burstCount++;
                  this.fireTimer = currentTime;
                }
              }
            }
            break;
        }
      }
      
      private onCompletedShooting() {
        if (!this.hasCompletedFirstShooting) {
          // Completou primeiro ciclo de tiros, ir para segunda posição
          this.hasCompletedFirstShooting = true;
          this.setRandomTargetForSecondPosition();
          this.state = 'moving_to_next';
        } else {
          // Completou segundo ciclo, sair da tela
          this.setExitTarget();
          this.state = 'leaving';
        }
      }
    }

    // =============================================
    // ENEMY TYPE B
    // =============================================
    class EnemyTypeB extends Enemy {
      // Estados do inimigo
      private state: 'entering' | 'initial_shooting' | 'moving_to_position' | 'position_shooting' | 'leaving' = 'entering';
      
      // Sistema de disparo
      private fireTimer = 0;
      private fireRate = 1500; // 1.5 segundos entre rajadas
      private burstTimer = 0;
      private burstRate = 400; // 400ms entre tiros da mesma rajada
      private currentBurstShots = 0;
      private isInBurst = false;
      private burstCount = 0;
      private maxBursts = 1; // 1 rajada por posição
      
      // Sistema de movimento
      private moveSpeed = 150;
      private targetX = 0;
      private targetY = 0;
      public maxMovements = 3; // Mover 3 vezes
      private hasCompletedInitialShooting = false;
      private positions: { x: number; y: number }[] = [];
      
      constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-B-frame-1');
        
        // Stats específicos do Enemy Type B
        this.hp = 1;
        this.maxHp = 1;
        this.speed = 150;
        this.maxSpeed = 300;
        this.shotsPerBurst = 2; // 2 tiros por rajada (um para cada lado)
        this.maxShotsPerBurst = 5;
        this.totalShots = 8; // Total de 8 tiros (4 rajadas de 2)
        this.maxTotalShots = 15;
        this.movementsBeforeLeaving = 1;
        this.maxMovements = 2;
        this.points = 300; // Inimigo tipo B dá 300 pontos
        
        // Configurar sprite
        this.sprite.setScale(0.7);
        this.sprite.setData('enemyType', 'B');
        this.sprite.setData('hp', this.hp);
        
        // Gerar 3 posições aleatórias que o inimigo visitará
        this.generateRandomPositions();
        
        // Começar no estado de entrada (não atirando ainda)
        this.state = 'entering';
      }
      
      private generateRandomPositions() {
        // Gerar 3 posições aleatórias na metade superior da tela
        const basePositions = [];
        
        for (let i = 0; i < 3; i++) {
          // Gerar posições em diferentes regiões da tela para variedade
          let x: number, y: number;
          
          switch (i) {
            case 0:
              // Primeira posição: lado esquerdo a centro-esquerdo
              x = Phaser.Math.Between(150, 350);
              y = Phaser.Math.Between(120, 200);
              break;
            case 1:
              // Segunda posição: centro-direita a direita
              x = Phaser.Math.Between(450, 650);
              y = Phaser.Math.Between(140, 220);
              break;
            case 2:
              // Terceira posição: centro da tela
              x = Phaser.Math.Between(300, 500);
              y = Phaser.Math.Between(180, 260);
              break;
            default:
              x = Phaser.Math.Between(200, 600);
              y = Phaser.Math.Between(120, 250);
          }
          
          basePositions.push({ x, y });
        }
        
        // Encontrar posições livres para cada posição planejada
        const gameScene = this.scene as GameScene;
        this.positions = basePositions.map((pos, index) => 
          gameScene.findFreePosition(pos.x, pos.y, this.id + '_planning_' + index)
        );
      }
      
      move() {
        const deltaTime = this.scene.game.loop.delta / 1000;
        
        // Calcular direção para o alvo
        const directionX = this.targetX - this.sprite.x;
        const directionY = this.targetY - this.sprite.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Se chegou perto o suficiente do alvo
        if (distance < 10) {
          this.onReachedTarget();
          return;
        }
        
        // Normalizar direção e aplicar velocidade
        const normalizedX = directionX / distance;
        const normalizedY = directionY / distance;
        
        this.sprite.x += normalizedX * this.moveSpeed * deltaTime;
        this.sprite.y += normalizedY * this.moveSpeed * deltaTime;
        
        // Atualizar animação de movimento
        this.updateMovementAnimation(normalizedX);
      }
      
      private onReachedTarget() {
        // Chegou na posição, mudar para modo de tiro e reservar posição
        this.state = 'position_shooting';
        this.resetShooting();
        
        const gameScene = this.scene as GameScene;
        gameScene.reservePosition(this.sprite.x, this.sprite.y, this.id);
      }
      
      private setNextTarget() {
        if (this.movementCount < this.maxMovements && this.movementCount < this.positions.length) {
          // Usar próxima posição aleatória gerada
          const targetPosition = this.positions[this.movementCount];
          
          // Verificar se a posição ainda está livre, senão buscar uma posição próxima livre
          const gameScene = this.scene as GameScene;
          const freePosition = gameScene.findFreePosition(targetPosition.x, targetPosition.y, this.id);
          
          this.targetX = freePosition.x;
          this.targetY = freePosition.y;
          this.movementCount++;
        } else {
          // Completou todos os movimentos, sair da tela
          this.targetX = this.sprite.x;
          this.targetY = 700; // Sair pela parte inferior
        }
      }
      
      shoot() {
        // Obter referência ao grupo de projéteis inimigos da scene
        const gameScene = this.scene as GameScene;
        if (!gameScene.enemyBullets) return;
        
        // Disparar dois projéteis: um a 45° esquerda, outro a 45° direita
        this.shootAngled(-45); // Esquerda
        this.shootAngled(45);  // Direita
        
        this.shotsFired++;
      }
      
      private shootAngled(angleDegrees: number) {
        const gameScene = this.scene as GameScene;
        if (!gameScene.enemyBullets) return;
        
        // Converter ângulo para radianos
        const angleRadians = (angleDegrees * Math.PI) / 180;
        
        // Criar projétil
        const bullet = gameScene.enemyBullets.get(this.sprite.x, this.sprite.y + 20, 'enemy-fire');
        
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(0.4);
          
          // Calcular velocidade baseada no ângulo
          const speed = 250;
          const velocityX = Math.sin(angleRadians) * speed;
          const velocityY = Math.cos(angleRadians) * speed;
          
          bullet.setData('velocityX', velocityX);
          bullet.setData('velocityY', velocityY);
          bullet.setData('damage', 1);
          bullet.setData('isEnemyBullet', true);
          bullet.setData('isAngled', true); // Marcar como projétil angular
        }
      }
      
      private updateMovementAnimation(directionX: number) {
        // Atualizar frame baseado na direção do movimento
        if (Math.abs(directionX) > 0.1) {
          // Está se movendo horizontalmente - alternar entre frames 2 e 3
          const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
          this.sprite.setTexture(`enemy-B-frame-${frame}`);
          
          // Espelhar sprite baseado na direção
          // Frames 2 e 3 são para movimento à esquerda (padrão)
          // Para movimento à direita, espelhar
          this.sprite.setFlipX(directionX > 0);
        } else {
          // Movimento apenas vertical ou parado - usar frame 1
          this.sprite.setTexture('enemy-B-frame-1');
          this.sprite.setFlipX(false);
        }
      }
      
      private resetShooting() {
        this.burstCount = 0;
        this.shotsFired = 0;
        this.fireTimer = this.scene.time.now;
        this.sprite.setTexture('enemy-B-frame-1'); // Frame de repouso
      }
      
      update() {
        super.update();
        if (this.isDestroyed) return;
        
        const currentTime = this.scene.time.now;
        
        // Máquina de estados
        switch (this.state) {
          case 'entering':
            // Verificar se entrou na tela
            if (this.sprite.y > 50) {
              this.state = 'initial_shooting';
              this.resetShooting();
            } else {
              // Continuar entrando (movimento para baixo)
              this.sprite.y += 100 * (this.scene.game.loop.delta / 1000);
            }
            break;
            
          case 'initial_shooting':
            // Executar rajada inicial
            this.executeShootingBehavior(currentTime);
            
            // Verificar se completou o tiro inicial
            if (this.burstCount >= this.maxBursts && !this.hasCompletedInitialShooting) {
              this.hasCompletedInitialShooting = true;
              this.setNextTarget();
              this.state = 'moving_to_position';
            }
            break;
            
          case 'moving_to_position':
            this.move();
            break;
            
          case 'position_shooting':
            // Executar rajada na posição
            this.executeShootingBehavior(currentTime);
            
            // Verificar se completou o tiro na posição
            if (this.burstCount >= this.maxBursts) {
              if (this.movementCount >= this.maxMovements) {
                // Completou todos os movimentos, sair
                this.setNextTarget(); // Defines exit point
                this.state = 'leaving';
              } else {
                // Ir para próxima posição
                this.setNextTarget();
                this.state = 'moving_to_position';
              }
            }
            break;
            
          case 'leaving':
            this.move();
            // Verificar se saiu da tela
            if (this.sprite.y > 650) {
              this.isDestroyed = true;
              // Não marcar isKilledByPlayer como true - inimigo saiu da tela
            }
            break;
        }
      }
      
      private executeShootingBehavior(currentTime: number) {
        if (!this.isInBurst) {
          // Verificar se é hora de iniciar uma nova rajada
          if (currentTime - this.fireTimer > this.fireRate && this.burstCount < this.maxBursts) {
            this.isInBurst = true;
            this.currentBurstShots = 0;
            this.burstTimer = currentTime;
          }
        } else {
          // Executando rajada
          if (currentTime - this.burstTimer > this.burstRate && this.currentBurstShots < this.shotsPerBurst) {
            this.shoot();
            this.currentBurstShots++;
            this.burstTimer = currentTime;
            
            // Verificar se rajada terminou
            if (this.currentBurstShots >= this.shotsPerBurst) {
              this.isInBurst = false;
              this.burstCount++;
              this.fireTimer = currentTime;
            }
          }
        }
      }
    }

    // =============================================
    // ENEMY TYPE C
    // =============================================
    class EnemyTypeC extends Enemy {
      // Estados do inimigo
      private state: 'entering' | 'moving_to_position' | 'shooting' | 'moving' | 'leaving' = 'entering';
      
      // Sistema de disparo
      private fireTimer = 0;
      private fireRate = 800; // 800ms entre tiros
      private currentShots = 0;
      private shotsPerBurstC = 5; // 5 tiros por rajada
      
      // Sistema de movimento
      private moveSpeed = 180; // Aumentado de 120 para 180
      private targetX = 0;
      private targetY = 0;
      private movementCountC = 0;
      private maxMovementsPerCycle = 3; // 3 movimentos por ciclo
      private cycleCount = 0;
      private maxCycles = 3; // 3 ciclos antes de sair
      
      constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy-C-frame-1');
        
        // Stats específicos do Enemy Type C
        this.hp = 1;
        this.maxHp = 1;
        this.speed = 120;
        this.maxSpeed = 200;
        this.shotsPerBurst = 5; // 5 tiros por rajada
        this.maxShotsPerBurst = 8;
        this.totalShots = 15; // Total de 15 tiros (3 ciclos * 5 tiros)
        this.maxTotalShots = 25;
        this.movementsBeforeLeaving = 3;
        this.maxMovements = 5;
        this.points = 500; // Inimigo tipo C dá 500 pontos
        
        // Configurar sprite
        this.sprite.setScale(1);
        this.sprite.setData('enemyType', 'C');
        this.sprite.setData('hp', this.hp);
        
        // Definir primeira posição aleatória
        this.setNextPosition();
      }
      
      private setNextPosition() {
        // Gerar posição aleatória inicial na área de jogo
        const preferredX = Phaser.Math.Between(150, 650);
        const preferredY = Phaser.Math.Between(120, 250);
        
        // Encontrar posição livre
        const gameScene = this.scene as GameScene;
        const freePosition = gameScene.findFreePosition(preferredX, preferredY, this.id);
        
        this.targetX = freePosition.x;
        this.targetY = freePosition.y;
      }
      
      private setExitTarget() {
        // Sair pela parte superior da tela
        this.targetX = this.sprite.x;
        this.targetY = -100; // Sair pelo topo
      }
      
      move() {
        const deltaTime = this.scene.game.loop.delta / 1000;
        
        // Calcular direção para o alvo
        const directionX = this.targetX - this.sprite.x;
        const directionY = this.targetY - this.sprite.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Se chegou perto o suficiente do alvo
        if (distance < 10) {
          this.onReachedTarget();
          return;
        }
        
        // Normalizar direção e aplicar velocidade
        const normalizedX = directionX / distance;
        const normalizedY = directionY / distance;
        
        this.sprite.x += normalizedX * this.moveSpeed * deltaTime;
        this.sprite.y += normalizedY * this.moveSpeed * deltaTime;
        
        // Atualizar animação de movimento
        this.updateMovementAnimation(normalizedX);
      }
      
      private onReachedTarget() {
        switch (this.state) {
          case 'moving_to_position': {
            // Chegou na posição inicial, começar a atirar e reservar posição
            this.state = 'shooting';
            this.resetShooting();
            
            const gameScene = this.scene as GameScene;
            gameScene.reservePosition(this.sprite.x, this.sprite.y, this.id);
            break;
          }
            
          case 'moving': {
            // Chegou em uma posição de movimento e reservar posição
            this.movementCountC++;
            
            const gameScene = this.scene as GameScene;
            gameScene.reservePosition(this.sprite.x, this.sprite.y, this.id);
            
            if (this.movementCountC >= this.maxMovementsPerCycle) {
              // Completou os movimentos deste ciclo, atirar novamente
              this.state = 'shooting';
              this.resetShooting();
              this.movementCountC = 0;
            } else {
              // Continuar se movendo
              this.setNextPosition();
            }
            break;
          }
            
          case 'leaving':
            // Saiu da tela
            this.isDestroyed = true;
            // Não marcar isKilledByPlayer como true - inimigo saiu da tela
            break;
        }
      }
      
      shoot() {
        // Obter referência ao jogador e ao grupo de projéteis
        const gameScene = this.scene as GameScene;
        if (!gameScene.enemyBullets || !gameScene.player) return;
        
        // Capturar posição atual do jogador no momento do disparo
        const playerX = gameScene.player.x;
        const playerY = gameScene.player.y;
        
        // Calcular direção para o jogador
        const directionX = playerX - this.sprite.x;
        const directionY = playerY - this.sprite.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Normalizar direção
        const normalizedX = directionX / distance;
        const normalizedY = directionY / distance;
        
        // Criar projétil
        const bullet = gameScene.enemyBullets.get(this.sprite.x, this.sprite.y + 20, 'enemy-fire');
        
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(0.8);
          
          // Velocidade do projétil direcionado
          const speed = 280;
          const velocityX = normalizedX * speed;
          const velocityY = normalizedY * speed;
          
          bullet.setData('velocityX', velocityX);
          bullet.setData('velocityY', velocityY);
          bullet.setData('damage', 1);
          bullet.setData('isEnemyBullet', true);
          bullet.setData('isDirected', true); // Marcar como projétil direcionado
        }
        
        this.currentShots++;
        this.shotsFired++;
      }
      
      private updateMovementAnimation(directionX: number) {
        // Atualizar frame baseado na direção do movimento
        if (Math.abs(directionX) > 0.1) {
          // Está se movendo horizontalmente - alternar entre frames 2 e 3
          const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
          this.sprite.setTexture(`enemy-C-frame-${frame}`);
          
          // Espelhar sprite baseado na direção
          this.sprite.setFlipX(directionX > 0);
        } else {
          // Movimento apenas vertical ou parado - usar frame 1
          this.sprite.setTexture('enemy-C-frame-1');
          this.sprite.setFlipX(false);
        }
      }
      
      private resetShooting() {
        this.currentShots = 0;
        this.fireTimer = this.scene.time.now;
        this.sprite.setTexture('enemy-C-frame-1'); // Frame de repouso
      }
      
      update() {
        super.update();
        if (this.isDestroyed) return;
        
        const currentTime = this.scene.time.now;
        
        // Máquina de estados
        switch (this.state) {
          case 'entering':
            // Verificar se entrou na tela
            if (this.sprite.y > 30) {
              this.state = 'moving_to_position';
            } else {
              // Continuar entrando (movimento para baixo)
              this.sprite.y += this.moveSpeed * (this.scene.game.loop.delta / 1000);
            }
            break;
            
          case 'moving_to_position':
          case 'moving':
          case 'leaving':
            this.move();
            break;
            
          case 'shooting':
            // Executar rajada de tiros
            if (this.currentShots < this.shotsPerBurstC) {
              if (currentTime - this.fireTimer > this.fireRate) {
                this.shoot();
                this.fireTimer = currentTime;
              }
            } else {
              // Completou a rajada
              this.onCompletedShooting();
            }
            break;
        }
      }
      
      private onCompletedShooting() {
        this.cycleCount++;
        
        if (this.cycleCount >= this.maxCycles) {
          // Completou todos os ciclos, sair da tela
          this.setExitTarget();
          this.state = 'leaving';
        } else {
          // Começar próximo ciclo de movimento
          this.setNextPosition();
          this.state = 'moving';
          this.movementCountC = 0;
        }
      }
    }

    // =============================================
    // BOSS TYPE A
    // =============================================
    class BossTypeA extends Enemy {
      // Estados do chefe
      private state: 'entering' | 'moving_to_position' | 'shooting' | 'moving' = 'entering';
      
      // Sistema de disparo
      private fireTimer = 0;
      private fireRate = 1000; // 1 segundo entre rajadas
      private burstTimer = 0;
      private burstRate = 200; // 200ms entre tiros da mesma rajada
      private currentBurstShots = 0;
      private isInBurst = false;
      private burstCount = 0;
      private maxBursts = 3; // 3 rajadas por posição
      
      // Sistema de movimento
      private moveSpeed = 120; // Mais lento que inimigo tipo A (150)
      private targetX = 0;
      private targetY = 0;
      private positionsVisited = 0;
      
      // Sistema de dano visual
      private isFlashing = false;
      
      constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'boss-A-frame-1');
        
        // Stats específicos do Boss Type A
        this.hp = 30;
        this.maxHp = 30;
        this.speed = 120;
        this.maxSpeed = 200;
        this.shotsPerBurst = 3; // 3 tiros por rajada
        this.maxShotsPerBurst = 7;
        this.totalShots = 30; // Será ajustado pela onda
        this.maxTotalShots = 100;
        this.movementsBeforeLeaving = 999; // Nunca vai embora
        this.maxMovements = 999;
        
        // Configurar sprite
        this.sprite.setScale(1.5); // Maior que inimigos normais
        this.sprite.setData('enemyType', 'BossA');
        this.sprite.setData('hp', this.hp);
        this.sprite.setData('maxHp', this.maxHp);
        
        // Definir primeira posição aleatória na metade superior
        this.setRandomTarget();
        
        console.log(`Boss Type A criado com ${this.hp} HP`);
      }
      
      // Sobrescrever método para calcular pontos baseado na onda
      adjustForWave(wave: number) {
        // Pontuação baseada na onda
        this.points = 1000 * wave;
        
        // Aumentar shots per burst baseado na onda
        this.shotsPerBurst = Math.min(this.maxShotsPerBurst, 3 + Math.floor(wave / 2));
        
        // Aumentar total shots baseado na onda
        this.totalShots = Math.min(this.maxTotalShots, 30 + (wave * 10));
        
        // Aumentar velocidade ligeiramente baseado na onda
        this.speed = Math.min(this.maxSpeed, 120 + (wave * 5));
        this.moveSpeed = this.speed;
        
        console.log(`Boss ajustado para onda ${wave}: ${this.shotsPerBurst} tiros/rajada, ${this.points} pontos`);
      }
      
      private setRandomTarget() {
        // Posição aleatória na metade superior da tela
        const preferredX = Phaser.Math.Between(200, 600);
        const preferredY = Phaser.Math.Between(100, 300);
        
        // Boss não precisa verificar posições ocupadas (ele tem prioridade)
        this.targetX = preferredX;
        this.targetY = preferredY;
      }
      
      move() {
        const deltaTime = this.scene.game.loop.delta / 1000;
        
        // Calcular direção para o alvo
        const directionX = this.targetX - this.sprite.x;
        const directionY = this.targetY - this.sprite.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Se chegou perto o suficiente do alvo
        if (distance < 15) {
          this.onReachedTarget();
          return;
        }
        
        // Normalizar direção e aplicar velocidade
        const normalizedX = directionX / distance;
        const normalizedY = directionY / distance;
        
        this.sprite.x += normalizedX * this.moveSpeed * deltaTime;
        this.sprite.y += normalizedY * this.moveSpeed * deltaTime;
        
        // Atualizar animação de movimento
        this.updateMovementAnimation(normalizedX);
      }
      
      private onReachedTarget() {
        // Chegou na posição, começar a atirar
        this.state = 'shooting';
        this.resetShooting();
        this.positionsVisited++;
      }
      
      private resetShooting() {
        this.burstCount = 0;
        this.shotsFired = 0;
        this.fireTimer = this.scene.time.now;
        this.sprite.setTexture('boss-A-frame-1'); // Frame de repouso
      }
      
      shoot() {
        // Obter referência ao grupo de projéteis inimigos da scene
        const gameScene = this.scene as GameScene;
        if (!gameScene.enemyBullets) return;
        
        // Criar projétil do boss partindo do centro, sempre em linha reta para baixo
        const bullet = gameScene.enemyBullets.get(this.sprite.x, this.sprite.y + 40, 'boss-fire');
        
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(1.2); // Projéteis do boss são maiores
          bullet.setData('speed', 350); // Velocidade do projétil apenas para baixo
          bullet.setData('damage', 2); // Boss causa mais dano
          bullet.setData('isEnemyBullet', true);
          bullet.setData('isBossBullet', true); // Identificar como projétil de boss
          // Garantir que não tem flags de movimento angular
          bullet.setData('isAngled', false);
          bullet.setData('isDirected', false);
        }
        
        this.shotsFired++;
      }
      
      private updateMovementAnimation(directionX: number) {
        // Atualizar frame baseado na direção do movimento (apenas se não estiver em flash)
        if (this.isFlashing) return;
        
        if (Math.abs(directionX) > 0.1) {
          // Está se movendo horizontalmente
          const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
          this.sprite.setTexture(`boss-A-frame-${frame}`);
          
          // Espelhar sprite baseado na direção
          this.sprite.setFlipX(directionX > 0);
        } else {
          // Movimento apenas vertical ou parado
          this.sprite.setTexture('boss-A-frame-1');
          this.sprite.setFlipX(false);
        }
      }
      
      // Sobrescrever método takeDamage para adicionar efeito de flash
      takeDamage(damage: number) {
        this.hp -= damage;
        console.log(`Boss levou ${damage} de dano. HP restante: ${this.hp}/${this.maxHp}`);
        
        // Ativar efeito de flash
        this.activateFlash();
        
        if (this.hp <= 0) {
          this.destroy();
        }
      }
      
      private activateFlash() {
        if (this.isFlashing) return; // Evitar múltiplos flashes simultâneos
        
        this.isFlashing = true;
        
        // Mudar para cor branca (flash)
        this.sprite.setTint(0xffffff);
        
        // Voltar à cor normal após 150ms
        this.scene.time.delayedCall(150, () => {
          this.sprite.clearTint();
          this.isFlashing = false;
        });
      }
      
      // Sobrescrever método destroy para múltiplas animações de destruição
      destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.isKilledByPlayer = true;
        
        console.log(`Boss Type A destruído! Pontuação: ${this.points}`);
        
        // Criar 5 animações de destruição: centro + 4 cantos
        const centerX = this.sprite.x;
        const centerY = this.sprite.y;
        const offset = 40; // Distância dos cantos em relação ao centro
        
        // Animação central
        new DeathAnimation(this.scene, centerX, centerY);
        
        // Animações nos cantos (com pequeno delay para efeito visual)
        this.scene.time.delayedCall(100, () => {
          new DeathAnimation(this.scene, centerX - offset, centerY - offset); // Superior esquerdo
        });
        
        this.scene.time.delayedCall(200, () => {
          new DeathAnimation(this.scene, centerX + offset, centerY - offset); // Superior direito
        });
        
        this.scene.time.delayedCall(300, () => {
          new DeathAnimation(this.scene, centerX - offset, centerY + offset); // Inferior esquerdo
        });
        
        this.scene.time.delayedCall(400, () => {
          new DeathAnimation(this.scene, centerX + offset, centerY + offset, () => {
            // Callback final após todas as animações - incrementar pontuação
            const gameScene = this.scene as GameScene;
            gameScene.addScore(this.points);
          });
        });
        
        // Remover sprite do boss
        this.sprite.destroy();
      }
      
      update() {
        super.update();
        if (this.isDestroyed) return;
        
        const currentTime = this.scene.time.now;
        
        // Máquina de estados
        switch (this.state) {
          case 'entering':
            // Verificar se entrou na tela o suficiente
            if (this.sprite.y > 80) {
              this.state = 'moving_to_position';
            } else {
              // Continuar entrando (movimento para baixo)
              this.sprite.y += this.moveSpeed * (this.scene.game.loop.delta / 1000);
            }
            break;
            
          case 'moving_to_position':
          case 'moving':
            this.move();
            break;
            
          case 'shooting':
            // Executar comportamento de tiro
            if (!this.isInBurst) {
              if (currentTime - this.fireTimer > this.fireRate && this.burstCount < this.maxBursts) {
                this.isInBurst = true;
                this.currentBurstShots = 0;
                this.burstTimer = currentTime;
              } else if (this.burstCount >= this.maxBursts) {
                // Completou os tiros nesta posição, mover para próxima
                this.onCompletedShooting();
              }
            } else {
              // Executando rajada
              if (currentTime - this.burstTimer > this.burstRate && this.currentBurstShots < this.shotsPerBurst) {
                this.shoot();
                this.currentBurstShots++;
                this.burstTimer = currentTime;
                
                // Verificar se rajada terminou
                if (this.currentBurstShots >= this.shotsPerBurst) {
                  this.isInBurst = false;
                  this.burstCount++;
                  this.fireTimer = currentTime;
                }
              }
            }
            break;
        }
      }
      
      private onCompletedShooting() {
        // Boss nunca vai embora, sempre move para nova posição
        this.setRandomTarget();
        this.state = 'moving';
      }
    }

    // Classe da cena do jogo
    class GameScene extends Phaser.Scene {
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
      currentBoss: BossTypeA | null = null;
      bossSpawnTimer = 0;
      shouldSpawnBoss = false;
      bossSpawnDelay = 5000; // 5 segundos

      // Sistema de controle de posições ocupadas
      occupiedPositions: { x: number; y: number; enemyId: string }[] = [];
      positionRadius = 60; // Raio mínimo entre inimigos parados

      preload() {
        // Carregar imagens do player
        this.load.image('player-frame-1', playerFrame1);
        this.load.image('player-frame-2', playerFrame2);
        this.load.image('player-frame-3', playerFrame3);
        
        // Carregar sprite do tiro do jogador
        this.load.image('player-fire', playerFire);
        
        // Carregar sprite do tiro do inimigo
        this.load.image('enemy-fire', enemyFire);
        
        // Carregar sprites de destruição
        this.load.image('death-frame-1', deathFrame1);
        this.load.image('death-frame-2', deathFrame2);
        this.load.image('death-frame-3', deathFrame3);
        this.load.image('death-frame-4', deathFrame4);
        this.load.image('death-frame-5', deathFrame5);
        this.load.image('death-frame-6', deathFrame6);
        this.load.image('death-frame-7', deathFrame7);
        this.load.image('death-frame-8', deathFrame8);
        this.load.image('death-frame-9', deathFrame9);
        
        // Carregar sprites do inimigo tipo A
        this.load.image('enemy-A-frame-1', enemyAFrame1);
        this.load.image('enemy-A-frame-2', enemyAFrame2);
        this.load.image('enemy-A-frame-3', enemyAFrame3);
        
        // Carregar sprites do inimigo tipo B
        this.load.image('enemy-B-frame-1', enemyBFrame1);
        this.load.image('enemy-B-frame-2', enemyBFrame2);
        this.load.image('enemy-B-frame-3', enemyBFrame3);
        
        // Carregar sprites do inimigo tipo C
        this.load.image('enemy-C-frame-1', enemyCFrame1);
        this.load.image('enemy-C-frame-2', enemyCFrame2);
        this.load.image('enemy-C-frame-3', enemyCFrame3);
        
        // Carregar sprites do boss tipo A
        this.load.image('boss-A-frame-1', bossAFrame1);
        this.load.image('boss-A-frame-2', bossAFrame2);
        this.load.image('boss-A-frame-3', bossAFrame3);
        
        // Carregar sprite do tiro do boss
        this.load.image('boss-fire', bossFire);
      }

      create() {
        // Criar o player no centro do fundo da tela
        this.player = this.add.sprite(400, 550, 'player-frame-1');
        this.player.setScale(0.8); // Ajustar tamanho se necessário

        // Criar grupo de projéteis do jogador
        this.playerBullets = this.add.group({
          classType: Phaser.GameObjects.Sprite,
          maxSize: 50,
          runChildUpdate: true
        });

        // Criar grupo de projéteis dos inimigos
        this.enemyBullets = this.add.group({
          classType: Phaser.GameObjects.Sprite,
          maxSize: 100,
          runChildUpdate: true
        });

        // Configurar controles
        this.cursors = this.input.keyboard?.createCursorKeys() || null;
        this.wasd = this.input.keyboard?.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key } || null;
        
        // Configurar teclas de disparo
        this.fireKeys = this.input.keyboard?.addKeys('SPACE,F,NUMPAD_FIVE') as { [key: string]: Phaser.Input.Keyboard.Key } || null;

        // Definir os limites do player dentro do canvas
        if (this.player) {
          this.player.setData('minX', this.player.width * 0.4);
          this.player.setData('maxX', 800 - this.player.width * 0.4);
          this.player.setData('minY', this.player.height * 0.4);
          this.player.setData('maxY', 600 - this.player.height * 0.4);
        }

        setGameState('playing');
        
        // Inicializar sistema de ondas
        this.currentWave = 1;
        this.calculateMaxEnemiesForWave(this.currentWave);
        
        // Iniciar com sub-onda 1 (inimigo tipo A)
        this.spawnSubWave(1);
      }

      update() {
        if (!this.player || !this.cursors) return;

        let velocityX = 0;
        let velocityY = 0;

        // Verificar input de movimento
        if (this.cursors.left.isDown || (this.wasd?.A?.isDown)) {
          velocityX = -1;
        } else if (this.cursors.right.isDown || (this.wasd?.D?.isDown)) {
          velocityX = 1;
        }

        if (this.cursors.up.isDown || (this.wasd?.W?.isDown)) {
          velocityY = -1;
        } else if (this.cursors.down.isDown || (this.wasd?.S?.isDown)) {
          velocityY = 1;
        }

        // Verificar input de disparo
        const currentTime = this.time.now;
        if (this.fireKeys && (this.fireKeys.SPACE?.isDown || this.fireKeys.F?.isDown || this.fireKeys.NUMPAD_FIVE?.isDown)) {
          if (currentTime - this.lastFireTime > this.fireRate) {
            this.fireBullet();
            this.lastFireTime = currentTime;
          }
        }

        // Normalizar o vetor de movimento para manter velocidade constante
        const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (magnitude > 0) {
          velocityX = (velocityX / magnitude) * this.playerSpeed;
          velocityY = (velocityY / magnitude) * this.playerSpeed;
        }

        // Atualizar posição do player
        const deltaTime = this.game.loop.delta / 1000;
        const newX = this.player.x + velocityX * deltaTime;
        const newY = this.player.y + velocityY * deltaTime;

        // Aplicar limites
        const minX = this.player.getData('minX');
        const maxX = this.player.getData('maxX');
        const minY = this.player.getData('minY');
        const maxY = this.player.getData('maxY');

        this.player.x = Phaser.Math.Clamp(newX, minX, maxX);
        this.player.y = Phaser.Math.Clamp(newY, minY, maxY);

        // Atualizar frame do player baseado no movimento
        this.updatePlayerFrame(velocityX);
        
        // Atualizar projéteis
        this.updateBullets();
        
        // Atualizar inimigos
        this.updateEnemies();
        
        // Verificar colisões
        this.checkCollisions();
      }

      updatePlayerFrame(velocityX: number) {
        if (!this.player) return;

        // Se não há movimento horizontal, usar frame 1 (nave em repouso)
        if (velocityX === 0) {
          this.player.setTexture('player-frame-1');
          this.player.setFlipX(false);
          this.lastMoveDirection.x = 0;
          return;
        }

        // Movimento para a esquerda (padrão)
        if (velocityX < 0) {
          if (this.lastMoveDirection.x !== -1) {
            // Transição para esquerda - frame 2
            this.player.setTexture('player-frame-2');
            this.player.setFlipX(false);
            this.lastMoveDirection.x = -1;
            
            // Depois de um tempo, mudar para frame 3
            this.time.delayedCall(100, () => {
              if (this.player && velocityX < 0) {
                this.player.setTexture('player-frame-3');
                this.player.setFlipX(false);
              }
            });
          }
        }
        
        // Movimento para a direita (espelhado)
        else if (velocityX > 0) {
          if (this.lastMoveDirection.x !== 1) {
            // Transição para direita - frame 2 espelhado
            this.player.setTexture('player-frame-2');
            this.player.setFlipX(true);
            this.lastMoveDirection.x = 1;
            
            // Depois de um tempo, mudar para frame 3 espelhado
            this.time.delayedCall(100, () => {
              if (this.player && velocityX > 0) {
                this.player.setTexture('player-frame-3');
                this.player.setFlipX(true);
              }
            });
          }
        }
      }
      
      fireBullet() {
        if (!this.player || !this.playerBullets) return;
        
        // Criar projétil na posição do jogador
        const bullet = this.playerBullets.get(this.player.x, this.player.y - 30, 'player-fire');
        
        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setScale(1); // Ajustar tamanho do projétil
          
          // Configurar dados do projétil
          bullet.setData('speed', -this.bulletSpeed); // Negativo para ir para cima
          bullet.setData('damage', 1); // Dano que o projétil causa
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
            sprite.y += sprite.getData('speed') * deltaTime;
            
            // Remover projétil se sair da tela
            if (sprite.y < -10) {
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
            
            // Verificar se é projétil do boss - sempre move em linha reta para baixo
            if (sprite.getData('isBossBullet')) {
              // Boss sempre atira em linha reta para baixo, sem influência de direção
              sprite.y += sprite.getData('speed') * deltaTime;
              // Não alterar X - manter trajetória vertical
            }
            // Verificar se é projétil angular (inimigo tipo B) ou direcionado (inimigo tipo C)
            else if (sprite.getData('isAngled') || sprite.getData('isDirected')) {
              // Movimento baseado em velocidade X e Y
              sprite.x += sprite.getData('velocityX') * deltaTime;
              sprite.y += sprite.getData('velocityY') * deltaTime;
            } else {
              // Movimento padrão para baixo (inimigo tipo A)
              sprite.y += sprite.getData('speed') * deltaTime;
            }
            
            // Remover projétil se sair da tela
            if (sprite.y > 610 || sprite.x < -10 || sprite.x > 810) {
              sprite.setActive(false);
              sprite.setVisible(false);
            }
          }
        });
      }
      
      updateEnemies() {
        // Atualizar todos os inimigos e remover os destruídos
        const previousEnemyCount = this.enemies.length;
        let enemiesKilledByPlayer = 0;
        
        this.enemies = this.enemies.filter(enemy => {
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
            console.log('Boss foi derrotado!');
          }
        }
        
        // Atualizar contador de inimigos derrotados apenas com os que foram mortos pelo jogador
        if (enemiesKilledByPlayer > 0) {
          this.enemiesDefeated += enemiesKilledByPlayer;
          console.log(`${enemiesKilledByPlayer} inimigo(s) derrotado(s) pelo jogador. Total derrotados: ${this.enemiesDefeated}/${this.maxEnemiesInWave}`);
          this.lastEnemyKilledTime = this.time.now;
        }
        
        // Log de inimigos que saíram da tela
        const enemiesThatLeft = (previousEnemyCount - this.enemies.length) - enemiesKilledByPlayer;
        if (enemiesThatLeft > 0) {
          console.log(`${enemiesThatLeft} inimigo(s) saíram da tela (não contabilizados como derrotados)`);
        }
        
        // Verificar se deve spawnar boss
        if (this.enemiesDefeated >= this.maxEnemiesInWave && !this.currentBoss && !this.shouldSpawnBoss) {
          console.log('Todos os inimigos da onda foram derrotados. Boss spawnará em 5 segundos...');
          this.shouldSpawnBoss = true;
          this.bossSpawnTimer = this.time.now;
        }
        
        // Spawnar boss após delay
        if (this.shouldSpawnBoss && this.time.now - this.bossSpawnTimer > this.bossSpawnDelay) {
          this.spawnBoss();
          this.shouldSpawnBoss = false;
        }
        
        // Sistema de sub-ondas (apenas se boss não foi spawnado ainda)
        if (!this.shouldSpawnBoss && !this.currentBoss) {
          if (this.enemies.length === 0 && this.enemiesDefeated < this.maxEnemiesInWave) {
            // Verificar se passou tempo suficiente desde o último inimigo morto
            if (this.time.now - this.lastEnemyKilledTime > this.subWaveDelay) {
              this.currentSubWave++;
              this.spawnSubWave(this.currentSubWave);
            }
          }
        }
      }
      
      spawnSubWave(subWave: number) {
        console.log(`Spawning sub-onda ${subWave} da onda ${this.currentWave}`);
        
        // Primeiras 3 sub-ondas da onda 1 são fixas
        if (this.currentWave === 1 && subWave <= 3) {
          switch (subWave) {
            case 1:
              this.spawnMultipleEnemiesTypeA(5);
              break;
            case 2:
              this.spawnMultipleEnemiesTypeB(3);
              break;
            case 3:
              this.spawnMultipleEnemiesTypeC(1);
              break;
          }
        } else {
          // A partir da 4ª sub-onda da onda 1 ou qualquer sub-onda das ondas seguintes
          this.spawnRandomEnemies();
        }
      }
      
      calculateMaxEnemiesForWave(wave: number) {
        if (wave === 1) {
          this.maxEnemiesInWave = 15;
        } else if (wave <= 3) {
          this.maxEnemiesInWave = 15 + (5 * (wave - 1));
        } else {
          // A partir da onda 4, incremento aleatório entre 5 e 10
          const previousMax = wave === 4 ? 25 : this.maxEnemiesInWave;
          const increment = Phaser.Math.Between(5, 10);
          this.maxEnemiesInWave = previousMax + increment;
        }
        console.log(`Onda ${wave}: Máximo de ${this.maxEnemiesInWave} inimigos`);
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
        
        console.log(`Spawning ${enemiesToSpawn} inimigos aleatórios (derrotados: ${this.enemiesDefeated}/${this.maxEnemiesInWave})`);
        
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
        const x = Phaser.Math.Between(100, 700);
        const y = -50; // Fora da tela, no topo
        
        const enemy = new EnemyTypeA(this, x, y);
        enemy.adjustForWave(this.currentWave);
        this.enemies.push(enemy);
        
        console.log(`Enemy A spawnado. Derrotados: ${this.enemiesDefeated}/${this.maxEnemiesInWave}`);
      }
      
      spawnEnemyB() {
        // Spawnar inimigo do tipo B no topo da tela, posição aleatória
        const x = Phaser.Math.Between(200, 600); // Posição mais centralizada para a curva
        const y = -50; // Fora da tela, no topo
        
        const enemy = new EnemyTypeB(this, x, y);
        enemy.adjustForWave(this.currentWave);
        this.enemies.push(enemy);
        
        console.log(`Enemy B spawnado. Derrotados: ${this.enemiesDefeated}/${this.maxEnemiesInWave}`);
      }
      
      spawnEnemyC() {
        // Spawnar inimigo do tipo C no topo da tela, posição aleatória
        const x = Phaser.Math.Between(250, 550); // Posição centralizada
        const y = -50; // Fora da tela, no topo
        
        const enemy = new EnemyTypeC(this, x, y);
        enemy.adjustForWave(this.currentWave);
        this.enemies.push(enemy);
        
        console.log(`Enemy C spawnado. Derrotados: ${this.enemiesDefeated}/${this.maxEnemiesInWave}`);
      }
      
      spawnBoss() {
        console.log(`Spawnando Boss Type A para onda ${this.currentWave}`);
        
        // Spawnar boss no centro superior da tela
        const bossX = 400; // Centro da tela
        const bossY = -100; // Fora da tela, no topo
        
        this.currentBoss = new BossTypeA(this, bossX, bossY);
        this.currentBoss.adjustForWave(this.currentWave);
        
        console.log(`Boss Type A spawnado com ${this.currentBoss.hp} HP e ${this.currentBoss.points} pontos`);
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
              bulletSprite.x, bulletSprite.y,
              enemy.sprite.x, enemy.sprite.y
            );
            
            if (distance < 30) { // Raio de colisão
              // Projétil atingiu inimigo
              bulletSprite.setActive(false);
              bulletSprite.setVisible(false);
              
              // Inimigo recebe dano
              enemy.takeDamage(bulletSprite.getData('damage') || 1);
            }
          });
          
          // Verificar colisão com boss
          if (this.currentBoss && !this.currentBoss.isDestroyed) {
            const distance = Phaser.Math.Distance.Between(
              bulletSprite.x, bulletSprite.y,
              this.currentBoss.sprite.x, this.currentBoss.sprite.y
            );
            
            if (distance < 50) { // Raio de colisão maior para o boss
              // Projétil atingiu boss
              bulletSprite.setActive(false);
              bulletSprite.setVisible(false);
              
              // Boss recebe dano
              this.currentBoss.takeDamage(bulletSprite.getData('damage') || 1);
            }
          }
        });
        
        // Colisão projéteis dos inimigos vs jogador
        this.enemyBullets.children.entries.forEach((bullet) => {
          const bulletSprite = bullet as Phaser.GameObjects.Sprite;
          if (!bulletSprite.active) return;
          
          // Verificar colisão com jogador
          const distance = Phaser.Math.Distance.Between(
            bulletSprite.x, bulletSprite.y,
            this.player!.x, this.player!.y
          );
          
          // Raio de colisão maior para projéteis do boss
          const collisionRadius = bulletSprite.getData('isBossBullet') ? 30 : 25;
          
          if (distance < collisionRadius) {
            // Projétil atingiu jogador
            bulletSprite.setActive(false);
            bulletSprite.setVisible(false);
            
            // Dano diferente baseado no tipo de projétil
            const damage = bulletSprite.getData('damage') || 1;
            console.log(`Jogador atingido! Dano: ${damage}`);
          }
        });
      }
      
      addScore(points: number) {
        // Incrementar pontuação usando o setter do React
        setScore(prevScore => prevScore + points);
        
        // Atualizar onda no estado do React
        setWave(this.currentWave);
        
        // Registrar que um inimigo foi morto (para o sistema de sub-ondas)
        this.lastEnemyKilledTime = this.time.now;
      }

      // Sistema de controle de posições ocupadas
      isPositionOccupied(x: number, y: number, excludeEnemyId?: string): boolean {
        return this.occupiedPositions.some(pos => {
          if (excludeEnemyId && pos.enemyId === excludeEnemyId) return false;
          const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          return distance < this.positionRadius;
        });
      }

      findFreePosition(preferredX: number, preferredY: number, enemyId: string, attempts: number = 10): { x: number; y: number } {
        // Primeiro tentar a posição preferida
        if (!this.isPositionOccupied(preferredX, preferredY, enemyId)) {
          return { x: preferredX, y: preferredY };
        }

       

        // Se a posição preferida está ocupada, tentar posições próximas
        for (let i = 0; i < attempts; i++) {
          const angle = (i * 45) % 360; // Tentar em ângulos de 45 graus
          const distance = this.positionRadius + 20 + (i * 10); // Aumentar distância gradualmente
          
          const newX = preferredX + Math.cos(angle * Math.PI / 180) * distance;
          const newY = preferredY + Math.sin(angle * Math.PI / 180) * distance;
          
          // Verificar se a nova posição está dentro dos limites da tela
          if (newX >= 150 && newX <= 650 && newY >= 100 && newY <= 300) {
            if (!this.isPositionOccupied(newX, newY, enemyId)) {
              return { x: newX, y: newY };
            }
          }
        }

        // Se não encontrou posição livre, usar uma posição aleatória válida
        for (let i = 0; i < 20; i++) {
          const randomX = Phaser.Math.Between(150, 650);
          const randomY = Phaser.Math.Between(100, 300);
          
          if (!this.isPositionOccupied(randomX, randomY, enemyId)) {
            return { x: randomX, y: randomY };
          }
        }

        // Último recurso: retornar posição original (pode sobrepor)
        return { x: preferredX, y: preferredY };
      }

      reservePosition(x: number, y: number, enemyId: string) {
        // Remover posição anterior deste inimigo
        this.releasePosition(enemyId);
        
        // Adicionar nova posição
        this.occupiedPositions.push({ x, y, enemyId });
      }

      releasePosition(enemyId: string) {
        this.occupiedPositions = this.occupiedPositions.filter(pos => pos.enemyId !== enemyId);
      }

      updateEnemyPosition(enemyId: string, x: number, y: number) {
        const posIndex = this.occupiedPositions.findIndex(pos => pos.enemyId === enemyId);
        if (posIndex !== -1) {
          this.occupiedPositions[posIndex].x = x;
          this.occupiedPositions[posIndex].y = y;
        }
      }
    }

    // Configuração do Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: canvasRef.current,
      backgroundColor: 'rgba(0,0,0,0)', // Totalmente transparente
      transparent: true, // Garantir transparência
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: GameScene
    };

    // Criar o jogo Phaser
    gameRef.current = new Phaser.Game(config);

    // Aplicar estilo ao canvas criado pelo Phaser
    setTimeout(() => {
      const phaserCanvas = canvasRef.current?.querySelector('canvas');
      if (phaserCanvas) {
        phaserCanvas.style.position = 'relative';
        phaserCanvas.style.zIndex = '10';
        phaserCanvas.style.background = 'transparent';
        phaserCanvas.style.pointerEvents = 'auto';
      }
    }, 100);

    // Cleanup ao desmontar o componente
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [wave, setWave]); // Adicionar setWave como dependência

  const handleMobileControl = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Implementar controles móveis posteriormente
    console.log('Mobile control:', direction);
  };

  const handleMobileAction = () => {
    // Implementar ação móvel posteriormente
    console.log('Mobile action');
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Canvas container com background */}
      <div className="relative z-10">
        <div 
          ref={canvasRef}
          className="border border-gray-600 rounded-lg overflow-hidden relative bg-transparent"
          style={{ width: '800px', height: '600px' }}
        >
          {/* Background scrolling dentro do canvas */}
          <div className="absolute inset-0 z-0">
            <ScrollingBackground speed={backgroundSpeed} width={800} height={600} />
          </div>
        </div>
      </div>
      
      {/* Game UI overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <GameUI
            lives={lives}
            score={score}
            wave={wave}
            gameState={gameState}
            onMobileControl={handleMobileControl}
            onMobileAction={handleMobileAction}
          />
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;

import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';
import AudioManager from '../../services/AudioManager';

interface GameCanvas extends Phaser.Scene {
  findFreePosition: (x: number, y: number) => { x: number; y: number };
  reservePosition: (x: number, y: number, id: string) => void;
  releasePosition: (x: number, y: number) => void;
  enemyBullets: Phaser.Physics.Arcade.Group;
  player: Phaser.Physics.Arcade.Sprite;
}

export default class EnemyTypeB extends AbstractEntity {
  // Referência para o sistema de posições do GameCanvas
  private positionManager: any = null;

  // Estados do inimigo
  public state: 'entering' | 'initial_shooting' | 'moving_to_position' | 'moving_to_next' | 'position_shooting' | 'leaving' = 'entering';
  
  // Sistema de disparo
  private shotsPerBurst: number = 2; // 2 tiros por rajada (um para cada lado)
  private maxShotsPerBurst: number = 5;
  private totalShots: number = 8; // Total de 8 tiros (4 rajadas de 2)
  private maxTotalShots: number = 15;
  private shotsFired: number = 0;
  
  // Sistema de movimento
  private targetX = 0;
  private targetY = 0;
  private moveSpeed = 150;
  private movementsBeforeLeaving = 1;
  private maxMovements = 2;
  private movementCount = 0;
  private hasCompletedInitialShooting = false;
  
  // Sistema de disparo com timers
  private burstCount = 0;
  private maxBursts = 1; // 1 rajada por posição
  private currentBurstShots = 0;
  private isInBurst = false;

  // Sistema de animação de movimento
  private lastMovingState = false;
  private animationState: 'idle' | 'starting' | 'moving' | 'shooting' | 'stopping' = 'idle';
  private animationTimer = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-B-frame-1', undefined, 'enemyB');
    
    // Stats específicos do Enemy Type B
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 150;
    this.maxSpeed = 300;
    this.points = 300; // Inimigo tipo B dá 300 pontos
    
    // Configurar sprite
    this.setScale(0.7);
    this.setData('enemyType', 'B');
    this.setData('hp', this.hp);
    
    // Obter referência para o sistema de posições
    this.positionManager = (this.scene as any).positionManager;
    
    // Começar no estado de entrada (não atirando ainda)
    this.state = 'entering';
    
    this.setRandomTargetInUpperHalf();
  }
  
  // Método para ajustar stats baseado na onda
  adjustForWave(wave: number): void {
    // Aumentar shots per burst baseado na onda, até o máximo
    this.shotsPerBurst = Math.min(this.maxShotsPerBurst, this.shotsPerBurst + Math.floor(wave / 2));

    // Aumentar total shots baseado na onda, até o máximo
    this.totalShots = Math.min(this.maxTotalShots, this.totalShots + wave);

    // Aumentar movimentos baseado na onda, até o máximo
    this.movementsBeforeLeaving = Math.min(this.maxMovements, this.movementsBeforeLeaving + Math.floor(wave / 3));

    // Aumentar velocidade baseado na onda, até o máximo
    this.speed = Math.min(this.maxSpeed, this.speed + (wave * 10));

    // Aumentar rajadas por posição baseado na onda, até o máximo
    this.maxBursts = Math.min(5, this.maxBursts + Math.floor(wave / 3));
  }
  
  private setRandomTargetInUpperHalf(): void {
    if (this.positionManager) {
      // Usar o sistema de posições para encontrar uma posição livre
      const position = this.positionManager.getRandomUpperHalfPosition();
      this.targetX = position.x;
      this.targetY = position.y;
    } else {
      // Fallback para posições relativas à largura da tela
      const screenWidth = this.scene.cameras.main.width;
      const screenHeight = this.scene.cameras.main.height;
      
      this.targetX = Phaser.Math.Between(screenWidth * 0.25, screenWidth * 0.75);
      this.targetY = Phaser.Math.Between(screenHeight * 0.13, screenHeight * 0.42);
    }
  }

    private setExitTarget(): void {
    // Definir ponto de saída (fora da tela, na parte inferior)
    this.targetX = this.x; // Manter X atual
    this.targetY = this.getScreenHeight() + 100; // Sair pela parte inferior
  }
  
  private moveToTarget(dt: number): void {
    // Calcular direção antes de mover
    const directionX = this.targetX - this.x;
    
    // Usar o método moveTowards do AbstractEntity
    const reachedTarget = this.moveTowards(this.targetX, this.targetY, this.moveSpeed, dt);
    
    if (reachedTarget) {
      this.onReachedTarget();
    }
    
    // Atualizar animação de movimento baseada na direção
    this.updateMovementAnimation(directionX);
  }
  
  private onReachedTarget(): void {
    // Chegou na posição, mudar para modo de tiro
    this.state = 'position_shooting';
    this.resetShooting();
    
    // Reservar a posição no sistema de posições
    if (this.positionManager) {
      this.positionManager.reservePosition(this.x, this.y, this.id);
    }
  }
  
  private setNextTarget(): void {
    if (this.movementCount < this.movementsBeforeLeaving) {
      // Gerar nova posição aleatória para o próximo movimento
      this.setRandomTargetInUpperHalf();
      this.movementCount++;
    } else {
      // Completou todos os movimentos, sair da tela
      this.setExitTarget();
    }
  }
  
  private resetShooting(): void {
    // NÃO resetar burstCount para manter progresso entre posições
    this.currentBurstShots = 0;
    this.isInBurst = false;
    this.setTimer('fire', 1500); // 1.5 segundos entre rajadas
    this.setTexture('enemy-B-frame-1'); // Frame de repouso
  }
  
  private shoot(): void {
    // Reproduzir som do tiro do inimigo
    AudioManager.getInstance().playSoundEffect('enemy-fire');

    // Disparar dois projéteis angulados
    this.shootAngled(45); // 45º à direita
    this.shootAngled(-45); // 45º à esquerda

    this.shotsFired += 2; // Incrementar o contador de tiros
  }
  
  private shootAngled(angleDegrees: number): void {
    // Implementação futura para integração com sistema de projéteis

    
    // Exemplo de como seria a integração:

    const gameScene = this.scene as any; // GameScene
    if (!gameScene.enemyBullets) return;
    
    // Converter ângulo para radianos
    const angleRadians = (angleDegrees * Math.PI) / 180;
    
    // Tentar criar projétil
    let bullet = gameScene.enemyBullets.get(this.x, this.y + 20, 'enemy-fire');
    
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
      bullet.setData('isAngled', true);
    }

  }
  
  private updateMovementAnimation(directionX: number): void {
    // Não aplicar animação de movimento durante estados específicos
    if (this.state === 'entering' || this.state === 'initial_shooting' || this.state === 'position_shooting') {
      this.setTexture('enemy-B-frame-1');
      this.animationState = 'idle';
      return;
    }
    
    // Verificar se está se movendo (incluindo movimento vertical)
    const directionY = this.targetY - this.y;
    const isCurrentlyMoving = Math.abs(directionX) > 5 || Math.abs(directionY) > 5;
    
    // Detectar mudança de estado de movimento
    if (isCurrentlyMoving !== this.lastMovingState) {
      if (isCurrentlyMoving) {
        // Começou a se mover
        this.animationState = 'starting';
        this.animationTimer = this.scene.time.now;
      } else {
        // Parou de se mover
        this.animationState = 'stopping';
        this.animationTimer = this.scene.time.now;
      }
      this.lastMovingState = isCurrentlyMoving;
    }
    
    // Atualizar animação baseada no estado
    const currentTime = this.scene.time.now;
    
    switch (this.animationState) {
      case 'starting':
        // Transição: frame 1 -> 2 -> 3
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('enemy-B-frame-1');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('enemy-B-frame-2');
        } else {
          this.setTexture('enemy-B-frame-3');
          this.animationState = 'moving';
        }
        break;
        
      case 'moving':
        // Manter frame 3 enquanto se move
        this.setTexture('enemy-B-frame-3');
        break;
        
      case 'stopping':
        // Transição: frame 3 -> 2 -> 1
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('enemy-B-frame-3');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('enemy-B-frame-2');
        } else {
          this.setTexture('enemy-B-frame-1');
          this.animationState = 'idle';
        }
        break;
        
      case 'idle':
      default:
        // Manter frame 1 quando parado
        this.setTexture('enemy-B-frame-1');
        break;
    }
    
    // Espelhar sprite baseado na direção apenas quando em movimento
    if (isCurrentlyMoving) {
      this.setFlipX(directionX > 0);
    }
  }

    private handleShooting(): void {
    if (!this.isInBurst) {
      // Verificar se é hora de iniciar uma nova rajada
      if (this.isTimerExpired('fire') && this.burstCount < this.maxBursts) {
        this.isInBurst = true;
        this.currentBurstShots = 0;
        this.setTimer('burst', 200); // 200ms para o primeiro tiro da rajada
      }
    } else {
      // Executando rajada
      if (this.isTimerExpired('burst') && this.currentBurstShots < this.shotsPerBurst) {
        
        this.shoot();
        this.currentBurstShots++;
        
        // Verificar se rajada terminou
        if (this.currentBurstShots >= this.shotsPerBurst) {
          this.isInBurst = false;
          this.burstCount++;
          
          // Só configurar próxima rajada se ainda não completou o limite
          if (this.burstCount < this.maxBursts) {
            this.setTimer('fire', 800); // Próxima rajada em 800ms
          }
        } else {
          // Próximo tiro da mesma rajada em 300ms
          this.setTimer('burst', 300);
        }
      }
    }

    // Verificar se completou todas as rajadas
    if (this.burstCount >= this.maxBursts) {
      this.onCompletedShooting();
    }
  }

  
  public tick(dt: number): void {
    // Chamar atualização base
    this.baseUpdate(dt);
    
    if (this.isDestroyed) return;
    
    // Verificar se saiu da tela
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    
    // Máquina de estados
    switch (this.state) {
      case 'entering':
        // Verificar se entrou na tela
        if (this.y > 50) {
          this.state = 'initial_shooting';
          this.resetShooting();
        } else {
          // Continuar entrando (movimento para baixo)
          this.y += 100 * dt;
          // Manter frame idle durante a entrada
          this.setTexture('enemy-B-frame-1');
        }
        break;
        
      case 'initial_shooting':
        // Executar rajada inicial
        this.handleShooting();
        
        // Verificar se completou o tiro inicial
        if (this.burstCount >= this.maxBursts && !this.hasCompletedInitialShooting) {
          this.hasCompletedInitialShooting = true;
          this.setNextTarget();
          this.state = 'moving_to_position';
        }
        break;
        
      case 'moving_to_position':
        this.moveToTarget(dt);
        break;
        
      case 'position_shooting':
        // Executar rajada na posição
        this.handleShooting();
        
        // Verificar se completou o tiro na posição (será tratado em onCompletedShooting)
        break;
        
      case 'leaving':
        this.moveToTarget(dt);
        // Verificar se saiu da tela
        if (this.y > this.getScreenHeight()) {
          this.destroy();
        }
        break;
    }
  }
  
  
  private onCompletedShooting(): void {
    // Liberar posição atual
    if (this.positionManager) {
      this.positionManager.releasePosition(this.id);
    }
    
    // Resetar estado de animação para garantir transição correta
    this.lastMovingState = false;
    this.animationState = 'idle';
    
    // Resetar contadores para próxima fase
    this.burstCount = 0;
    this.shotsFired = 0;
    this.currentBurstShots = 0;
    this.isInBurst = false;

    // Verificar se ainda pode se mover para mais posições
    if (this.movementCount < this.movementsBeforeLeaving) {
      // Ir para próxima posição
      this.setNextTarget();
      this.state = 'moving_to_position';
    } else {
      // Completou todos os movimentos, sair da tela
      this.setExitTarget();
      this.state = 'leaving';
    }
  }
  
  protected onDestroy(): void {
    super.onDestroy();
    
    // Executa animação de morte e som apenas se foi morto pelo jogador
    if (this.isKilledByPlayer) {
      this.createDeathAnimation();
      AudioManager.getInstance().playSoundEffect('enemy-kill');
    }
    
    // Lógica específica quando o EnemyTypeC é destruído
    const gameScene = this.scene as GameCanvas;
    if (gameScene.releasePosition) {
      gameScene.releasePosition(this.x, this.y);
    }
  }
  
  private createDeathAnimation(): void {
    // Criar sprite de explosão na posição atual
    const explosion = this.scene.add.sprite(this.x, this.y, 'death-frame-1');
    explosion.setScale(0.7);
    explosion.setDepth(10); // Colocar acima de outros elementos
    
    // Criar animação de explosão usando os frames de morte
    const deathFrames = [
      'death-frame-1',
      'death-frame-2', 
      'death-frame-3',
      'death-frame-4',
      'death-frame-5',
      'death-frame-6',
      'death-frame-7',
      'death-frame-8',
      'death-frame-9'
    ];
    
    let currentFrame = 0;
    const frameDelay = 80; // 80ms entre frames
    
    const explosionTimer = this.scene.time.addEvent({
      delay: frameDelay,
      callback: () => {
        if (currentFrame < deathFrames.length) {
          explosion.setTexture(deathFrames[currentFrame]);
          currentFrame++;
        }
        
        // Verificar se a animação terminou após incrementar o frame
        if (currentFrame >= deathFrames.length) {
          // Animação terminou, destruir sprite de explosão
          explosion.destroy();
          explosionTimer.destroy();
        }
      },
      repeat: deathFrames.length // Executar uma vez para cada frame
    });
  }
  
  // Método público para compatibilidade com GameCanvas
  public update(): void {
    this.tick(this.scene.game.loop.delta / 1000);
  }
  
  // Método público para obter sprite (compatibilidade)
  public get sprite(): Phaser.GameObjects.Sprite {
    return this; // this herda de Phaser.Physics.Arcade.Sprite
  }
  
  // Getter público para estado (compatibilidade)
  public get currentState(): string {
    return this.state;
  }
}

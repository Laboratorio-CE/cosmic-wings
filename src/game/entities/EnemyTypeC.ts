import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';
import AudioManager from '../../services/AudioManager';

// Interface para compatibilidade com GameCanvas
interface GameCanvas extends Phaser.Scene {
  findFreePosition: (x: number, y: number) => { x: number; y: number };
  reservePosition: (x: number, y: number, id: string) => void;
  releasePosition: (x: number, y: number) => void;
  enemyBullets: Phaser.Physics.Arcade.Group;
  player: Phaser.Physics.Arcade.Sprite;
}

export default class EnemyTypeC extends AbstractEntity {
  // Estados do inimigo
  public state: 'entering' | 'moving_to_position' | 'shooting' | 'moving' | 'leaving' = 'entering';
  
  // Sistema de disparo
  private fireTimer = 0;
  private fireRate = 800; // 800ms entre tiros
  private currentShots = 0;
  private shotsPerBurstC = 5; // 5 tiros por rajada
  
  // Sistema de movimento
  private moveSpeed = 180;
  private targetX = 0;
  private targetY = 0;
  private cycleCount = 0;
  private maxCycles = 3; // 3 ciclos antes de sair

  // Propriedades de sistema para compatibilidade
  private shotsFired = 0;
  public isKilledByPlayer = false;

  // Sistema de animação de movimento
  private lastMovingState = false;
  private animationState: 'idle' | 'starting' | 'moving' | 'stopping' = 'idle';
  private animationTimer = 0;

  // Getter para sprite (compatibilidade com GameCanvas)
  public get sprite(): Phaser.Physics.Arcade.Sprite {
    return this;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-C-frame-1', undefined, 'EnemyTypeC');
    
    // Stats específicos do Enemy Type C
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 120;
    this.maxSpeed = 200;
    this.points = 500; // Inimigo tipo C dá 500 pontos
    
    // Configurar sprite
    this.setScale(1);
    this.setData('enemyType', 'C');
    this.setData('hp', this.hp);
    
    // Configurar animação
    this.setAnimationFrames([
      'enemy-C-frame-1',
      'enemy-C-frame-2', 
      'enemy-C-frame-3'
    ], 300);
    
    // Definir primeira posição aleatória
    this.setNextPosition();
  }

  private setNextPosition() {
    // Gerar posição aleatória inicial na área de jogo
    const screenWidth = this.getScreenWidth();
    const screenHeight = this.getScreenHeight();
    const preferredX = Phaser.Math.Between(screenWidth * 0.1875, screenWidth * 0.8125); // 150/800 = 0.1875, 650/800 = 0.8125
    const preferredY = Phaser.Math.Between(screenHeight * 0.2, screenHeight * 0.417); // 120/600 = 0.2, 250/600 = 0.417
    
    // Encontrar posição livre
    const gameScene = this.scene as GameCanvas;
    const freePosition = gameScene.findFreePosition(preferredX, preferredY);
    
    this.targetX = freePosition.x;
    this.targetY = freePosition.y;
  }

  private setExitTarget() {
    // Sair pela parte superior da tela
    this.targetX = this.x;
    this.targetY = -100; // Sair pelo topo
  }

  private move() {
    const deltaTime = this.scene.game.loop.delta / 1000;
    
    // Usar método herdado moveTowards
    const hasReached = this.moveTowards(this.targetX, this.targetY, this.moveSpeed, deltaTime);
    
    if (hasReached) {
      this.onReachedTarget();
    }
    
    // Atualizar animação de movimento
    const directionX = this.targetX - this.x;
    this.updateMovementAnimation(directionX);
  }

  private onReachedTarget() {
    switch (this.state) {
      case "moving_to_position": {
        // Chegou na posição inicial, começar a atirar e reservar posição
        this.state = "shooting";
        this.resetShooting();

        const gameScene = this.scene as GameCanvas;
        gameScene.reservePosition(this.x, this.y, this.id);
        break;
      }

      case "moving": {
        // Chegou na nova posição após completar tiros, começar a atirar novamente
        this.state = "shooting";
        this.resetShooting();

        const gameScene = this.scene as GameCanvas;
        gameScene.reservePosition(this.x, this.y, this.id);
        break;
      }

      case "leaving":
        // Saiu da tela
        this.isDestroyed = true;
        // Não marcar isKilledByPlayer como true - inimigo saiu da tela
        break;
    }
  }

  private shoot() {
    // Reproduzir som do tiro do inimigo
    AudioManager.getInstance().playSoundEffect('enemy-fire');
    
    // Obter referência ao grupo de projéteis inimigos da scene
    const gameScene = this.scene as GameCanvas;
    if (!gameScene.enemyBullets) return;
    
    // Capturar posição atual do jogador no momento do disparo
    if (!gameScene.player) return;

    const playerX = gameScene.player.x;
    const playerY = gameScene.player.y;
    
    // Calcular direção para o jogador
    const directionX = playerX - this.x;
    const directionY = playerY - this.y;
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);
    
    // Normalizar direção
    const normalizedX = directionX / distance;
    const normalizedY = directionY / distance;
    
    // Tentar criar projétil
    let bullet = gameScene.enemyBullets.get(this.x, this.y + 20, 'enemy-fire');
    
    // Sistema de fallback para garantir que o projétil seja criado
    if (!bullet) {
      // Limpar projéteis que saíram da tela para liberar espaço no grupo
      gameScene.enemyBullets.children.entries.forEach((child: Phaser.GameObjects.GameObject) => {
        const sprite = child as Phaser.GameObjects.Sprite;
        if (sprite.active && (sprite.y > 650 || sprite.y < -50 || sprite.x < -50 || sprite.x > 850)) {
          sprite.setActive(false).setVisible(false);
        }
      });
      
      // Tentar novamente após limpeza
      bullet = gameScene.enemyBullets.get(this.x, this.y + 20, 'enemy-fire');
    }
    
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
    } else {
      console.warn('Enemy C não conseguiu criar projétil direcionado');
    }
    
    this.currentShots++;
    this.shotsFired++;
  }

  private updateMovementAnimation(directionX: number): void {
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
          this.setTexture('enemy-C-frame-1');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('enemy-C-frame-2');
        } else {
          this.setTexture('enemy-C-frame-3');
          this.animationState = 'moving';
        }
        break;
        
      case 'moving':
        // Manter frame 3 enquanto se move
        this.setTexture('enemy-C-frame-3');
        break;
        
      case 'stopping':
        // Transição: frame 3 -> 2 -> 1
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('enemy-C-frame-3');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('enemy-C-frame-2');
        } else {
          this.setTexture('enemy-C-frame-1');
          this.animationState = 'idle';
        }
        break;
        
      case 'idle':
      default:
        // Manter frame 1 quando parado
        this.setTexture('enemy-C-frame-1');
        break;
    }
    
    // Espelhar sprite baseado na direção apenas quando em movimento
    if (isCurrentlyMoving) {
      this.setFlipX(directionX > 0);
    }
  }
  private resetShooting() {
    this.currentShots = 0;
    this.fireTimer = this.scene.time.now;
    this.setTexture('enemy-C-frame-1'); // Frame de repouso
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
    }
  }

  private createDeathAnimation(): void {
    // Criar sprite de explosão na posição atual
    const explosion = this.scene.add.sprite(this.x, this.y, 'death-frame-1');
    explosion.setScale(0.8);
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

  // Método tick obrigatório herdado de AbstractEntity
  public tick(dt: number): void {
    this.baseUpdate(dt);
    this.update();
  }

  // Método update público para compatibilidade com GameCanvas
  public update() {
    if (this.isDestroyed) return;
    
    const currentTime = this.scene.time.now;
    
    // Máquina de estados
    switch (this.state) {
      case 'entering':
        // Verificar se entrou na tela
        if (this.y > 30) {
          this.state = 'moving_to_position';
        } else {
          // Continuar entrando (movimento para baixo)
          this.y += this.moveSpeed * (this.scene.game.loop.delta / 1000);
        }
        break;
        
      case 'moving_to_position':
      case 'moving':
      case 'leaving':
        this.move();
        break;
        
      case 'shooting':
        this.updateMovementAnimation(0);
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

  // Método adjustForWave para compatibilidade com GameCanvas
  public adjustForWave(wave: number): void {
    // Aumentar pontuação baseada na onda
    this.points = 500 * wave;
    
    // Aumentar shots per burst baseado na onda
    this.shotsPerBurstC = Math.min(8, 5 + Math.floor(wave / 2));
    
    // Aumentar velocidade ligeiramente baseado na onda
    this.speed = Math.min(this.maxSpeed, 120 + (wave * 5));
    this.moveSpeed = Math.min(180, this.moveSpeed + (wave * 3));
    
    console.log(`Enemy C ajustado para onda ${wave}: ${this.shotsPerBurstC} tiros/rajada, ${this.points} pontos`);
  }

  // Hook sobrescrito para quando o inimigo é destruído
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

  // Sobrescrever destroy para compatibilidade
  public destroy(): void {
    if (this.isDestroyed) return;
    
    // Chamar método pai que irá chamar onDestroy
    super.destroy();
  }
}

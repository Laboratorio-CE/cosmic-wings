import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class EnemyTypeA extends AbstractEntity {
  // Estados do inimigo
  public state: 'entering' | 'moving_to_position' | 'shooting' | 'moving_to_next' | 'leaving' = 'entering';
  
  // Sistema de disparo
  private shotsPerBurst: number = 1;
  private maxShotsPerBurst: number = 5;
  private totalShots: number = 6;
  private maxTotalShots: number = 12;
  private shotsFired: number = 0;
  
  // Sistema de movimento
  private targetX = 0;
  private targetY = 0;
  private moveSpeed = 150;
  private movementsBeforeLeaving = 2;
  private maxMovements = 3;
  private hasReachedFirstPosition = false;
  private hasCompletedFirstShooting = false;
  
  // Sistema de disparo com timers
  private burstCount = 0;
  private maxBursts = 2;
  private currentBurstShots = 0;
  private isInBurst = false;
  
  // Referência para o sistema de posições do GameCanvas
  private positionManager: any = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-A-frame-1', undefined, 'enemyA');
    
    // Stats específicos do Enemy Type A
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 200;
    this.maxSpeed = 400;
    this.points = 100; // Inimigo tipo A dá 100 pontos
    
    // Configurar sprite
    this.setScale(0.8);
    this.setData('enemyType', 'A');
    this.setData('hp', this.hp);
    
    // Configurar animação
    this.setAnimationFrames([
      'enemy-A-frame-1',
      'enemy-A-frame-2',
      'enemy-A-frame-3'
    ], 300);
    
    // Obter referência para o sistema de posições
    this.positionManager = (this.scene as any).positionManager;
    
    // Definir primeira posição aleatória na metade superior da tela
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
  
  private setRandomTargetForSecondPosition(): void {
    if (this.positionManager) {
      // Usar o sistema de posições para encontrar uma segunda posição livre
      const position = this.positionManager.getRandomUpperHalfPosition();
      this.targetX = position.x;
      this.targetY = position.y;
    } else {
      // Fallback: Segunda posição também na metade superior, mas diferente da primeira
      const screenWidth = this.scene.cameras.main.width;
      const screenHeight = this.scene.cameras.main.height;
      const minDistance = 80;
      let preferredX: number, preferredY: number;
      
      do {
        preferredX = Phaser.Math.Between(screenWidth * 0.25, screenWidth * 0.75);
        preferredY = Phaser.Math.Between(screenHeight * 0.13, screenHeight * 0.42);
      } while (Phaser.Math.Distance.Between(this.targetX, this.targetY, preferredX, preferredY) < minDistance);
      
      this.targetX = preferredX;
      this.targetY = preferredY;
    }
  }
  
  private setExitTarget(): void {
    // Definir ponto de saída (fora da tela, na parte inferior)
    this.targetX = this.x; // Manter X atual
    this.targetY = 700; // Sair pela parte inferior
  }
  
  private moveToTarget(dt: number): void {
    // Usar o método moveTowards do AbstractEntity
    const reachedTarget = this.moveTowards(this.targetX, this.targetY, this.moveSpeed, dt);
    
    if (reachedTarget) {
      this.onReachedTarget();
    }
    
    // Atualizar animação de movimento baseada na direção
    const directionX = this.targetX - this.x;
    this.updateMovementAnimation(directionX);
  }
  
  private onReachedTarget(): void {
    switch (this.state) {
      case 'moving_to_position': {
        if (!this.hasReachedFirstPosition) {
          // Chegou na primeira posição
          this.hasReachedFirstPosition = true;
          this.state = 'shooting';
          this.resetShooting();
          
          // Reservar a posição no sistema de posições
          if (this.positionManager) {
            this.positionManager.reservePosition(this.x, this.y, this.id);
          }
        }
        break;
      }
        
      case 'moving_to_next': {
        // Chegou na segunda posição
        this.state = 'shooting';
        this.resetShooting();
        
        // Reservar a nova posição no sistema de posições
        if (this.positionManager) {
          this.positionManager.reservePosition(this.x, this.y, this.id);
        }
        break;
      }
        
      case 'leaving':
        // Saiu da tela
        this.destroy();
        break;
    }
  }
  
  private resetShooting(): void {
    this.burstCount = 0;
    this.shotsFired = 0;
    this.currentBurstShots = 0;
    this.isInBurst = false;
    this.setTimer('fire', 800); // 800ms antes da primeira rajada
    this.setTexture('enemy-A-frame-1'); // Frame de repouso
  }
  
  private shoot(): void {
    // Reproduzir som do tiro do inimigo
    this.scene.sound.play('enemy-shoot', { volume: 0.2 });
    
    // Criar projétil usando o sistema de projéteis da scene
    const gameScene = this.scene as any; // GameScene
    if (gameScene.enemyBullets) {
      let bullet = gameScene.enemyBullets.get(this.x, this.y + 30, 'enemy-fire');
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(0.7);
        bullet.setData('speed', 300);
        bullet.setData('damage', 1);
        bullet.setData('isEnemyBullet', true);
      }
    }
    
    this.shotsFired++;
  }
  
  private updateMovementAnimation(directionX: number): void {
    // Atualizar frame baseado na direção do movimento
    if (Math.abs(directionX) > 0.1) {
      // Está se movendo horizontalmente
      const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
      this.setTexture(`enemy-A-frame-${frame}`);
      
      // Espelhar sprite baseado na direção
      this.setFlipX(directionX > 0);
    } else {
      // Movimento apenas vertical ou parado
      this.setTexture('enemy-A-frame-1');
      this.setFlipX(false);
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
        if (this.y > 0) {
          this.state = 'moving_to_position';
        } else {
          // Continuar entrando (movimento para baixo)
          this.y += this.moveSpeed * dt;
        }
        break;
        
      case 'moving_to_position':
      case 'moving_to_next':
      case 'leaving':
        this.moveToTarget(dt);
        break;
        
      case 'shooting':
        this.handleShooting();
        break;
    }
  }
  
  private handleShooting(): void {
    if (!this.isInBurst) {
      // Verificar se é hora de iniciar uma nova rajada
      if (this.isTimerExpired('fire') && this.burstCount < this.maxBursts && this.shotsFired < this.totalShots) {
        this.isInBurst = true;
        this.currentBurstShots = 0;
        this.setTimer('burst', 200); // 200ms para o primeiro tiro da rajada
      } else if (this.burstCount >= this.maxBursts || this.shotsFired >= this.totalShots) {
        // Completou todas as rajadas nesta posição
        this.onCompletedShooting();
      }
    } else {
      // Executando rajada
      if (this.isTimerExpired('burst') && 
          this.currentBurstShots < this.shotsPerBurst && 
          this.shotsFired < this.totalShots) {
        
        this.shoot();
        this.currentBurstShots++;
        
        // Verificar se rajada terminou
        if (this.currentBurstShots >= this.shotsPerBurst) {
          this.isInBurst = false;
          this.burstCount++;
          
          // Só configurar próxima rajada se ainda não completou o limite
          if (this.burstCount < this.maxBursts && this.shotsFired < this.totalShots) {
            this.setTimer('fire', 800); // Próxima rajada em 800ms
          }
        } else {
          // Próximo tiro da mesma rajada em 300ms
          this.setTimer('burst', 300);
        }
      }
    }
  }
  
  private onCompletedShooting(): void {
    // Liberar posição atual
    if (this.positionManager) {
      this.positionManager.releasePosition(this.id);
    }
    
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
  
  protected onDestroy(): void {
    // Liberar posição se ainda estiver reservada
    if (this.positionManager) {
      this.positionManager.releasePosition(this.id);
    }
    
    // Reproduzir som de morte do inimigo
    this.scene.sound.play('enemy-kill', { volume: 0.3 });
    console.log(`EnemyTypeA destroyed! Points: ${this.points}`);
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

import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class EnemyTypeB extends AbstractEntity {
  // Estados do inimigo
  public state: 'entering' | 'initial_shooting' | 'moving_to_position' | 'position_shooting' | 'leaving' = 'entering';
  
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
  private positions: { x: number; y: number }[] = [];
  
  // Sistema de disparo com timers
  private burstCount = 0;
  private maxBursts = 1; // 1 rajada por posição
  private currentBurstShots = 0;
  private isInBurst = false;
  
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
    
    // Configurar animação
    this.setAnimationFrames([
      'enemy-B-frame-1',
      'enemy-B-frame-2',
      'enemy-B-frame-3'
    ], 200);
    
    // Gerar 3 posições aleatórias que o inimigo visitará
    this.generateRandomPositions();
    
    // Começar no estado de entrada (não atirando ainda)
    this.state = 'entering';
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
  
  private generateRandomPositions(): void {
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
    
    // Por enquanto usar posições diretas, implementação futura com sistema de posições livres
    this.positions = basePositions;
    
    // Implementação futura para encontrar posições livres:
    /*
    const gameScene = this.scene as any; // GameScene
    if (gameScene.findFreePosition) {
      this.positions = basePositions.map((pos) => 
        gameScene.findFreePosition(pos.x, pos.y)
      );
    }
    */
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
    // Chegou na posição, mudar para modo de tiro
    this.state = 'position_shooting';
    this.resetShooting();
    
    // Integração futura com sistema de reserva de posições:
    /*
    const gameScene = this.scene as any; // GameScene
    if (gameScene.reservePosition) {
      gameScene.reservePosition(this.x, this.y, this.id);
    }
    */
  }
  
  private setNextTarget(): void {
    if (this.movementCount < this.maxMovements && this.movementCount < this.positions.length) {
      // Usar próxima posição aleatória gerada
      const targetPosition = this.positions[this.movementCount];
      
      this.targetX = targetPosition.x;
      this.targetY = targetPosition.y;
      this.movementCount++;
      
      // Implementação futura para verificar posição livre:
      /*
      const gameScene = this.scene as any; // GameScene
      if (gameScene.findFreePosition) {
        const freePosition = gameScene.findFreePosition(targetPosition.x, targetPosition.y);
        this.targetX = freePosition.x;
        this.targetY = freePosition.y;
      }
      */
    } else {
      // Completou todos os movimentos, sair da tela
      this.targetX = this.x;
      this.targetY = 700; // Sair pela parte inferior
    }
  }
  
  private resetShooting(): void {
    this.burstCount = 0;
    this.shotsFired = 0;
    this.setTimer('fire', 1500); // 1.5 segundos entre rajadas
    this.setTexture('enemy-B-frame-1'); // Frame de repouso
  }
  
  private shoot(): void {
    // Reproduzir som do tiro do inimigo
    this.scene.sound.play('enemy-shoot', { volume: 0.2 });
    
    // Disparar dois projéteis: um a 45° esquerda, outro a 45° direita
    this.shootAngled(-45); // Esquerda
    this.shootAngled(45);  // Direita
    
    this.shotsFired++;
  }
  
  private shootAngled(angleDegrees: number): void {
    // Implementação futura para integração com sistema de projéteis
    console.log(`EnemyTypeB shooting angled projectile at ${angleDegrees}° from position (${this.x}, ${this.y})`);
    
    // Exemplo de como seria a integração:
    /*
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
    */
  }
  
  private updateMovementAnimation(directionX: number): void {
    // Atualizar frame baseado na direção do movimento
    if (Math.abs(directionX) > 0.1) {
      // Está se movendo horizontalmente - alternar entre frames 2 e 3
      const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
      this.setTexture(`enemy-B-frame-${frame}`);
      
      // Espelhar sprite baseado na direção
      // Para movimento à direita, espelhar
      this.setFlipX(directionX > 0);
    } else {
      // Movimento apenas vertical ou parado - usar frame 1
      this.setTexture('enemy-B-frame-1');
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
        if (this.y > 50) {
          this.state = 'initial_shooting';
          this.resetShooting();
        } else {
          // Continuar entrando (movimento para baixo)
          this.y += 100 * dt;
        }
        break;
        
      case 'initial_shooting':
        // Executar rajada inicial
        this.executeShootingBehavior();
        
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
        this.executeShootingBehavior();
        
        // Verificar se completou o tiro na posição
        if (this.burstCount >= this.maxBursts) {
          if (this.movementCount >= this.maxMovements) {
            // Completou todos os movimentos, sair
            this.setNextTarget(); // Define exit point
            this.state = 'leaving';
          } else {
            // Ir para próxima posição
            this.setNextTarget();
            this.state = 'moving_to_position';
          }
        }
        break;
        
      case 'leaving':
        this.moveToTarget(dt);
        // Verificar se saiu da tela
        if (this.y > 650) {
          this.destroy();
        }
        break;
    }
  }
  
  private executeShootingBehavior(): void {
    if (!this.isInBurst) {
      // Verificar se é hora de iniciar uma nova rajada
      if (this.isTimerExpired('fire') && this.burstCount < this.maxBursts) {
        this.isInBurst = true;
        this.currentBurstShots = 0;
        this.setTimer('burst', 400); // 400ms entre tiros da mesma rajada
      } else if (this.burstCount >= this.maxBursts) {
        // Completou o tiro na posição, ir para próxima
        this.onCompletedShooting();
      }
    } else {
      // Executando rajada
      if (this.isTimerExpired('burst') && this.currentBurstShots < this.shotsPerBurst) {
        this.shoot();
        this.currentBurstShots++;
        this.setTimer('burst', 400); // Próximo tiro em 400ms
        
        // Verificar se rajada terminou
        if (this.currentBurstShots >= this.shotsPerBurst) {
          this.isInBurst = false;
          this.burstCount++;
          this.setTimer('fire', 1500); // Próxima rajada em 1.5s
        }
      }
    }
  }
  
  private onCompletedShooting(): void {
    if (this.movementCount < this.maxMovements) {
      this.setNextTarget();
      this.state = 'moving_to_position';
    } else {
      // Completou todos os movimentos, sair da tela
      this.targetX = this.x;
      this.targetY = 700; // Sair pela parte inferior
      this.state = 'leaving';
    }
  }
  
  protected onDestroy(): void {
    // Reproduzir som de morte do inimigo
    this.scene.sound.play('enemy-kill', { volume: 0.3 });
    console.log(`EnemyTypeB destroyed! Points: ${this.points}`);
    
    // Integração futura com sistema de liberação de posições:
    /*
    const gameScene = this.scene as any; // GameScene
    if (gameScene.releasePosition) {
      gameScene.releasePosition(this.id);
    }
    */
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

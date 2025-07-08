import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

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
    const preferredX = Phaser.Math.Between(150, 650);
    const preferredY = Phaser.Math.Between(120, 250);
    
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
    this.scene.sound.play('enemy-shoot', { volume: 0.2 });
    
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

  private updateMovementAnimation(directionX: number) {
    // Atualizar frame baseado na direção do movimento
    if (Math.abs(directionX) > 0.1) {
      // Está se movendo horizontalmente - alternar entre frames 2 e 3
      const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
      this.setTexture(`enemy-C-frame-${frame}`);
      
      // Espelhar sprite baseado na direção
      this.setFlipX(directionX > 0);
    } else {
      // Movimento apenas vertical ou parado - usar frame 1
      this.setTexture('enemy-C-frame-1');
      this.setFlipX(false);
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
    
    // Marcar como morto pelo jogador se não saiu da tela
    if (this.state !== 'leaving') {
      this.isKilledByPlayer = true;
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

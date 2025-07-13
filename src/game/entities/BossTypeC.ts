import Phaser from 'phaser';
import Boss from './Boss';

// Interface para GameScene com as propriedades necessárias
interface GameScene extends Phaser.Scene {
  enemyBullets?: Phaser.GameObjects.Group;
  player?: Phaser.GameObjects.Sprite;
  onBossDefeated?: (points: number) => void;
  currentWave?: number;
  reservePosition?: (x: number, y: number, enemyId: string) => void;
}

export default class BossTypeC extends Boss {
  // Estados do chefe (baseado no Enemy Type C)
  public state: 'entering' | 'moving_to_position' | 'shooting' | 'moving' = 'entering';
  
  // Sistema de disparo
  private fireTimer = 0;
  private fireRate = 300; // 800ms entre tiros
  private currentShots = 0;
  private shotsPerBurstC = 5; // 5 tiros por rajada
  
  // Sistema de movimento
  protected moveSpeed = 180; // Velocidade aumentada
  protected targetX = 0;
  protected targetY = 0;
  protected movementCountC = 0;
  protected maxMovementsPerCycle = 3; // 3 movimentos por ciclo
  private cycleCount = 0;
  private maxCycles = 3; // 3 ciclos antes de sair
  
  // Sistema de dano visual
  private isFlashing = false;
  
  // Sistema de animação de movimento
  private lastMovingState = false;
  private animationState: 'idle' | 'starting' | 'moving' | 'stopping' = 'idle';
  private animationTimer = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Criar um target dummy para o Enemy, mas o boss não precisa usar
    const dummyTarget = scene.add.sprite(400, 550, 'player-frame-1');
    dummyTarget.setVisible(false); // Invisible target
    
    super(scene, x, y, dummyTarget);
    
    // Configurar sprite específico do Boss Type C
    this.setTexture('boss-C-frame-1');
    
    // Stats específicos do Boss Type C
    this.hp = 70;
    this.maxHp = 140;
    this.speed = 180;
    this.maxSpeed = 250;
    this.shotsPerBurst = 5; // 5 tiros por rajada
    this.maxShotsPerBurst = 8;
    this.totalShots = 30; // Será ajustado pela onda
    this.maxTotalShots = 100;
    this.movementsBeforeLeaving = 999; // Nunca vai embora
    this.maxMovements = 999;
    
    // Configurar sprite
    this.setScale(1.5); // Maior que inimigos normais
    this.setData('enemyType', 'BossC');
    this.setData('hp', this.hp);
    this.setData('maxHp', this.maxHp);
    
    // Calcular pontuação baseada na onda
    const gameScene = this.scene as GameScene;
    this.points = 5000 * (gameScene.currentWave || 1);
    
    // Definir primeira posição aleatória
    this.setNextPosition();
    
    console.log(`Boss Type C criado com ${this.hp} HP`);
  }
  
  // Sobrescrever método para calcular pontos baseado na onda
  adjustForWave(wave: number) {
    // Pontuação baseada na onda
    this.points = 5000 * wave;
    
    // Aumentar shots per burst baseado na onda
    this.shotsPerBurstC = Math.min(this.maxShotsPerBurst, 5 + Math.floor(wave / 2));
    
    // Aumentar total shots baseado na onda
    this.totalShots = Math.min(this.maxTotalShots, 30 + (wave * 10));
    
    // Aumentar velocidade ligeiramente baseado na onda
    this.speed = Math.min(this.maxSpeed, 180 + (wave * 5));
    this.moveSpeed = this.speed;
    
    console.log(`Boss C ajustado para onda ${wave}: ${this.shotsPerBurstC} tiros/rajada, ${this.points} pontos`);
  }
  
  private setNextPosition() {
    // Gerar posição aleatória inicial na área de jogo (metade superior da tela)
    const screenWidth = this.getScreenWidth();
    const screenHeight = this.getScreenHeight();
    const preferredX = Phaser.Math.Between(screenWidth * 0.1875, screenWidth * 0.8125); // 150/800 = 0.1875, 650/800 = 0.8125
    const preferredY = Phaser.Math.Between(screenHeight * 0.2, screenHeight * 0.417); // 120/600 = 0.2, 250/600 = 0.417
    
    // Boss não precisa verificar posições ocupadas (ele tem prioridade)
    this.targetX = preferredX;
    this.targetY = preferredY;
  }
  
  move() {
    const deltaTime = this.scene.game.loop.delta / 1000;
    
    // Calcular direção para o alvo
    const directionX = this.targetX - this.x;
    const directionY = this.targetY - this.y;
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);
    
    // Se chegou perto o suficiente do alvo
    if (distance < 10) {
      // Posicionar exatamente no alvo para evitar "vibração"
      this.x = this.targetX;
      this.y = this.targetY;
      this.onReachedTarget();
      return;
    }
    
    // Normalizar direção e aplicar velocidade
    const normalizedX = directionX / distance;
    const normalizedY = directionY / distance;
    
    this.x += normalizedX * this.moveSpeed * deltaTime;
    this.y += normalizedY * this.moveSpeed * deltaTime;
    
    // Atualizar animação de movimento
    this.updateMovementAnimation(directionX);
  }
  
  private onReachedTarget() {
    switch (this.state) {
      case "moving_to_position": {
        // Chegou na posição inicial, começar a atirar e reservar posição
        this.state = "shooting";
        this.resetShooting();

        const gameScene = this.scene as GameScene;
        if (gameScene.reservePosition) {
          gameScene.reservePosition(this.x, this.y, this.id);
        }
        break;
      }

      case "moving": {
        // Chegou na nova posição após completar tiros, começar a atirar novamente
        this.state = "shooting";
        this.resetShooting();

        const gameScene = this.scene as GameScene;
        if (gameScene.reservePosition) {
          gameScene.reservePosition(this.x, this.y, this.id);
        }
        break;
      }
    }
  }
  
  shoot() {
    // Reproduzir som do tiro do boss (volume maior para diferenciá-lo dos inimigos)
    this.scene.sound.play('enemy-shoot', { volume: 0.4 });
    
    // Obter referência ao grupo de projéteis inimigos da scene
    const gameScene = this.scene as GameScene;
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
    
    // Tentar criar projétil do boss
    let bullet = gameScene.enemyBullets.get(this.x, this.y + 40, 'boss-fire');
    
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
      bullet = gameScene.enemyBullets.get(this.x, this.y + 40, 'boss-fire');
    }
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setScale(1.2); // Projéteis do boss são maiores
      
      // Velocidade do projétil direcionado
      const speed = 320;
      const velocityX = normalizedX * speed;
      const velocityY = normalizedY * speed;
      
      bullet.setData('velocityX', velocityX);
      bullet.setData('velocityY', velocityY);
      bullet.setData('damage', 2); // Boss causa mais dano
      bullet.setData('isEnemyBullet', true);
      bullet.setData('isBossBullet', true);
      bullet.setData('isDirected', true); // Marcar como projétil direcionado
    } else {
      console.warn('Boss C não conseguiu criar projétil direcionado');
    }
    
    this.currentShots++;
    this.shotsFired++;
  }
  
  private updateMovementAnimation(directionX: number): void {
    // Verificar se está se movendo (incluindo movimento vertical)
    const directionY = this.targetY - this.y;
    const isCurrentlyMoving = Math.abs(directionX) > 2 || Math.abs(directionY) > 2;
    
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
    
    // Não atualizar animação se estiver em flash
    if (this.isFlashing) return;
    
    // Atualizar animação baseada no estado
    const currentTime = this.scene.time.now;
    
    switch (this.animationState) {
      case 'starting':
        // Transição: frame 1 -> 2 -> 3
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('boss-C-frame-1');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('boss-C-frame-2');
        } else {
          this.setTexture('boss-C-frame-3');
          this.animationState = 'moving';
        }
        break;
        
      case 'moving':
        // Manter frame 3 enquanto se move
        this.setTexture('boss-C-frame-3');
        break;
        
      case 'stopping':
        // Transição: frame 3 -> 2 -> 1
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('boss-C-frame-3');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('boss-C-frame-2');
        } else {
          this.setTexture('boss-C-frame-1');
          this.animationState = 'idle';
        }
        break;
        
      case 'idle':
      default:
        // Manter frame 1 quando parado
        this.setTexture('boss-C-frame-1');
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
    
    // Só mudar textura se não estiver em flash
    if (!this.isFlashing && this.texture.key !== 'boss-C-frame-1') {
      this.setTexture('boss-C-frame-1'); // Frame de repouso
    }
  }
  
  // Sobrescrever método takeDamage para adicionar efeito de flash
  takeDamage(damage: number) {
    this.hp -= damage;
    console.log(`Boss C levou ${damage} de dano. HP restante: ${this.hp}/${this.maxHp}`);
    
    // Ativar efeito de flash
    this.activateFlash();
    
    if (this.hp <= 0) {
      this.destroy();
    }
  }
  
  private activateFlash() {
    if (this.isFlashing) return; // Evitar múltiplos flashes simultâneos
    
    this.isFlashing = true;
    console.log('Boss C piscando!');
    
    // Mudar para cor branca (flash)
    this.setTintFill(0xffffff);
    
    // Voltar à cor normal após 250ms
    this.scene.time.delayedCall(50, () => {
      if (this && !this.isDestroyed) {
        this.clearTint();
        console.log('Flash do boss C terminado');
      }
      this.isFlashing = false;
    });
  }
  
  // Sobrescrever método destroy para múltiplas animações de destruição
  destroy() {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.isKilledByPlayer = true;
    
    // Reproduzir som de morte do boss
    this.scene.sound.play('boss-kill', { volume: 0.5 });
    
    console.log(`Boss Type C destruído! Pontuação: ${this.points}`);
    
    // Fazer o sprite do boss desaparecer imediatamente
    this.setVisible(false);
    
    // Criar 9 animações de destruição: centro + 8 ao redor
    const centerX = this.x;
    const centerY = this.y;
    const offset = 60; // Distância maior para boss maior
    
    // Animação central
    this.createDeathAnimation(centerX, centerY);
    
    // Animações ao redor (com pequeno delay para efeito visual)
    this.scene.time.delayedCall(60, () => {
      this.createDeathAnimation(centerX - offset, centerY - offset); // Superior esquerdo
      this.createDeathAnimation(centerX, centerY - offset); // Superior centro
      this.createDeathAnimation(centerX + offset, centerY - offset); // Superior direito
    });
    
    this.scene.time.delayedCall(120, () => {
      this.createDeathAnimation(centerX - offset, centerY); // Esquerda
      this.createDeathAnimation(centerX + offset, centerY); // Direita
    });
    
    this.scene.time.delayedCall(180, () => {
      this.createDeathAnimation(centerX - offset, centerY + offset); // Inferior esquerdo
      this.createDeathAnimation(centerX, centerY + offset); // Inferior centro
    });
    
    this.scene.time.delayedCall(240, () => {
      this.createDeathAnimation(centerX + offset, centerY + offset, () => {
        // Callback final após todas as animações - iniciar transição de onda
        const gameScene = this.scene as GameScene;
        if (gameScene.onBossDefeated) {
          gameScene.onBossDefeated(this.points);
        }
      });
    });
    
    // Chamar método destroy da classe pai
    super.destroy();
  }
  
  tick(dt: number) {
    // Chamar apenas a atualização base do AbstractEntity, sem o comportamento de movimento do Enemy
    this.baseUpdate(dt);
    
    if (this.isDestroyed) return;
    
    const currentTime = this.scene.time.now;
    
    // Máquina de estados
    switch (this.state) {
      case 'entering':
        // Verificar se entrou na tela o suficiente
        if (this.y > 80) {
          this.state = 'moving_to_position';
        } else {
          // Continuar entrando (movimento para baixo)
          this.y += this.moveSpeed * (dt / 1000);
        }
        break;
        
      case 'moving_to_position':
      case 'moving':
        this.move();
        break;
        
      case 'shooting':
        // Executar comportamento de tiro
        if (currentTime - this.fireTimer > this.fireRate) {
          if (this.currentShots < this.shotsPerBurstC) {
            this.shoot();
            this.fireTimer = currentTime;
          } else {
            // Completou os tiros nesta posição
            this.onCompletedShooting();
          }
        }
        break;
    }
  }
  
  private onCompletedShooting() {
    this.cycleCount++;
    
    // Boss nunca vai embora, sempre continua em ciclos infinitos
    // Reiniciar contador de ciclos quando atingir o máximo
    if (this.cycleCount >= this.maxCycles) {
      this.cycleCount = 0;
    }
    
    // Sempre começar próximo ciclo de movimento
    this.setNextPosition();
    this.state = 'moving';
    this.movementCountC = 0;
  }
  
  // Método update para compatibilidade com GameCanvas
  update() {
    const deltaTime = this.scene.game.loop.delta;
    this.tick(deltaTime);
  }
}

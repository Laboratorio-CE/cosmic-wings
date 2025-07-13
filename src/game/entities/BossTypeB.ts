import Phaser from 'phaser';
import Boss from './Boss';

// Interface para GameScene com as propriedades necessárias
interface GameScene extends Phaser.Scene {
  enemyBullets?: Phaser.GameObjects.Group;
  player?: Phaser.GameObjects.Sprite;
  onBossDefeated?: (points: number) => void;
}

export default class BossTypeB extends Boss {
  // Estados do chefe (baseado no Enemy Type B)
  public state: 'entering' | 'initial_shooting' | 'moving_to_position' | 'position_shooting' | 'moving' = 'entering';
  
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
  private moveSpeed = 100; // Mais lento que o Enemy Type B (150)
  private targetX = 0;
  private targetY = 0;
  public maxMovements = 3; // Mover 3 vezes
  private hasCompletedInitialShooting = false;
  private positions: { x: number; y: number }[] = [];
  private movementCountB = 0;
  
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
    
    // Configurar sprite específico do Boss Type B
    this.setTexture('boss-B-frame-1');
    
    // Stats específicos do Boss Type B
    this.hp = 60;
    this.maxHp = 120;
    this.speed = 100;
    this.maxSpeed = 150;
    this.shotsPerBurst = 3; // 3 tiros por rajada (cada tiro = 3 projéteis)
    this.maxShotsPerBurst = 6;
    this.totalShots = 30; // Será ajustado pela onda
    this.maxTotalShots = 100;
    this.movementsBeforeLeaving = 999; // Nunca vai embora
    this.maxMovements = 999;
    
    // Configurar sprite
    this.setScale(1.5); // Maior que inimigos normais
    this.setData('enemyType', 'BossB');
    this.setData('hp', this.hp);
    this.setData('maxHp', this.maxHp);
    
    // Gerar 3 posições aleatórias que o boss visitará
    this.generateRandomPositions();
    
    // Começar no estado de entrada
    this.state = 'entering';
    
    console.log(`Boss Type B criado com ${this.hp} HP`);
  }
  
  // Sobrescrever método para calcular pontos baseado na onda
  adjustForWave(wave: number) {
    // Pontuação baseada na onda
    this.points = 3000 * wave;
    
    // Aumentar shots per burst baseado na onda
    this.shotsPerBurst = Math.min(this.maxShotsPerBurst, 3 + Math.floor(wave / 2));
    
    // Aumentar total shots baseado na onda
    this.totalShots = Math.min(this.maxTotalShots, 30 + (wave * 10));
    
    // Aumentar velocidade ligeiramente baseado na onda
    this.speed = Math.min(this.maxSpeed, 100 + (wave * 3));
    this.moveSpeed = this.speed;
    
    console.log(`Boss B ajustado para onda ${wave}: ${this.shotsPerBurst} tiros/rajada, ${this.points} pontos`);
  }
  
  private generateRandomPositions() {
    // Gerar 3 posições aleatórias na metade superior da tela (similar ao Enemy B)
    const basePositions = [];
    
    const screenWidth = this.getScreenWidth();
    const screenHeight = this.getScreenHeight();
    
    for (let i = 0; i < 3; i++) {
      let x: number, y: number;
      
      switch (i) {
        case 0:
          // Primeira posição: lado esquerdo a centro-esquerdo
          x = Phaser.Math.Between(screenWidth * 0.1875, screenWidth * 0.4375); // 150/800 = 0.1875, 350/800 = 0.4375
          y = Phaser.Math.Between(screenHeight * 0.2, screenHeight * 0.333); // 120/600 = 0.2, 200/600 = 0.333
          break;
        case 1:
          // Segunda posição: centro-direita a direita
          x = Phaser.Math.Between(screenWidth * 0.5625, screenWidth * 0.8125); // 450/800 = 0.5625, 650/800 = 0.8125
          y = Phaser.Math.Between(screenHeight * 0.233, screenHeight * 0.367); // 140/600 = 0.233, 220/600 = 0.367
          break;
        case 2:
          // Terceira posição: centro da tela
          x = Phaser.Math.Between(screenWidth * 0.375, screenWidth * 0.625); // 300/800 = 0.375, 500/800 = 0.625
          y = Phaser.Math.Between(screenHeight * 0.3, screenHeight * 0.433); // 180/600 = 0.3, 260/600 = 0.433
          break;
        default:
          x = Phaser.Math.Between(screenWidth * 0.25, screenWidth * 0.75); // 200/800 = 0.25, 600/800 = 0.75
          y = Phaser.Math.Between(screenHeight * 0.2, screenHeight * 0.417); // 120/600 = 0.2, 250/600 = 0.417
      }
      
      basePositions.push({ x, y });
    }
    
    // Boss não precisa verificar posições ocupadas (ele tem prioridade)
    this.positions = basePositions;
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
    // Chegou na posição, mudar para modo de tiro
    this.state = 'position_shooting';
    this.resetShooting();
  }
  
  private setNextTarget() {
    if (this.movementCountB < this.maxMovements && this.movementCountB < this.positions.length) {
      // Usar próxima posição aleatória gerada
      const targetPosition = this.positions[this.movementCountB];
      this.targetX = targetPosition.x;
      this.targetY = targetPosition.y;
      this.movementCountB++;
    } else {
      // Completou todos os movimentos, reiniciar ciclo
      this.movementCountB = 0;
      this.generateRandomPositions(); // Gerar novas posições
      const targetPosition = this.positions[this.movementCountB];
      this.targetX = targetPosition.x;
      this.targetY = targetPosition.y;
      this.movementCountB++;
    }
  }
  
  shoot() {
    // Reproduzir som do tiro do boss (volume maior para diferenciá-lo dos inimigos)
    this.scene.sound.play('enemy-shoot', { volume: 0.4 });
    
    // Obter referência ao grupo de projéteis inimigos da scene
    const gameScene = this.scene as GameScene;
    if (!gameScene.enemyBullets) return;
    
    // Disparar três projéteis: central, 45° esquerda, 45° direita
    this.shootTriple();
    
    this.shotsFired++;
  }
  
  private shootTriple() {
    const gameScene = this.scene as GameScene;
    if (!gameScene.enemyBullets) return;
    
    // Projétil central (direção direta para baixo)
    this.shootAngledBoss(0);
    
    // Projétil para esquerda (45°)
    this.shootAngledBoss(-45);
    
    // Projétil para direita (45°)
    this.shootAngledBoss(45);
  }
  
  private shootAngledBoss(angleDegrees: number) {
    const gameScene = this.scene as GameScene;
    if (!gameScene.enemyBullets) return;
    
    // Converter ângulo para radianos
    const angleRadians = (angleDegrees * Math.PI) / 180;
    
    // Calcular posição de origem na borda inferior central do sprite
    // Considerando que o sprite tem scale 1.5 e altura aproximada de 64 pixels
    const spriteHeight = 64 * this.scaleY; // 64 * 1.5 = 96 pixels
    const offsetY = spriteHeight / 2; // Metade da altura para chegar à borda inferior
    
    // Tentar criar projétil do boss na borda inferior central
    // Com sistema de fallback para garantir que o projétil seja criado
    let bullet = gameScene.enemyBullets.get(this.x, this.y + offsetY, 'boss-fire');
    
    // Se não conseguiu obter um projétil, forçar limpeza de projéteis inativos e tentar novamente
    if (!bullet) {
      // Limpar projéteis que saíram da tela para liberar espaço no grupo
      gameScene.enemyBullets.children.entries.forEach((child: Phaser.GameObjects.GameObject) => {
        const sprite = child as Phaser.GameObjects.Sprite;
        if (sprite.active && (sprite.y > 650 || sprite.y < -50 || sprite.x < -50 || sprite.x > 850)) {
          sprite.setActive(false).setVisible(false);
        }
      });
      
      // Tentar novamente após limpeza
      bullet = gameScene.enemyBullets.get(this.x, this.y + offsetY, 'boss-fire');
    }
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setScale(1.2); // Projéteis do boss são maiores
      
      // Calcular velocidade baseada no ângulo
      const speed = 320;
      let velocityX, velocityY;
      
      if (angleDegrees === 0) {
        // Projétil central - movimento direto para baixo
        velocityX = 0;
        velocityY = speed;
      } else {
        // Projéteis angulares
        velocityX = Math.sin(angleRadians) * speed;
        velocityY = Math.cos(angleRadians) * speed;
      }
      
      bullet.setData('velocityX', velocityX);
      bullet.setData('velocityY', velocityY);
      bullet.setData('damage', 2); // Boss causa mais dano
      bullet.setData('isEnemyBullet', true);
      bullet.setData('isBossBullet', true);
      bullet.setData('isAngled', angleDegrees !== 0); // Marcar projéteis angulares
    } else {
      // Se ainda assim não conseguir criar o projétil, registrar o problema
      console.warn(`Boss B não conseguiu criar projétil em ângulo ${angleDegrees}°`);
    }
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
          this.setTexture('boss-B-frame-1');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('boss-B-frame-2');
        } else {
          this.setTexture('boss-B-frame-3');
          this.animationState = 'moving';
        }
        break;
        
      case 'moving':
        // Manter frame 3 enquanto se move
        this.setTexture('boss-B-frame-3');
        break;
        
      case 'stopping':
        // Transição: frame 3 -> 2 -> 1
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('boss-B-frame-3');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('boss-B-frame-2');
        } else {
          this.setTexture('boss-B-frame-1');
          this.animationState = 'idle';
        }
        break;
        
      case 'idle':
      default:
        // Manter frame 1 quando parado
        this.setTexture('boss-B-frame-1');
        break;
    }
    
    // Espelhar sprite baseado na direção apenas quando em movimento
    if (isCurrentlyMoving) {
      this.setFlipX(directionX > 0);
    }
  }
  
  private resetShooting() {
    this.burstCount = 0;
    this.shotsFired = 0;
    this.fireTimer = this.scene.time.now;
    
    // Só mudar textura se não estiver em flash
    if (!this.isFlashing && this.texture.key !== 'boss-B-frame-1') {
      this.setTexture('boss-B-frame-1'); // Frame de repouso
    }
  }
  
  // Sobrescrever método takeDamage para adicionar efeito de flash
  takeDamage(damage: number) {
    this.hp -= damage;
    console.log(`Boss B levou ${damage} de dano. HP restante: ${this.hp}/${this.maxHp}`);
    
    // Ativar efeito de flash
    this.activateFlash();
    
    if (this.hp <= 0) {
      this.destroy();
    }
  }
  
  private activateFlash() {
    if (this.isFlashing) return; // Evitar múltiplos flashes simultâneos
    
    this.isFlashing = true;
    console.log('Boss B piscando!');
    
    // Mudar para cor branca (flash)
    this.setTintFill(0xffffff);
    
    // Voltar à cor normal após 250ms
    this.scene.time.delayedCall(50, () => {
      if (this && !this.isDestroyed) {
        this.clearTint();
        console.log('Flash do boss B terminado');
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
    
    console.log(`Boss Type B destruído! Pontuação: ${this.points}`);
    
    // Fazer o sprite do boss desaparecer imediatamente
    this.setVisible(false);
    
    // Criar 7 animações de destruição: centro + 6 ao redor
    const centerX = this.x;
    const centerY = this.y;
    const offset = 50; // Distância maior para boss maior
    
    // Animação central
    this.createDeathAnimation(centerX, centerY);
    
    // Animações ao redor (com pequeno delay para efeito visual)
    this.scene.time.delayedCall(80, () => {
      this.createDeathAnimation(centerX - offset, centerY - offset); // Superior esquerdo
      this.createDeathAnimation(centerX + offset, centerY - offset); // Superior direito
    });
    
    this.scene.time.delayedCall(160, () => {
      this.createDeathAnimation(centerX - offset, centerY); // Esquerda
      this.createDeathAnimation(centerX + offset, centerY); // Direita
    });
    
    this.scene.time.delayedCall(240, () => {
      this.createDeathAnimation(centerX - offset, centerY + offset); // Inferior esquerdo
    });
    
    this.scene.time.delayedCall(320, () => {
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
    
    // Máquina de estados (baseada no Enemy Type B)
    switch (this.state) {
      case 'entering':
        // Verificar se entrou na tela
        if (this.y > 80) {
          this.state = 'initial_shooting';
          this.resetShooting();
        } else {
          // Continuar entrando (movimento para baixo)
          this.y += 100 * (dt / 1000);
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
          // Boss nunca vai embora, sempre vai para próxima posição
          this.setNextTarget();
          this.state = 'moving_to_position';
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
      } else if (this.burstCount >= this.maxBursts) {
        // Completou o tiro na posição, mover para próxima
        this.setNextTarget();
        this.state = 'moving_to_position';
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
  
  // Método update para compatibilidade com GameCanvas
  update() {
    const deltaTime = this.scene.game.loop.delta;
    this.tick(deltaTime);
  }
}

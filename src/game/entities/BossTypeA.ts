import Phaser from 'phaser';
import Boss from './Boss';
import AudioManager from '../../services/AudioManager';

// Interface para GameScene com as propriedades necessárias
interface GameScene extends Phaser.Scene {
  enemyBullets?: Phaser.GameObjects.Group;
  player?: Phaser.GameObjects.Sprite;
  onBossDefeated?: (points: number) => void;
}

export default class BossTypeA extends Boss {
  // Estados do chefe
  public state: 'entering' | 'moving_to_position' | 'shooting' | 'moving' = 'entering';
  
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
  
  // Sistema de animação de movimento
  private lastMovingState = false;
  private animationState: 'idle' | 'starting' | 'moving' | 'stopping' = 'idle';
  private animationTimer = 0;
  
  constructor(scene: Phaser.Scene, _x: number, _y: number) {
    // Criar um target dummy para o Enemy, mas o boss não precisa usar
    const dummyTarget = scene.add.sprite(400, 550, 'player-frame-1');
    dummyTarget.setVisible(false); // Invisible target
    
    // Boss sempre surge no centro superior da tela, independente dos parâmetros x, y
    const screenWidth = scene.scale.width || 800;
    const centerX = screenWidth / 2;
    const startY = -50; // Começar acima da tela
    
    super(scene, centerX, startY, dummyTarget);
    
    // Configurar sprite específico do Boss Type A
    this.setTexture('boss-A-frame-1');
    
    // Stats específicos do Boss Type A
    this.hp = 50;
    this.maxHp = 50;
    this.speed = 120;
    this.maxSpeed = 200;
    this.shotsPerBurst = 1; // 3 tiros por rajada
    this.maxShotsPerBurst = 3;
    this.totalShots = 30; // Será ajustado pela onda
    this.maxTotalShots = 100;
    this.movementsBeforeLeaving = 999; // Nunca vai embora
    this.maxMovements = 999;
    
    // Configurar sprite
    this.setScale(1.5); // Maior que inimigos normais
    this.setData('enemyType', 'BossA');
    this.setData('hp', this.hp);
    this.setData('maxHp', this.maxHp);
    
    // Definir primeira posição aleatória na metade superior (mas só será usado após entrar na tela)
    this.setRandomTarget();
    

  }
  
  // Método para calcular pontos baseado na onda
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
    

  }
  
  private setRandomTarget() {
    // Posição aleatória na metade superior da tela
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
      case 'moving_to_position':
        // Chegou na primeira posição após entrar na tela
        this.state = 'shooting';
        this.resetShooting();
        this.positionsVisited++;

        break;
        
      case 'moving':
        // Chegou numa nova posição após completar tiros anteriores
        this.state = 'shooting';
        this.resetShooting();
        this.positionsVisited++;

        break;
    }
  }
  
  private resetShooting() {
    this.burstCount = 0;
    this.shotsFired = 0;
    this.fireTimer = this.scene.time.now;
    
    // Só mudar textura se não estiver em flash E se a textura for diferente
    if (!this.isFlashing && this.texture.key !== 'boss-A-frame-1') {
      this.setTexture('boss-A-frame-1'); // Frame de repouso
    }
  }
  
  shoot() {
    // Reproduzir som do tiro do boss (volume maior para diferenciá-lo dos inimigos)
    AudioManager.getInstance().playSoundEffect('enemy-fire');
    
    // Obter referência ao grupo de projéteis inimigos da scene
    const gameScene = this.scene as GameScene;
    if (!gameScene.enemyBullets) return;
    
    // Tentar criar projétil do boss partindo do centro, sempre em linha reta para baixo
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
      bullet.setData('speed', 350); // Velocidade do projétil apenas para baixo
      bullet.setData('damage', 2); // Boss causa mais dano
      bullet.setData('isEnemyBullet', true);
      bullet.setData('isBossBullet', true); // Identificar como projétil de boss
      // Garantir que não tem flags de movimento angular
      bullet.setData('isAngled', false);
      bullet.setData('isDirected', false);
    } else {
      console.warn('Boss A não conseguiu criar projétil');
    }
    
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
          this.setTexture('boss-A-frame-1');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('boss-A-frame-2');
        } else {
          this.setTexture('boss-A-frame-3');
          this.animationState = 'moving';
        }
        break;
        
      case 'moving':
        // Manter frame 3 enquanto se move
        this.setTexture('boss-A-frame-3');
        break;
        
      case 'stopping':
        // Transição: frame 3 -> 2 -> 1
        if (currentTime - this.animationTimer < 150) {
          this.setTexture('boss-A-frame-3');
        } else if (currentTime - this.animationTimer < 300) {
          this.setTexture('boss-A-frame-2');
        } else {
          this.setTexture('boss-A-frame-1');
          this.animationState = 'idle';
        }
        break;
        
      case 'idle':
      default:
        // Manter frame 1 quando parado
        this.setTexture('boss-A-frame-1');
        break;
    }
    
    // Espelhar sprite baseado na direção apenas quando em movimento
    if (isCurrentlyMoving) {
      this.setFlipX(directionX > 0);
    }
  }
  
  // Sobrescrever método takeDamage para adicionar efeito de flash
  takeDamage(damage: number) {
    this.hp -= damage;

    
    // Ativar efeito de flash
    this.activateFlash();
    
    if (this.hp <= 0) {
      this.destroy();
    }
  }
  
  private activateFlash() {
    if (this.isFlashing) return; // Evitar múltiplos flashes simultâneos
    
    this.isFlashing = true;
    
    // Mudar para cor branca (flash) - usando tint mais intenso
    this.setTintFill(0xffffff);
    
    // Voltar à cor normal após 250ms (aumentado ainda mais para melhor visibilidade)
    this.scene.time.delayedCall(50, () => {
      if (this && !this.isDestroyed) {
        this.clearTint();

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
    AudioManager.getInstance().playSoundEffect('boss-kill');
    

    
    // Fazer o sprite do boss desaparecer imediatamente
    this.setVisible(false);
    
    // Criar 5 animações de destruição: centro + 4 cantos
    const centerX = this.x;
    const centerY = this.y;
    const offset = 40; // Distância dos cantos em relação ao centro
    
    // Criar animações de destruição usando a funcionalidade do AbstractEntity
    this.createDeathAnimation(centerX, centerY);
    
    // Animações nos cantos (com pequeno delay para efeito visual)
    this.scene.time.delayedCall(100, () => {
      this.createDeathAnimation(centerX - offset, centerY - offset); // Superior esquerdo
    });
    
    this.scene.time.delayedCall(200, () => {
      this.createDeathAnimation(centerX + offset, centerY - offset); // Superior direito
    });
    
    this.scene.time.delayedCall(300, () => {
      this.createDeathAnimation(centerX - offset, centerY + offset); // Inferior esquerdo
    });
    
    this.scene.time.delayedCall(400, () => {
      this.createDeathAnimation(centerX + offset, centerY + offset); // Última animação
      
      // Callback final após todas as animações - iniciar transição de onda
      const gameScene = this.scene as GameScene;
      if (gameScene.onBossDefeated) {
        gameScene.onBossDefeated(this.points);
      }
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
        // Boss entra descendo pelo centro da tela
        this.y += this.moveSpeed * (dt / 1000);
        
        // Verificar se entrou na tela o suficiente (cerca de 1/6 da altura da tela)
        const screenHeight = this.getScreenHeight();
        if (this.y >= screenHeight * 0.167) { // ~100px numa tela de 600px
          this.state = 'moving_to_position';
  
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
  
  // Método update para compatibilidade com GameCanvas
  update() {
    const deltaTime = this.scene.game.loop.delta;
    this.tick(deltaTime);
  }
}

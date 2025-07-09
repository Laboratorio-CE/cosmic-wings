import Phaser from 'phaser';
import Boss from './Boss';

// Interface para GameScene com as propriedades necessárias
interface GameScene extends Phaser.Scene {
  enemyBullets?: Phaser.GameObjects.Group;
  player?: Phaser.GameObjects.Sprite;
  onBossDefeated?: (points: number) => void;
}

export default class BossTypeA extends Boss {
  // Estados do chefe
  public state: 'entering' | 'moving_to_position' | 'shooting' | 'moving' | 'leaving' = 'entering';
  
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
    // Criar um target dummy para o Enemy, mas o boss não precisa usar
    const dummyTarget = scene.add.sprite(400, 550, 'player-frame-1');
    dummyTarget.setVisible(false); // Invisible target
    
    super(scene, x, y, dummyTarget);
    
    // Configurar sprite específico do Boss Type A
    this.setTexture('boss-A-frame-1');
    
    // Stats específicos do Boss Type A
    this.hp = 50;
    this.maxHp = 100;
    this.speed = 120;
    this.maxSpeed = 200;
    this.shotsPerBurst = 3; // 3 tiros por rajada
    this.maxShotsPerBurst = 7;
    this.totalShots = 30; // Será ajustado pela onda
    this.maxTotalShots = 100;
    this.movementsBeforeLeaving = 999; // Nunca vai embora
    this.maxMovements = 999;
    
    // Configurar sprite
    this.setScale(1.5); // Maior que inimigos normais
    this.setData('enemyType', 'BossA');
    this.setData('hp', this.hp);
    this.setData('maxHp', this.maxHp);
    
    // Definir primeira posição aleatória na metade superior
    this.setRandomTarget();
    
    console.log(`Boss Type A criado com ${this.hp} HP`);
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
    const directionX = this.targetX - this.x;
    const directionY = this.targetY - this.y;
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);
    
    // Se chegou perto o suficiente do alvo
    if (distance < 15) {
      this.onReachedTarget();
      return;
    }
    
    // Normalizar direção e aplicar velocidade
    const normalizedX = directionX / distance;
    const normalizedY = directionY / distance;
    
    this.x += normalizedX * this.moveSpeed * deltaTime;
    this.y += normalizedY * this.moveSpeed * deltaTime;
    
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
    
    // Só mudar textura se não estiver em flash E se a textura for diferente
    if (!this.isFlashing && this.texture.key !== 'boss-A-frame-1') {
      this.setTexture('boss-A-frame-1'); // Frame de repouso
    }
  }
  
  shoot() {
    // Reproduzir som do tiro do boss (volume maior para diferenciá-lo dos inimigos)
    this.scene.sound.play('enemy-shoot', { volume: 0.4 });
    
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
  
  private updateMovementAnimation(directionX: number) {
    // Atualizar frame baseado na direção do movimento (apenas se não estiver em flash)
    if (this.isFlashing) return;
    
    if (Math.abs(directionX) > 0.1) {
      // Está se movendo horizontalmente
      const frame = (this.scene.time.now % 600 < 300) ? 2 : 3;
      const newTexture = `boss-A-frame-${frame}`;
      
      // Só mudar textura se for diferente da atual
      if (this.texture.key !== newTexture) {
        this.setTexture(newTexture);
      }
      
      // Espelhar sprite baseado na direção
      this.setFlipX(directionX > 0);
    } else {
      // Movimento apenas vertical ou parado
      if (this.texture.key !== 'boss-A-frame-1') {
        this.setTexture('boss-A-frame-1');
      }
      this.setFlipX(false);
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
    console.log('Boss piscando!'); // Debug temporário
    
    // Mudar para cor branca (flash) - usando tint mais intenso
    this.setTintFill(0xffffff);
    
    // Voltar à cor normal após 250ms (aumentado ainda mais para melhor visibilidade)
    this.scene.time.delayedCall(50, () => {
      if (this && !this.isDestroyed) {
        this.clearTint();
        console.log('Flash do boss terminado'); // Debug temporário
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
    
    console.log(`Boss Type A destruído! Pontuação: ${this.points}`);
    
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
    // Chamar tick da classe pai
    super.tick(dt);
    
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

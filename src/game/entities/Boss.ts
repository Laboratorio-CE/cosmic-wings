import Phaser from 'phaser';
import Enemy from './Enemy';

export default class Boss extends Enemy {
  // Sistema de tiro
  public shotsPerBurst: number = 3;
  public maxShotsPerBurst: number = 10;
  public totalShots: number = 30;
  public maxTotalShots: number = 100;
  public shotsFired: number = 0;
  public movementsBeforeLeaving: number = 5;
  public maxMovements: number = 10;
  public isKilledByPlayer: boolean = false;
  
  private flashEffect = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, target);
    
    // Sobrescrever propriedades para o boss
    this.hp = 30;
    this.maxHp = 30;
    this.speed = 80; // Boss mais lento
    this.maxSpeed = 120;
    this.points = 1000; // Boss dá muito mais pontos
    
    // Configurar scale maior para o boss
    this.setScale(1.5);
    
    // Configurar animação do boss
    this.setAnimationFrames([
      'boss-A-frame-1',
      'boss-A-frame-2', 
      'boss-A-frame-3'
    ], 300); // Animação mais lenta para o boss
  }

  protected onTakeDamage(damage: number): void {
    super.onTakeDamage(damage);
    
    // Efeito de flash quando o boss toma dano
    this.flashEffect = true;
    this.setTintFill(0xff0000); // Vermelho
    
    // Remover o flash depois de um tempo
    this.setTimer('flash', 100);
  }
  
  tick(dt: number): void {
    super.tick(dt);
    
    // Atualizar efeito de flash
    if (this.flashEffect && this.isTimerExpired('flash')) {
      this.flashEffect = false;
      this.clearTint();
    }
  }
  
  protected onDestroy(): void {
    // Reproduzir som de morte do boss
    this.scene.sound.play('boss-kill', { volume: 0.5 });
    console.log(`Boss destroyed! Points: ${this.points}`);
  }
  
  /** Método para criar animação de destruição */
  protected createDeathAnimation(x: number, y: number, onComplete?: () => void): void {
    // Criar sprite da animação de destruição
    const deathSprite = this.scene.add.sprite(x, y, 'death-frame-1');
    deathSprite.setScale(0.8);
    
    // Executar animação sequencial
    let currentFrame = 1;
    
    const nextFrame = () => {
      if (currentFrame <= 9) {
        deathSprite.setTexture(`death-frame-${currentFrame}`);
        currentFrame++;
        
        // Próximo frame após 80ms
        this.scene.time.delayedCall(80, nextFrame);
      } else {
        // Animação concluída
        deathSprite.destroy();
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    nextFrame();
  }
}
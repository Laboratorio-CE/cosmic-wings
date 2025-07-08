import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class Enemy extends AbstractEntity {
  private readonly enemySpeed = 120;
  private readonly target: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, 'enemy', undefined, 'enemy');
    
    this.target = target;
    
    // Configurações específicas do inimigo
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 120;
    this.maxSpeed = 200;
    this.points = 100; // Pontos que o inimigo dá quando destruído
    
    // Configurar animação se houver frames
    this.setAnimationFrames([
      'enemy-frame-1',
      'enemy-frame-2', 
      'enemy-frame-3'
    ], 200);
  }

  tick(dt: number) {
    // Chamar atualização base
    this.baseUpdate(dt);
    
    if (this.isDestroyed) return;
    
    // Verificar se saiu da tela
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    
    // Mover em direção ao alvo
    this.scene.physics.moveToObject(this, this.target, this.enemySpeed);
  }
  
  protected onDestroy(): void {
    // Reproduzir som de morte do inimigo
    this.scene.sound.play('enemy-kill', { volume: 0.3 });
    console.log(`Enemy destroyed! Points: ${this.points}`);
  }
}
import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class Player extends AbstractEntity {
  readonly speed = 220;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player', undefined, 'player');
    
    // Configurações específicas do player
    this.hp = 3;
    this.maxHp = 3;
    this.speed = 220;
    this.maxSpeed = 300;
    
    // Configurar animação do player
    this.setAnimationFrames([
      'player-frame-1',
      'player-frame-2', 
      'player-frame-3'
    ], 150);
    
    this.setCollideWorldBounds(true);
  }

  tick(dt: number) {
    // Chamar atualização base
    this.baseUpdate(dt);
    
    if (this.isDestroyed) return;
    
    // Controle de movimento
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    const vx = (cursors.left?.isDown ? -1 : 0) + (cursors.right?.isDown ? 1 : 0);
    const vy = (cursors.up?.isDown ? -1 : 0) + (cursors.down?.isDown ? 1 : 0);
    
    this.setVelocity(vx * this.speed, vy * this.speed);
  }
  
  protected onTakeDamage(damage: number): void {
    // Aplicar efeito visual ou sonoro quando o player toma dano

    
    // Tornar invulnerável por um curto período
    this.makeInvulnerable(1000); // 1 segundo de invulnerabilidade
  }
  
  protected onDestroy(): void {
    // Reproduzir som de morte do player
    this.scene.sound.play('player-kill', { volume: 0.5 });

  }
}

import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class Player extends AbstractEntity {
  readonly speed = 220;
  private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;

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
    
    // Inicializar suporte a gamepad
    this.initGamepad();
  }
  
  private initGamepad() {
    // Habilitar gamepads no Phaser
    if (this.scene.input.gamepad) {
      this.scene.input.gamepad.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
        this.gamepad = pad;
        console.log('Gamepad conectado:', pad.id);
      });
      
      // Verificar se já existe um gamepad conectado
      if (this.scene.input.gamepad.total > 0) {
        this.gamepad = this.scene.input.gamepad.getPad(0);
      }
    }
  }

  tick(dt: number) {
    // Chamar atualização base
    this.baseUpdate(dt);
    
    if (this.isDestroyed) return;
    
    // Controle de movimento com teclado
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    let vx = (cursors.left?.isDown ? -1 : 0) + (cursors.right?.isDown ? 1 : 0);
    let vy = (cursors.up?.isDown ? -1 : 0) + (cursors.down?.isDown ? 1 : 0);
    
    // Adicionar controle de gamepad
    if (this.gamepad) {
      // Direcional D-Pad
      if (this.gamepad.left) vx = -1;
      if (this.gamepad.right) vx = 1;
      if (this.gamepad.up) vy = -1;
      if (this.gamepad.down) vy = 1;
      
      // Analógico esquerdo (com deadzone)
      const deadzone = 0.2;
      const leftStickX = this.gamepad.leftStick.x;
      const leftStickY = this.gamepad.leftStick.y;
      
      if (Math.abs(leftStickX) > deadzone) {
        vx = leftStickX;
      }
      if (Math.abs(leftStickY) > deadzone) {
        vy = leftStickY;
      }
    }
    
    this.setVelocity(vx * this.speed, vy * this.speed);
  }
  
  protected onTakeDamage(): void {
    // Aplicar efeito visual ou sonoro quando o player toma dano

    
    // Tornar invulnerável por um curto período
    this.makeInvulnerable(1000); // 1 segundo de invulnerabilidade
  }
  
  protected onDestroy(): void {
    // Reproduzir som de morte do player
    this.scene.sound.play('player-kill', { volume: 0.5 });

  }
}

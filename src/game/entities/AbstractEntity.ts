/* eslint-disable @typescript-eslint/no-unused-vars */
import Phaser from 'phaser';

export default abstract class AbstractEntity extends Phaser.Physics.Arcade.Sprite {
  // Propriedades básicas de identificação
  public readonly id: string;
  public readonly entityType: string;
  
  // Sistema de vida e dano
  public hp: number;
  public maxHp: number;
  public isDestroyed: boolean = false;
  public isInvulnerable: boolean = false;
  public isKilledByPlayer: boolean = false; // Para tracking se foi morto pelo jogador ou saiu da tela
  
  // Sistema de movimento
  public speed: number;
  public maxSpeed: number;
  
  // Sistema de pontuação (para inimigos principalmente)
  public points: number = 0;
  
  // Sistema de animação
  public animationFrames: string[] = [];
  public currentFrame: number = 0;
  public animationSpeed: number = 100; // ms entre frames
  public lastAnimationTime: number = 0;
  
  // Sistema de timers
  protected timers: Map<string, number> = new Map();
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
    entityType: string = 'entity'
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(1);
    
    // Gerar ID único
    this.id = `${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.entityType = entityType;
    
    // Valores padrão
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 100;
    this.maxSpeed = 300;
  }

  /** Atualização obrigatória dos filhos */
  public abstract tick(dt: number): void;
  
  /** Método para receber dano */
  public takeDamage(damage: number): void {
    if (this.isDestroyed || this.isInvulnerable) return;
    
    this.hp -= damage;
    this.onTakeDamage(damage);
    
    if (this.hp <= 0) {
      this.destroy();
    }
  }
  
  /** Hook chamado quando a entidade recebe dano */
  protected onTakeDamage(_damage: number): void {
    // Implementação padrão vazia - pode ser sobrescrita pelas subclasses
  }
  
  /** Método para destruir a entidade */
  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.onDestroy();
    
    // Limpar timers
    this.timers.clear();
    
    // Destruir sprite do Phaser
    super.destroy();
  }
  
  /** Hook chamado quando a entidade é destruída */
  protected onDestroy(): void {
    // Implementação padrão vazia - pode ser sobrescrita pelas subclasses
  }
  
  /** Sistema de timers para controle de tempo */
  protected setTimer(name: string, duration: number): void {
    this.timers.set(name, this.scene.time.now + duration);
  }
  
  protected isTimerExpired(name: string): boolean {
    const expireTime = this.timers.get(name);
    if (!expireTime) return true;
    
    if (this.scene.time.now >= expireTime) {
      this.timers.delete(name);
      return true;
    }
    
    return false;
  }
  
  protected clearTimer(name: string): void {
    this.timers.delete(name);
  }
  
  /** Sistema de animação básico */
  protected updateAnimation(_dt: number): void {
    if (this.animationFrames.length <= 1) return;
    
    if (this.scene.time.now - this.lastAnimationTime >= this.animationSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.animationFrames.length;
      this.setTexture(this.animationFrames[this.currentFrame]);
      this.lastAnimationTime = this.scene.time.now;
    }
  }
  
  /** Configurar frames de animação */
  protected setAnimationFrames(frames: string[], speed: number = 100): void {
    this.animationFrames = frames;
    this.animationSpeed = speed;
    this.currentFrame = 0;
    this.lastAnimationTime = this.scene.time.now;
    
    if (frames.length > 0) {
      this.setTexture(frames[0]);
    }
  }
  
  /** Verificar se a entidade está fora dos limites da tela */
  protected isOutOfBounds(margin: number = 50): boolean {
    return (
      this.x < -margin ||
      this.x > this.scene.cameras.main.width + margin ||
      this.y < -margin ||
      this.y > this.scene.cameras.main.height + margin
    );
  }
  
  /** Mover em direção a um alvo */
  protected moveTowards(targetX: number, targetY: number, speed: number, dt: number): boolean {
    const directionX = targetX - this.x;
    const directionY = targetY - this.y;
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);
    
    // Se chegou perto o suficiente do alvo
    if (distance < 10) {
      this.x = targetX;
      this.y = targetY;
      return true;
    }
    
    // Normalizar direção e aplicar velocidade
    const normalizedX = directionX / distance;
    const normalizedY = directionY / distance;
    
    this.x += normalizedX * speed * dt;
    this.y += normalizedY * speed * dt;
    
    return false;
  }
  
  /** Aplicar efeito de invulnerabilidade temporária */
  protected makeInvulnerable(duration: number): void {
    this.isInvulnerable = true;
    this.setTimer('invulnerability', duration);
  }
  
  /** Atualizar estado de invulnerabilidade */
  protected updateInvulnerability(): void {
    if (this.isInvulnerable && this.isTimerExpired('invulnerability')) {
      this.isInvulnerable = false;
    }
  }
  
  /** Atualização base que deve ser chamada por todas as subclasses */
  protected baseUpdate(dt: number): void {
    if (this.isDestroyed) return;
    
    this.updateAnimation(dt);
    this.updateInvulnerability();
  }
}

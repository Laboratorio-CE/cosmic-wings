import Phaser from 'phaser';

interface OccupiedPosition {
  x: number;
  y: number;
  enemyId: string;
}

export default class PositionManager {
  private occupiedPositions: OccupiedPosition[] = [];
  private positionRadius: number = 60; // Raio mínimo entre inimigos parados
  private screenWidth: number;
  private screenHeight: number;
  
  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }
  
  /**
   * Reserva uma posição ocupada por um inimigo
   */
  public reservePosition(x: number, y: number, enemyId: string): void {
    this.occupiedPositions.push({ x, y, enemyId });
  }
  
  /**
   * Libera uma posição ocupada por um inimigo
   */
  public releasePosition(enemyId: string): void {
    this.occupiedPositions = this.occupiedPositions.filter(
      (pos) => pos.enemyId !== enemyId
    );
  }
  
  /**
   * Encontra uma posição livre próxima de (x, y) que não esteja ocupada
   */
  public findFreePosition(preferredX: number, preferredY: number): { x: number; y: number } {
    const radius = this.positionRadius;
    let tryCount = 0;
    let found = false;
    let newX = preferredX;
    let newY = preferredY;
    
    // Tentar encontrar uma posição livre até 20 tentativas
    while (!found && tryCount < 20) {
      found = true;
      for (const pos of this.occupiedPositions) {
        const dist = Phaser.Math.Distance.Between(newX, newY, pos.x, pos.y);
        if (dist < radius) {
          found = false;
          break;
        }
      }
      
      if (!found) {
        // Tentar uma nova posição aleatória próxima
        newX = Phaser.Math.Clamp(
          preferredX + Phaser.Math.Between(-radius, radius),
          this.getMinX(),
          this.getMaxX()
        );
        newY = Phaser.Math.Clamp(
          preferredY + Phaser.Math.Between(-radius, radius),
          this.getMinY(),
          this.getMaxY()
        );
        tryCount++;
      }
    }
    
    return { x: newX, y: newY };
  }
  
  /**
   * Gera uma posição aleatória na metade superior da tela
   */
  public getRandomUpperHalfPosition(): { x: number; y: number } {
    const x = Phaser.Math.Between(this.getMinX(), this.getMaxX());
    const y = Phaser.Math.Between(this.getMinY(), this.getUpperHalfMaxY());
    
    return this.findFreePosition(x, y);
  }
  
  /**
   * Gera uma posição aleatória em qualquer lugar da área de jogo (exceto muito próximo das bordas)
   */
  public getRandomPosition(): { x: number; y: number } {
    const x = Phaser.Math.Between(this.getMinX(), this.getMaxX());
    const y = Phaser.Math.Between(this.getMinY(), this.getMaxY());
    
    return this.findFreePosition(x, y);
  }
  
  /**
   * Limpa todas as posições ocupadas
   */
  public clearAllPositions(): void {
    this.occupiedPositions = [];
  }
  
  /**
   * Retorna a coordenada X mínima válida (com margem)
   */
  private getMinX(): number {
    return this.screenWidth * 0.25; // 25% da largura da tela
  }
  
  /**
   * Retorna a coordenada X máxima válida (com margem)
   */
  private getMaxX(): number {
    return this.screenWidth * 0.75; // 75% da largura da tela
  }
  
  /**
   * Retorna a coordenada Y mínima válida (com margem)
   */
  private getMinY(): number {
    return this.screenHeight * 0.13; // ~80px em uma tela de 600px
  }
  
  /**
   * Retorna a coordenada Y máxima válida (com margem)
   */
  private getMaxY(): number {
    return this.screenHeight * 0.83; // ~500px em uma tela de 600px
  }
  
  /**
   * Retorna a coordenada Y máxima para a metade superior da tela
   */
  private getUpperHalfMaxY(): number {
    return this.screenHeight * 0.42; // ~250px em uma tela de 600px
  }
  
  /**
   * Atualiza as dimensões da tela
   */
  public updateScreenDimensions(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }
  
  /**
   * Define o raio mínimo entre posições
   */
  public setPositionRadius(radius: number): void {
    this.positionRadius = radius;
  }
  
  /**
   * Retorna o número de posições ocupadas
   */
  public getOccupiedPositionsCount(): number {
    return this.occupiedPositions.length;
  }
  
  /**
   * Verifica se uma posição específica está ocupada
   */
  public isPositionOccupied(x: number, y: number, tolerance: number = 10): boolean {
    return this.occupiedPositions.some(pos => 
      Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < tolerance
    );
  }
}

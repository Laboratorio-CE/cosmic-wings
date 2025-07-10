export default class ScoreSystem {
  private currentScore: number = 0;
  private hiScore: number = 0;
  private onScoreUpdateCallback?: (score: number, hiScore: number) => void;

  constructor(onScoreUpdate?: (score: number, hiScore: number) => void) {
    this.onScoreUpdateCallback = onScoreUpdate;
  }

  /**
   * Adiciona pontos ao score atual
   * @param points - Quantidade de pontos a serem adicionados
   */
  public addScore(points: number): void {
    if (points <= 0) return;

    this.currentScore += points;
    this.hiScore += points;

    console.log(`Pontos adicionados: ${points}. Score atual: ${this.currentScore}, HiScore: ${this.hiScore}`);

    // Chamar callback para atualizar a UI
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(this.currentScore, this.hiScore);
    }
  }

  /**
   * Adiciona pontos quando um inimigo é destruído pelo jogador
   * @param entity - A entidade destruída (para obter os pontos)
   */
  public addScoreForEnemyKilled(entity: { points: number; entityType: string }): void {
    console.log(`${entity.entityType} destruído! Pontos: ${entity.points}`);
    this.addScore(entity.points);
  }

  /**
   * Adiciona pontos quando um boss é derrotado
   * @param points - Quantidade de pontos do boss
   */
  public addScoreForBossDefeated(points: number): void {
    console.log(`Boss derrotado! Pontos: ${points}`);
    this.addScore(points);
  }

  /**
   * Obtém o score atual
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Obtém o hi-score
   */
  public getHiScore(): number {
    return this.hiScore;
  }

  /**
   * Reseta o score atual (mantém o hi-score como acumulador)
   */
  public resetCurrentScore(): void {
    this.currentScore = 0;
    
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(this.currentScore, this.hiScore);
    }
  }

  /**
   * Reseta todo o sistema de pontuação
   */
  public resetAll(): void {
    this.currentScore = 0;
    this.hiScore = 0;
    
    if (this.onScoreUpdateCallback) {
      this.onScoreUpdateCallback(this.currentScore, this.hiScore);
    }
  }

  /**
   * Define o callback para atualização de score
   */
  public setOnScoreUpdateCallback(callback: (score: number, hiScore: number) => void): void {
    this.onScoreUpdateCallback = callback;
  }
}
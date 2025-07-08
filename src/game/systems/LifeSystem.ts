export default class LifeSystem {
    private lives: number;
  
    constructor(initialLives = 3) {
      this.lives = initialLives;
    }
  
    loseLife() {
      this.lives = Math.max(0, this.lives - 1);
    }
  
    addLife() {
      this.lives += 1;
    }
  
    get value() {
      return this.lives;
    }
  }
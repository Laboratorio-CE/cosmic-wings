import SpawnSystem from './SpawnSystem';
import Boss from '../entities/Boss';

export default class WaveManager {
  private wave = 1;
  private readonly spawnSys: SpawnSystem;

  constructor(spawnSys: SpawnSystem) {
    this.spawnSys = spawnSys;
  }

  next(target: Phaser.GameObjects.Sprite) {
    this.wave += 1;

    // a cada 5 ondas → boss
    if (this.wave % 5 === 0) {
      this.spawnSys.spawn(400, -50, target); // minion antes do boss
      this.spawnSys.group.add(new Boss(target.scene, 400, -100, target));
      return;
    }

    // dificuldade progressiva
    for (let i = 0; i < this.wave * 2; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(-150, -50);
      this.spawnSys.spawn(x, y, target);
    }
  }

  get current() {
    return this.wave;
  }
}
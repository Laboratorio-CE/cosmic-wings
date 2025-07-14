import Phaser from 'phaser';
import Enemy from '../entities/Enemy';

export default class SpawnSystem {
  private scene: Phaser.Scene;
  private enemies: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enemies = this.scene.add.group();
  }

  spawn(x: number, y: number, target: Phaser.GameObjects.Sprite) {
    const enemy = new Enemy(this.scene, x, y, target);
    this.enemies.add(enemy);
  }

  get group() {
    return this.enemies;
  }
}
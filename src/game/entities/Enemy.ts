import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class Enemy extends AbstractEntity {
  private readonly speed = 120;
  private readonly target: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, 'enemy');
    this.target = target;
  }

  tick() {
    this.scene.physics.moveToObject(this, this.target, this.speed);
  }
}
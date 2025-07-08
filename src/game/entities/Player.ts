/* eslint-disable @typescript-eslint/no-unused-vars */
import Phaser from 'phaser';
import AbstractEntity from './AbstractEntity';

export default class Player extends AbstractEntity {
  readonly speed = 220;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    this.setCollideWorldBounds(true);
  }

  tick(dt: number) {
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    const vx =
      (cursors.left?.isDown ? -1 : 0) + (cursors.right?.isDown ? 1 : 0);
    const vy =
      (cursors.up?.isDown ? -1 : 0) + (cursors.down?.isDown ? 1 : 0);
    this.setVelocity(vx * this.speed, vy * this.speed);
  }
}

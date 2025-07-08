/* eslint-disable @typescript-eslint/no-unused-vars */
import Phaser from 'phaser';
import Enemy from './Enemy';

export default class Boss extends Enemy {
  private hp = 30;

  takeDamage(dmg: number) {
    this.hp -= dmg;
    if (this.hp <= 0) this.destroy();
  }
}
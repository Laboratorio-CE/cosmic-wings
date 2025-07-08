import Phaser from 'phaser';

export default abstract class AbstractEntity extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(1);
  }

  /** Atualização obrigatória dos filhos */
  public abstract tick(dt: number): void;
}

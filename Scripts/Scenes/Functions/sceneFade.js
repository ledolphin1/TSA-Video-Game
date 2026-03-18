import * as Phaser from "phaser";

export function setupSceneFade(scene, options = {}) {
  const duration = options.duration ?? 350;
  const pauseGameplay = options.pauseGameplay ?? false;

  if (pauseGameplay && scene.physics && scene.physics.world) {
    scene._isSceneTransitioning = true;
    scene.physics.world.pause();
    if (scene.anims) {
      scene.anims.pauseAll();
    }
  }

  scene.cameras.main.fadeIn(duration, 0, 0, 0);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
    if (pauseGameplay && scene.physics && scene.physics.world) {
      scene.physics.world.resume();
      if (scene.anims) {
        scene.anims.resumeAll();
      }
    }
    scene._isSceneTransitioning = false;
  });
}

export function fadeToScene(scene, targetKey, data = undefined, duration = 350) {
  if (scene._isSceneTransitioning) {
    return;
  }

  scene._isSceneTransitioning = true;
  if (scene.physics && scene.physics.world) {
    scene.physics.world.pause();
  }
  if (scene.anims) {
    scene.anims.pauseAll();
  }
  if (scene.input) {
    scene.input.enabled = false;
  }

  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(targetKey, data);
  });
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
}

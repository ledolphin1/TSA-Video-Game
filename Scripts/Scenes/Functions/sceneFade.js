import * as Phaser from "phaser";

const SCARY_MUSIC_SCENES = new Set(["overworld", "arcade_exterior", "codeSpooky"]);
const LEVEL_MUSIC_SCENES = new Set(["MainScene", "LevelTwo"]);
const BOSS_MUSIC_SCENES = new Set(["boss", "dragonBoss"]);

function getMusicGroup(sceneKey) {
  if (SCARY_MUSIC_SCENES.has(sceneKey)) {
    return "scary";
  }
  if (LEVEL_MUSIC_SCENES.has(sceneKey)) {
    return "level";
  }
  if (BOSS_MUSIC_SCENES.has(sceneKey)) {
    return "boss";
  }
  return null;
}

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

export function fadeToScene(scene, targetKey, data = undefined, duration = 350, options = {}) {
  if (scene._isSceneTransitioning) {
    return;
  }

  const sourceMusicGroup = getMusicGroup(scene.scene.key);
  const targetMusicGroup = getMusicGroup(targetKey);
  const shouldFadeMusic = sourceMusicGroup && sourceMusicGroup !== targetMusicGroup;
  const transitionDuration = shouldFadeMusic ? Math.max(duration, 1000) : duration;

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

  const noVisualFade = options.noVisualFade === true;
  if (noVisualFade) {
    scene.scene.start(targetKey, data);
    return;
  }

  if (shouldFadeMusic && scene.music && scene.music.isPlaying && scene.tweens) {
    const originalVolume = scene.music.volume;
    scene.tweens.add({
      targets: scene.music,
      volume: 0,
      duration: 1000,
      ease: "Linear",
      onComplete: () => {
        if (scene.music && scene.music.isPlaying) {
          scene.music.stop();
        }
        if (scene.music) {
          scene.music.volume = originalVolume;
        }
      }
    });
  }

  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(targetKey, data);
  });
  scene.cameras.main.fadeOut(transitionDuration, 0, 0, 0);
}

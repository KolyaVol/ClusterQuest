import * as PIXI from "pixi.js";

type DisplayObject = PIXI.Graphics | PIXI.Text | PIXI.Container;

interface AnimationState {
  object: DisplayObject;
  startTime: number;
  duration: number;
  startValue: number;
  endValue: number;
  property: "scale" | "alpha";
  easing: (t: number) => number;
}

interface DelayedAnimation {
  object: DisplayObject;
  delay: number;
  startTime: number;
  duration: number;
  startScale: number;
  endScale: number;
  easing: (t: number) => number;
}

export class AnimationManager {
  private app: PIXI.Application;
  private animations: Set<AnimationState> = new Set();
  private pulseAnimations: Map<DisplayObject, PulseState> = new Map();
  private delayedAnimations: Set<DelayedAnimation> = new Set();

  constructor(app: PIXI.Application) {
    this.app = app;
    this.app.ticker.add(this.tick, this);
  }

  private tick(): void {
    const currentTime = performance.now();

    this.delayedAnimations.forEach((delayed) => {
      const elapsed = currentTime - delayed.startTime;
      if (elapsed >= delayed.delay) {
        this.animateScaleIn(
          delayed.object,
          delayed.duration,
          delayed.startScale,
          delayed.endScale,
          delayed.easing,
        );
        this.delayedAnimations.delete(delayed);
      }
    });

    this.animations.forEach((anim) => {
      const elapsed = currentTime - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);
      const eased = anim.easing(progress);
      const value = anim.startValue + (anim.endValue - anim.startValue) * eased;

      if (anim.property === "scale") {
        anim.object.scale.set(value);
      } else {
        anim.object.alpha = value;
      }

      if (progress >= 1) {
        if (anim.property === "scale") {
          anim.object.scale.set(anim.endValue);
        } else {
          anim.object.alpha = anim.endValue;
        }
        this.animations.delete(anim);
      }
    });

    this.pulseAnimations.forEach((pulse, object) => {
      const elapsed = (currentTime - pulse.startTime) % pulse.duration;
      const progress = Math.sin((elapsed / pulse.duration) * Math.PI * 2);
      const scale =
        pulse.minScale +
        (pulse.maxScale - pulse.minScale) * (progress * 0.5 + 0.5);
      object.scale.set(scale);
    });
  }

  animateScaleIn(
    object: DisplayObject,
    duration: number = 300,
    startScale: number = 0,
    endScale: number = 1,
    easing: (t: number) => number = easeOutBack,
  ): void {
    object.scale.set(startScale);
    object.alpha = 0;

    this.animations.add({
      object,
      startTime: performance.now(),
      duration,
      startValue: startScale,
      endValue: endScale,
      property: "scale",
      easing,
    });

    this.animations.add({
      object,
      startTime: performance.now(),
      duration,
      startValue: 0,
      endValue: 1,
      property: "alpha",
      easing,
    });
  }

  animatePulse(
    object: DisplayObject,
    minScale: number = 0.95,
    maxScale: number = 1.05,
    duration: number = 1000,
  ): () => void {
    this.pulseAnimations.set(object, {
      startTime: performance.now(),
      minScale,
      maxScale,
      duration,
    });

    return () => {
      this.pulseAnimations.delete(object);
      object.scale.set(1);
    };
  }

  animateFadeOut(object: DisplayObject, duration: number = 200): void {
    const startAlpha = object.alpha;
    this.animations.add({
      object,
      startTime: performance.now(),
      duration,
      startValue: startAlpha,
      endValue: 0,
      property: "alpha",
      easing: (t) => t,
    });
  }

  animateScaleInDelayed(
    object: DisplayObject,
    delay: number,
    duration: number = 300,
    startScale: number = 0,
    endScale: number = 1,
    easing: (t: number) => number = easeOutBack,
  ): void {
    this.delayedAnimations.add({
      object,
      delay,
      startTime: performance.now(),
      duration,
      startScale,
      endScale,
      easing,
    });
  }

  destroy(): void {
    this.app.ticker.remove(this.tick, this);
    this.animations.clear();
    this.pulseAnimations.clear();
    this.delayedAnimations.clear();
  }
}

interface PulseState {
  startTime: number;
  minScale: number;
  maxScale: number;
  duration: number;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

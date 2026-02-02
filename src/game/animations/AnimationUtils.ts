import * as PIXI from "pixi.js";

type DisplayObject = PIXI.Graphics | PIXI.Container;

interface ScaleInOptions {
  duration?: number;
  startScale?: number;
  endScale?: number;
  easing?: (t: number) => number;
  animateAlpha?: boolean;
  startAlpha?: number;
  endAlpha?: number;
}

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
  options: ScaleInOptions;
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
        this.animateScaleIn(delayed.object, delayed.options);
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

  animateScaleIn(object: DisplayObject, options: ScaleInOptions = {}): void {
    const {
      duration = 300,
      startScale = 0,
      endScale = 1,
      easing = easeOutBack,
      animateAlpha = true,
      startAlpha = 0,
      endAlpha = 1,
    } = options;

    const targetScale =
      object.scale.x !== 1 && endScale === 1 ? object.scale.x : endScale;

    object.scale.set(startScale);

    this.animations.add({
      object,
      startTime: performance.now(),
      duration,
      startValue: startScale,
      endValue: targetScale,
      property: "scale",
      easing,
    });

    if (animateAlpha) {
      object.alpha = startAlpha;
      this.animations.add({
        object,
        startTime: performance.now(),
        duration,
        startValue: startAlpha,
        endValue: endAlpha,
        property: "alpha",
        easing,
      });
    }
  }

  animateScaleTo(
    object: DisplayObject,
    startScale: number,
    endScale: number,
    duration: number = 120,
    easing: (t: number) => number = (t) => t,
  ): void {
    object.scale.set(startScale);

    this.animations.add({
      object,
      startTime: performance.now(),
      duration,
      startValue: startScale,
      endValue: endScale,
      property: "scale",
      easing,
    });
  }

  animatePulse(
    object: DisplayObject,
    minScale: number = 0.95,
    maxScale: number = 1.05,
    duration: number = 1000,
  ): () => void {
    const baseScale = object.scale.x === 0 ? 1 : object.scale.x;

    this.pulseAnimations.set(object, {
      startTime: performance.now(),
      minScale: minScale * baseScale,
      maxScale: maxScale * baseScale,
      duration,
    });

    return () => {
      this.pulseAnimations.delete(object);
      object.scale.set(baseScale);
    };
  }

  hideNotClusters(
    object: DisplayObject,
    duration: number = 200,
    targetAlpha: number = 0.5,
  ): () => void {
    const baseAlpha = object.alpha;

    this.animations.add({
      object,
      startTime: performance.now(),
      duration,
      startValue: baseAlpha,
      endValue: targetAlpha,
      property: "alpha",
      easing: (t) => t,
    });

    return () => {
      this.animations.add({
        object,
        startTime: performance.now(),
        duration,
        startValue: object.alpha,
        endValue: baseAlpha,
        property: "alpha",
        easing: (t) => t,
      });
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
    options: ScaleInOptions = {},
  ): void {
    this.delayedAnimations.add({
      object,
      delay,
      startTime: performance.now(),
      options,
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

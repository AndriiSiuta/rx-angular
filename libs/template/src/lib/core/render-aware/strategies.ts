import { coalesce, CoalesceConfig } from '../operators';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import {
  ChangeDetectorRef,
  ɵdetectChanges as detectChanges,
  ɵmarkDirty as markDirty
} from '@angular/core';
import { isViewEngineIvy } from '../utils';
import { getZoneUnPatchedPromiseDurationSelector } from './promise-duration-selector';
import { tap } from 'rxjs/operators';

export interface StrategySelection<U> {
  [strategy: string]: RenderStrategy<U>;
}

export interface RenderStrategyFactoryConfig {
  cdRef: ChangeDetectorRef;
}

export interface RenderStrategy<T> {
  behaviour: () => MonoTypeOperatorFunction<T>;
  render: () => void;
  name: string;
}

export const DEFAULT_STRATEGY_NAME = 'global';
export const IS_VIEW_ENGINE_IVY = isViewEngineIvy();

export function getStrategies<T>(
  config: RenderStrategyFactoryConfig
): { [strategy: string]: RenderStrategy<T> } {
  return {
    noop: createNoopStrategy<T>(),
    native: createNativeStrategy<T>(config),
    global: createGlobalStrategy<T>(config),
    local: createLocalStrategy<T>(config),
    detach: createDetachStrategy<T>(config)
  };
}

/**
 * Strategies
 *
 * - VE/I - Options for ViewEngine / Ivy
 * - mFC - `cdRef.markForCheck`
 * - dC - `cdRef.detectChanges`
 * - ɵMD - `ɵmarkDirty`
 * - ɵDC - `ɵdetectChanges`
 * - LV  - `LView`
 * - C - `Component`
 *
 * | Name        | ZoneLess VE/I | Render Method VE/I  | Coalescing VE/I  |
 * |-------------| --------------| ------------------- | ---------------- |
 * | `native`    | ❌/❌          | mFC / mFC           | ❌               |
 * | `global`    | ❌/✔️       | mFC  / ɵMD          | ❌                |
 * | `local`     | ✔️/✔️    | dC / ɵDC            | ✔️ + C/ LV     |
 * | `noop`      | ❌/❌          | no rendering        | ❌               |
 *
 */

/**
 * Native Strategy
 * @description
 *
 * This strategy mirrors Angular's built-in `async` pipe.
 * This means for every emitted value `ChangeDetectorRef#markForCheck` is called.
 *
 * | Name        | ZoneLess VE/I | Render Method VE/I  | Coalescing VE/I  |
 * |-------------| --------------| ------------ ------ | ---------------- |
 * | `native`    | ❌/❌         | mFC / mFC           | ❌               |
 *
 * @param config { RenderStrategyFactoryConfig } - The values this strategy needs to get calculated.
 * @return {RenderStrategy<T>} - The calculated strategy
 *
 */
export function createNativeStrategy<T>(
  config: RenderStrategyFactoryConfig
): RenderStrategy<T> {
  return {
    render: (): void => config.cdRef.markForCheck(),
    behaviour: () => o => o,
    name: 'native'
  };
}

/**
 * Noop Strategy
 *
 * This strategy is does nothing. It serves for debugging only
 *
 * | Name        | ZoneLess VE/I | Render Method VE/I  | Coalescing VE/I  |
 * |-------------| --------------| ------------ ------ | ---------------- |
 * | `noop`      | ❌/❌         | no rendering        | ❌               |
 *
 * @param config { RenderStrategyFactoryConfig } - The values this strategy needs to get calculated.
 * @return {RenderStrategy<T>} - The calculated strategy
 *
 */
export function createNoopStrategy<T>(): RenderStrategy<T> {
  return {
    render: (): void => {},
    behaviour: () => o => o,
    name: 'noop'
  };
}

/**
 *
 * Global Strategy
 *
 * This strategy is rendering the application root and
 * all it's children that are on a path
 * that is marked as dirty or has components with `ChangeDetectionStrategy.Default`.
 *
 * | Name        | ZoneLess VE/I | Render Method VE/I  | Coalescing VE/I  |
 * |-------------| --------------| ------------ ------ | ---------------- |
 * | `global`    | ❌/✔️         | mFC / ɵMD           | ❌               |
 *
 * @param config { RenderStrategyFactoryConfig } - The values this strategy needs to get calculated.
 * @return {RenderStrategy<T>} - The calculated strategy
 *
 */
export function createGlobalStrategy<T>(
  config: RenderStrategyFactoryConfig
): RenderStrategy<T> {
  function render() {
    if (!IS_VIEW_ENGINE_IVY) {
      config.cdRef.markForCheck();
    } else {
      markDirty((config.cdRef as any).context);
    }
  }

  const behaviour = () => (o$: Observable<T>): Observable<T> => o$;

  return {
    behaviour,
    render,
    name: 'global'
  };
}

/**
 *  Local Strategy
 *
 * This strategy is rendering the actual component and
 * all it's children that are on a path
 * that is marked as dirty or has components with `ChangeDetectionStrategy.Default`.
 *
 * As detectChanges has no coalescing of render calls
 * like `ChangeDetectorRef#markForCheck` or `ɵmarkDirty` has, so we have to apply our own coalescing, 'scoped' on component level.
 *
 * Coalescing, in this very manner,
 * means **collecting all events** in the same [EventLoop](https://developer.mozilla.org/de/docs/Web/JavaScript/EventLoop) tick,
 * that would cause a re-render and execute **re-rendering only once**.
 *
 * 'Scoped' coalescing, in addition, means **grouping the collected events by** a specific context.
 * E. g. the **component** from which the re-rendering was initiated.
 *
 * | Name        | ZoneLess VE/I | Render Method VE/I  | Coalescing VE/I  |
 * |-------------| --------------| ------------ ------ | ---------------- |
 * | `local`     | ✔️/✔️          | dC / ɵDC            | ✔️ + C/ LV       |
 *
 * @param config { RenderStrategyFactoryConfig } - The values this strategy needs to get calculated.
 * @return {RenderStrategy<T>} - The calculated strategy
 *
 */
export function createLocalStrategy<T>(
  config: RenderStrategyFactoryConfig
): RenderStrategy<T> {
  const durationSelector = getZoneUnPatchedPromiseDurationSelector();
  // @Notice this part of the code is in the coalescing PR https://github.com/ngrx/platform/pull/2456
  //const coalesceConfig: CoalesceConfig
  const coalesceConfig: any = {
    // @TODO ensure that context is === to _lView across class and template (all cases!!!)
    // If yes, kick out _lView
    context: (IS_VIEW_ENGINE_IVY
      ? (config.cdRef as any)._lView
      : (config.cdRef as any).context) as any
  };

  function render() {
    config.cdRef.detectChanges();
  }

  const behaviour = () => (o$: Observable<T>): Observable<T> => {
    return o$.pipe(coalesce(durationSelector, coalesceConfig));
  };

  return {
    behaviour,
    render,
    name: 'local'
  };
}

/**
 *  Detach Strategy
 *
 * This strategy is rendering the actual component and
 * all it's children that are on a path
 * that is marked as dirty or has components with `ChangeDetectionStrategy.Default`.
 *
 * As detectChanges has no coalescing of render calls
 * like `ChangeDetectorRef#markForCheck` or `ɵmarkDirty` has, so we have to apply our own coalescing, 'scoped' on component level.
 *
 * Coalescing, in this very manner,
 * means **collecting all events** in the same [EventLoop](https://developer.mozilla.org/de/docs/Web/JavaScript/EventLoop) tick,
 * that would cause a re-render and execute **re-rendering only once**.
 *
 * 'Scoped' coalescing, in addition, means **grouping the collected events by** a specific context.
 * E. g. the **component** from which the re-rendering was initiated.
 *
 * | Name        | ZoneLess VE/I | Render Method VE/I  | Coalescing VE/I  |
 * |-------------| --------------| ------------ ------ | ---------------- |
 * | `detach`     | ✔️/✔️          | dC / ɵDC            | ✔️ + C/ LV       |
 *
 * @param config { RenderStrategyFactoryConfig } - The values this strategy needs to get calculated.
 * @return {RenderStrategy<T>} - The calculated strategy
 *
 */
export function createDetachStrategy<T>(
  config: RenderStrategyFactoryConfig
): RenderStrategy<T> {
  const durationSelector = getZoneUnPatchedPromiseDurationSelector();
  const coalesceConfig: CoalesceConfig = {
    // @TODO ensure that context is === to _lView across class and template (all cases!!!)
    // If yes, kick out _lView
    context: (IS_VIEW_ENGINE_IVY
      ? (config.cdRef as any)._lView
      : (config.cdRef as any).context) as any
  };

  function render() {
    // @TODO ensure that detectChanges is behaves identical to ɵdetectChanges
    // If yes, kick out ɵdetectChanges
    config.cdRef.reattach();
    if (!IS_VIEW_ENGINE_IVY) {
      config.cdRef.detectChanges();
    } else {
      detectChanges((config.cdRef as any).context);
    }
    config.cdRef.detach();
  }

  const behaviour = () => (o$: Observable<T>): Observable<T> => {
    return o$.pipe(coalesce(durationSelector, coalesceConfig));
  };

  return {
    behaviour,
    render,
    name: 'detach'
  };
}

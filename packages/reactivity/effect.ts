import { Dep, createDep } from './dep'

// targetのkeyと作用のマップ
type KeyToDepMap = Map<any, Dep>
// あるtargetのkeyとdepのマッピング
// targetをキーとしたそのオブジェクトのプロパティごとの依存関係のマップ
/*
targetMap = {
  target: {
    count: fn()
    isActive : fn()
  }
}
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    // ※ fnを実行する前のactiveEffectを保持しておいて、実行が終わった後元に戻します。
    // これをやらないと、どんどん上書きしてしまって、意図しない挙動をしてしまいます。(用が済んだら元に戻そう)
    let parent: ReactiveEffect | undefined = activeEffect
    activeEffect = this
    const res = this.fn()
    activeEffect = parent
    return res
  }
}

/**
 * @param {object}  [target] - リアクティブにしたいオブジェクト
 * @param {unknown} [key] - リアクティブにしたいオブジェクトのあるプロパティ
 */
// 指定されたtargetとkeyに対するdep（プロパティが変更された際に実行したい関数群）を作成する
export function track(target: object, key: unknown) {
  // targetに対応する依存関係のマップが登録されているか確認する
  let depsMap = targetMap.get(target)
  // 登録されていなければtargetMapに空のマップを登録する
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  // 依存関係のマップからkeyに対応するdepを取得する
  let dep = depsMap.get(key)
  // 対応するdepがなければ新しいdepを作成して登録する
  // その際、depはまだ空のSetオブジェクトである
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  // 現在アクティブなエフェクトが存在すればそれをdepに追加する
  if (activeEffect) {
    dep.add(activeEffect)
  }
}

// TargetMapから作用を取り出して実行する関数
export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)

  if (dep) {
    const effects = [...dep]
    for (const effect of effects) {
      effect.run()
    }
  }
}

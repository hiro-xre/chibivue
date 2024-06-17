export const Text = Symbol()

export type VNodeTypes = string | typeof Text

export interface VNode {
  type: VNodeTypes
  props: VNodeProps | null
  children: VNodeNormalizedChildren
}

export interface VNodeProps {
  [key: string]: any
}

// normalize後の型
export type VNodeNormalizedChildren = string | VNodeArrayChildren
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren
type VNodeChildAtom = VNode | string

export function createVNode(
  type: VNodeTypes,
  props: VNodeProps | null,
  children: VNodeNormalizedChildren,
): VNode {
  const vnode: VNode = { type, props, children }
  return vnode
}

// normalize 関数を実装。(renderer.tsで使う)
export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return { ...child } as VNode;
  } else {
    // stringだった場合に先ほど紹介した扱いたい形に変換する
    return createVNode(Text, null, String(child));
  }
}
